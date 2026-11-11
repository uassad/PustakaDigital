"""Autentikasi berbasis JWT (Bearer token di header Authorization).

KEAMANAN:
- Algoritma DIKUNCI lewat konfigurasi (`algorithms=[...]`) -> kebal serangan "alg: none" / algorithm confusion.
- Klaim wajib: exp, iat, nbf, sub, iss, aud. Token tanpa klaim ini ditolak.
- Masa berlaku pendek (default 30 menit).
- Token HANYA berisi id pengguna (sub). Role TIDAK dipercaya dari token: selalu dibaca dari DB pada
  tiap request, sehingga perubahan role / penghapusan akun langsung berlaku.
- Pesan error 401 seragam (tidak membocorkan apakah token kedaluwarsa / palsu / user hilang).
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pengguna import Pengguna
from configuration.database_session import get_db
from configuration.settings import settings

bearer_scheme = HTTPBearer(auto_error=False, scheme_name="JWT")


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Autentikasi diperlukan atau token tidak valid.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def create_access_token(user_id: uuid.UUID) -> tuple[str, int]:
    """Mengembalikan (token, expires_in_detik)."""
    now = datetime.now(timezone.utc)
    ttl = timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user_id),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "iat": now,
        "nbf": now,
        "exp": now + ttl,
        "jti": uuid.uuid4().hex,      # id unik token (siap dipakai bila nanti butuh denylist/revocation)
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, int(ttl.total_seconds())


def decode_access_token(token: str) -> uuid.UUID:
    try:
        claims = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],           # whitelist algoritma, bukan dari header token
            audience=settings.jwt_audience,
            issuer=settings.jwt_issuer,
            options={"require": ["exp", "iat", "nbf", "sub", "iss", "aud"]},
            leeway=5,
        )
        return uuid.UUID(claims["sub"])
    except (jwt.PyJWTError, ValueError, KeyError):
        raise _unauthorized() from None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Pengguna:
    """Dependency: pengguna yang sedang login (dengan role dari DB)."""
    user = await _get_authenticated_user(credentials, db)
    if user.account_status == "beku":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun administrator dibekukan. Hubungi tim IT untuk pembukaan manual.",
        )
    return user


async def get_current_user_for_profile(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Pengguna:
    """Allow a frozen user to read only their account status for the dashboard notice."""
    return await _get_authenticated_user(credentials, db)


async def _get_authenticated_user(
    credentials: Optional[HTTPAuthorizationCredentials],
    db: AsyncSession,
) -> Pengguna:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized()
    return await get_authenticated_user_from_token(credentials.credentials, db)


async def get_authenticated_user_from_token(token: str, db: AsyncSession) -> Pengguna:
    """Resolve a signed access token to its current database user."""
    user_id = decode_access_token(token)
    user = (await db.execute(select(Pengguna).where(Pengguna.id_pengguna == user_id))).scalar_one_or_none()
    if user is None:
        raise _unauthorized()
    return user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[Pengguna]:
    """Dependency opsional: mengembalikan Pengguna jika header Authorization Bearer valid,
    atau None jika tidak ada kredensial (Guest). Endpoint publik dapat memakai ini untuk
    menampilkan status favorit personal jika pengguna telah login."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None
    try:
        user_id = decode_access_token(credentials.credentials)
        user = (await db.execute(select(Pengguna).where(Pengguna.id_pengguna == user_id))).scalar_one_or_none()
        return user if user is not None and user.account_status != "beku" else None
    except HTTPException:
        return None
