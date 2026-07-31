from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Request, Response

from core.config import settings

_hasher = PasswordHasher()

ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"
CSRF_COOKIE = "csrf_token"
CSRF_HEADER = "x-csrf-token"


# --- Passwords -----------------------------------------------------------

def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False


# --- Access token (JWT) ---------------------------------------------------

def create_access_token(user_id: uuid.UUID) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def decode_access_token(token: str) -> uuid.UUID | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None


# --- Refresh token (opaque, stored hashed) --------------------------------

def generate_refresh_token() -> str:
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def refresh_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)


# --- CSRF (double-submit cookie) ------------------------------------------

def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)


def csrf_matches(cookie_value: str | None, header_value: str | None) -> bool:
    if not cookie_value or not header_value:
        return False
    return secrets.compare_digest(cookie_value, header_value)


# --- Cookies ----------------------------------------------------------------

def _request_is_secure(request: Request) -> bool:
    if request.url.scheme == "https":
        return True
    forwarded_proto = request.headers.get("x-forwarded-proto", "")
    return forwarded_proto.split(",")[0].strip().lower() == "https"


def _cookie_policy(request: Request) -> tuple[bool, str]:
    # Cross-origin clients (e.g. the Capacitor native shell, whose WKWebView
    # origin can never be changed from "capacitor://") need SameSite=None,
    # which browsers only honor over HTTPS. Same-site clients (the web app,
    # local http dev) get Lax so cookies still work without HTTPS. Detected
    # per-request (via the actual scheme, or an X-Forwarded-Proto from a
    # reverse proxy/tunnel) rather than a single global flag, so one backend
    # can correctly serve both at once. settings.COOKIE_SECURE remains a
    # manual override to force Secure/None even if that detection fails.
    secure = _request_is_secure(request) or settings.COOKIE_SECURE
    return secure, ("none" if secure else "lax")


def set_auth_cookies(
    request: Request, response: Response, access_token: str, refresh_token: str, csrf_token: str
) -> None:
    secure, samesite = _cookie_policy(request)
    common = dict(
        httponly=True,
        secure=secure,
        samesite=samesite,
        path="/",
    )
    response.set_cookie(
        ACCESS_COOKIE,
        access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **common,
    )
    response.set_cookie(
        REFRESH_COOKIE,
        refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        **{**common, "path": "/auth"},
    )
    response.set_cookie(
        CSRF_COOKIE,
        csrf_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=False,
        secure=secure,
        samesite=samesite,
        path="/",
    )
    # The CSRF cookie is host-scoped like any cookie, so a native app whose
    # own origin is a different host than the API (always true for
    # capacitor://localhost) can never read it back via document.cookie —
    # that's not a SameSite/Secure issue, cookies just aren't readable
    # cross-host, full stop. Also expose it as a response header, which the
    # client CAN read from a request it made itself, and cache it there.
    response.headers[CSRF_HEADER] = csrf_token

    # Same underlying problem affects the access_token cookie itself, worse:
    # WKWebView's Intelligent Tracking Prevention was observed dropping even
    # httpOnly cookies set via a cross-origin JS-initiated request, so the
    # cookie can silently fail to persist even within the same app session.
    # Expose the raw token so the native client can hold it in memory and
    # send it as `Authorization: Bearer` instead of depending on the cookie.
    response.headers["X-Access-Token"] = access_token


def clear_auth_cookies(request: Request, response: Response) -> None:
    secure, samesite = _cookie_policy(request)
    response.delete_cookie(ACCESS_COOKIE, path="/", secure=secure, samesite=samesite)
    response.delete_cookie(REFRESH_COOKIE, path="/auth", secure=secure, samesite=samesite)
    response.delete_cookie(CSRF_COOKIE, path="/", secure=secure, samesite=samesite)
