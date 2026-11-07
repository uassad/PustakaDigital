"""Hashing password: Argon2id + salt (otomatis, unik per password) + pepper (rahasia aplikasi).

Alur:
    password --HMAC-SHA256(key=PEPPER)--> digest --Argon2id(salt acak)--> "$argon2id$..." -> kolom pengguna.password

- SALT   : dibuat acak oleh argon2-cffi dan tertanam di string hash.
- PEPPER : hanya ada di .env / secret manager, TIDAK pernah masuk database. Jika DB bocor,
           penyerang tidak bisa brute-force offline tanpa pepper.
- Pra-hash HMAC juga menghilangkan masalah panjang password & karakter NUL.
- Hasil hash berawalan '$argon2id$' sehingga lolos CHECK constraint `pengguna_password_is_argon2id`.
- Argon2 itu CPU/memori berat -> dijalankan di threadpool agar event loop tidak terblokir.
"""
import base64
import hashlib
import hmac
from functools import lru_cache
from typing import Optional

from argon2 import PasswordHasher, Type
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from starlette.concurrency import run_in_threadpool

from configuration.settings import settings

# Parameter mengikuti rekomendasi OWASP/RFC 9106 (profil memori rendah): m=64MiB, t=3.
_hasher = PasswordHasher(
    time_cost=3,
    memory_cost=64 * 1024,   # KiB
    parallelism=2,
    hash_len=32,
    salt_len=16,
    type=Type.ID,
)

_PEPPER = settings.password_pepper.encode("utf-8")


def _apply_pepper(password: str) -> str:
    digest = hmac.new(_PEPPER, password.encode("utf-8"), hashlib.sha256).digest()
    return base64.b64encode(digest).decode("ascii")


def hash_password(password: str) -> str:
    return _hasher.hash(_apply_pepper(password))


@lru_cache
def _dummy_hash() -> str:
    # Hash palsu untuk menyamakan waktu respons saat user tidak ditemukan (anti user-enumeration via timing).
    return _hasher.hash(_apply_pepper("dummy-password-yang-tidak-pernah-dipakai"))


def verify_password(stored_hash: Optional[str], password: str) -> bool:
    """Selalu mengerjakan verifikasi Argon2 (walau user tidak ada) agar waktu respons seragam."""
    target = stored_hash or _dummy_hash()
    try:
        ok = _hasher.verify(target, _apply_pepper(password))
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False
    return ok and stored_hash is not None


def needs_rehash(stored_hash: str) -> bool:
    """True bila parameter Argon2 di hash lama sudah di bawah parameter saat ini."""
    try:
        return _hasher.check_needs_rehash(stored_hash)
    except InvalidHashError:
        return False


async def hash_password_async(password: str) -> str:
    return await run_in_threadpool(hash_password, password)


async def verify_password_async(stored_hash: Optional[str], password: str) -> bool:
    return await run_in_threadpool(verify_password, stored_hash, password)
