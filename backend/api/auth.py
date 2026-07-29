from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.deps import get_current_user, require_csrf
from core.limiter import limiter
from core.security import (
    REFRESH_COOKIE,
    clear_auth_cookies,
    create_access_token,
    generate_csrf_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    refresh_token_expiry,
    set_auth_cookies,
    verify_password,
)
from db.session import get_db
from models.refresh_token import RefreshToken
from models.user import User
from schemas.user import UserCreate, UserLogin, UserPublic, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])


async def _issue_session(response: Response, db: AsyncSession, user: User, request: Request) -> None:
    access_token = create_access_token(user.id)
    raw_refresh = generate_refresh_token()

    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_refresh_token(raw_refresh),
            expires_at=refresh_token_expiry(),
            user_agent=(request.headers.get("user-agent") or "")[:255],
        )
    )
    await db.commit()

    set_auth_cookies(response, access_token, raw_refresh, generate_csrf_token())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
    response: Response,
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> User:
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(email=payload.email, password_hash=hash_password(payload.password), name=payload.name)
    db.add(user)
    await db.flush()

    await _issue_session(response, db, user, request)
    await db.refresh(user)
    return user


@router.post("/login", response_model=UserPublic)
@limiter.limit("10/minute")
async def login(
    request: Request,
    response: Response,
    payload: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> User:
    user = await db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    await _issue_session(response, db, user, request)
    return user


@router.post("/refresh", response_model=UserPublic)
@limiter.limit("20/minute")
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_csrf),
) -> User:
    raw_token = request.cookies.get(REFRESH_COOKIE)
    if not raw_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token_hash = hash_refresh_token(raw_token)
    stored = await db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))

    if stored is None or stored.revoked_at is not None or stored.expires_at < datetime.now(timezone.utc):
        clear_auth_cookies(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

    stored.revoked_at = datetime.now(timezone.utc)

    user = await db.get(User, stored.user_id)
    if user is None:
        await db.commit()
        clear_auth_cookies(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    await _issue_session(response, db, user, request)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_csrf),
) -> None:
    raw_token = request.cookies.get(REFRESH_COOKIE)
    if raw_token:
        token_hash = hash_refresh_token(raw_token)
        stored = await db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
        if stored is not None and stored.revoked_at is None:
            stored.revoked_at = datetime.now(timezone.utc)
            await db.commit()

    clear_auth_cookies(response)


@router.get("/me", response_model=UserPublic)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me", response_model=UserPublic)
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_csrf),
) -> User:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)
    return current_user
