"""Logika login dan serialisasi pengguna."""
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pengguna import Pengguna
from app.schemas.user import UserLogin, UserPublic
from configuration.rate_limiter import enforce
from configuration.salt_and_pepper import hash_password_async, needs_rehash, verify_password_async

# Pesan SERAGAM untuk semua kegagalan login (anti user-enumeration).
_INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Username/email atau password salah.",
    headers={"WWW-Authenticate": "Bearer"},
)


def to_public(user: Pengguna) -> UserPublic:
    return UserPublic(
        id_pengguna=user.id_pengguna,
        username=user.username,
        email=user.email,
        nomor_telepon=user.nomor_telepon,
        email_verified=user.email_verified,
        phone_verified=user.phone_verified,
        role=user.role.role_name,
    )


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Pengguna | None:
    # populate_existing: muat ulang termasuk relasi `role` (objek baru belum punya relasi ter-load -> hindari lazy-load async).
    stmt = select(Pengguna).where(Pengguna.id_pengguna == user_id).execution_options(populate_existing=True)
    return (await db.execute(stmt)).scalar_one_or_none()


async def authenticate(db: AsyncSession, data: UserLogin) -> Pengguna:
    ident = data.identifier.lower()
    # Rate limit tambahan PER AKUN (selain per-IP di router) -> menahan brute-force terdistribusi.
    await enforce(f"login-id:{ident}", limit=8, window_seconds=600)

    stmt = select(Pengguna).where(or_(func.lower(Pengguna.username) == ident, func.lower(Pengguna.email) == ident))
    user = (await db.execute(stmt)).scalar_one_or_none()

    # verify_password_async SELALU menjalankan Argon2 (pakai hash palsu bila user tak ada) -> waktu respons seragam.
    ok = await verify_password_async(user.password if user else None, data.password)
    if not ok or user is None:
        raise _INVALID_CREDENTIALS

    if needs_rehash(user.password):                       # upgrade otomatis bila parameter Argon2 dinaikkan
        user.password = await hash_password_async(data.password)
        user.updated_by = user.id_pengguna
        await db.commit()
    return user
