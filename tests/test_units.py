"""Tes unit untuk logika keamanan murni. Jalankan dari app_project:  pytest -q"""
import os
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


@pytest.fixture(scope="module")
def secure_env():
    os.environ.update(
        DATABASE_URL="postgresql+asyncpg://u:p@localhost/db",
        JWT_SECRET_KEY="k" * 48, PASSWORD_PEPPER="p" * 48,
    )


def test_register_schema_rejects_mass_assignment_and_weak_password(secure_env):
    pytest.importorskip("email_validator")
    from pydantic import ValidationError
    from app.schemas.user import UserRegister

    ok = dict(username="alice_1", email="Alice@Example.com", password="Sangat-Kuat-123!")
    assert UserRegister(**ok).email == "alice@example.com"
    for bad in (
        {**ok, "role_id": "00000000-0000-0000-0000-000000000000"},   # mass-assignment
        {**ok, "role": "Administrator"},
        {**ok, "password": "pendek1A!"},
        {**ok, "password": "semuahurufkecilpanjang"},
        {**ok, "username": "a b"},
        {**ok, "username": "x" * 31},
        {**ok, "password": "alice_1-Alice_1-!!"},                     # mengandung username
    ):
        with pytest.raises(ValidationError):
            UserRegister(**bad)


def test_password_hash_roundtrip(secure_env):
    pytest.importorskip("argon2")
    pytest.importorskip("starlette")
    pytest.importorskip("pydantic_settings")
    from configuration import salt_and_pepper as sp

    h = sp.hash_password("Sangat-Kuat-123!")
    assert h.startswith("$argon2id$")                                 # lolos CHECK constraint di DB
    assert sp.verify_password(h, "Sangat-Kuat-123!") is True
    assert sp.verify_password(h, "salah") is False
    assert sp.verify_password(None, "apa-saja") is False              # user tak ada -> tetap False (dan tetap memakan waktu)


def test_jwt_rules(secure_env):
    pytest.importorskip("fastapi")
    pytest.importorskip("sqlalchemy")
    pytest.importorskip("pydantic_settings")
    import uuid
    import jwt
    from fastapi import HTTPException
    from configuration.authentication import create_access_token, decode_access_token
    from configuration.settings import settings

    uid = uuid.uuid4()
    token, ttl = create_access_token(uid)
    assert decode_access_token(token) == uid and ttl == settings.access_token_expire_minutes * 60

    none_alg = jwt.encode({"sub": str(uid)}, key="", algorithm="none")
    wrong_key = jwt.encode({"sub": str(uid)}, "z" * 48, algorithm="HS256")
    for bad in (none_alg, wrong_key, "bukan.token.sama-sekali", ""):
        with pytest.raises(HTTPException) as e:
            decode_access_token(bad)
        assert e.value.status_code == 401


def test_rate_limiter(secure_env):
    pytest.importorskip("fastapi")
    import asyncio
    from configuration.rate_limiter import SlidingWindowLimiter

    async def run():
        lim = SlidingWindowLimiter()
        assert [await lim.hit("k", 3, 60) for _ in range(3)] == [None, None, None]
        assert (await lim.hit("k", 3, 60)) is not None               # ke-4 ditolak
        assert (await lim.hit("lain", 3, 60)) is None                # key lain tidak terpengaruh

    asyncio.run(run())
