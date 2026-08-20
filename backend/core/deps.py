from __future__ import annotations

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import ACCESS_COOKIE, CSRF_COOKIE, CSRF_HEADER, csrf_matches, decode_access_token
from db.session import get_db
from models.user import User


def _bearer_token(request: Request) -> str | None:
    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        return auth_header[7:].strip() or None
    return None


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    # The native app shell can't rely on cookies for the access token (see
    # core/security.py) and sends it as a Bearer header instead; the web app
    # never sends that header, so it keeps working via cookie unchanged.
    token = _bearer_token(request) or request.cookies.get(ACCESS_COOKIE)
    user_id = decode_access_token(token) if token else None
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    return user


async def require_csrf(request: Request) -> None:
    # A Bearer-authenticated request can't be forged by a third-party site
    # the way an ambient cookie can (the attacker has no way to read or
    # attach the token), so double-submit CSRF protects nothing extra here.
    # If the token itself is invalid, get_current_user rejects it with 401
    # regardless of this check, so skipping it can't open a hole.
    if _bearer_token(request):
        return

    # Same reasoning, for the one other place a request carries its own
    # non-forgeable proof instead of an Authorization header: native's
    # cold-start call to /auth/refresh (see lib/api.js's hydrateNativeSession
    # + persistRefreshToken), sent before the app has ever obtained an
    # access token this process to use as Authorization instead. A forging
    # site can't read or attach this header either — it's not a cookie the
    # browser auto-sends — and an invalid/expired/revoked value is rejected
    # by /auth/refresh's own lookup regardless of this check. Scoped to this
    # one path specifically, since no other route ever expects this header.
    if request.url.path == "/auth/refresh" and request.headers.get("x-refresh-token"):
        return

    cookie_value = request.cookies.get(CSRF_COOKIE)
    header_value = request.headers.get(CSRF_HEADER)
    if not csrf_matches(cookie_value, header_value):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF token missing or invalid")
