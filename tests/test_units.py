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
    short_email_name = {
        **ok,
        "username": "reader_1",
        "email": "s@gmail.com",
        "password": "uasSAD-Long-123!",
    }
    assert UserRegister(**short_email_name).email == "s@gmail.com"
    with pytest.raises(ValidationError):
        UserRegister(
            **{
                **short_email_name,
                "email": "sad@gmail.com",
                "password": "sad-Long-123!",
            }
        )
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


def test_registration_otp_schema_and_simulated_sms_delivery(secure_env, monkeypatch):
    pytest.importorskip("pydantic_settings")
    import asyncio
    import uuid
    from pydantic import ValidationError
    from app.schemas.user import UserRegister
    from app.services import registration_otp

    phone_registration = UserRegister(
        username="reader_2",
        email="reader@example.com",
        nomor_telepon="+628123456789",
        password="Unrelated-Password-123!",
        verification_method="phone",
    )
    sent = []
    monkeypatch.setattr(registration_otp, "_deliver_message", lambda *args: sent.append(args))
    asyncio.run(registration_otp._send_otp(phone_registration, "012345"))

    assert sent[0][0] == "sms-628123456789@sms.local"
    assert "[SIMULASI SMS]" in sent[0][1]
    assert "012345" in sent[0][2]
    challenge_id = uuid.uuid4()
    assert registration_otp._otp_digest(challenge_id, "012345") == registration_otp._otp_digest(
        challenge_id, "012345"
    )
    assert registration_otp._otp_digest(challenge_id, "012345") != registration_otp._otp_digest(
        challenge_id, "012346"
    )

    with pytest.raises(ValidationError):
        UserRegister(
            username="reader_3",
            email="reader3@example.com",
            password="Unrelated-Password-123!",
            verification_method="phone",
        )


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


def test_anti_broken_access_control(secure_env):
    """OWASP Top 10: 2025 - A01: Broken Access Control (BOLA/IDOR Prevention)."""
    import uuid
    from unittest.mock import MagicMock
    from fastapi import HTTPException
    from configuration.authorization import ROLE_ADMIN, ROLE_READER, verify_user_access

    # Mock user A (Authenticated User)
    user_a = MagicMock()
    user_a.id_pengguna = uuid.uuid4()
    user_a.role = MagicMock()
    user_a.role.role_name = ROLE_READER

    # Mock user B (Different user)
    user_b_id = uuid.uuid4()

    # Mock Admin user
    admin_user = MagicMock()
    admin_user.id_pengguna = uuid.uuid4()
    admin_user.role = MagicMock()
    admin_user.role.role_name = ROLE_ADMIN

    # 1. User mengakses resource miliknya sendiri -> DIIZINKAN
    verify_user_access(user_a, user_a.id_pengguna)

    # 2. User A mengakses resource milik User B -> DITOLAK (403 FORBIDDEN)
    with pytest.raises(HTTPException) as exc:
        verify_user_access(user_a, user_b_id)
    assert exc.value.status_code == 403
    assert "Akses ditolak" in exc.value.detail

    # 3. Administrator mengakses data User B (allow_admin=True) -> DIIZINKAN
    verify_user_access(admin_user, user_b_id, allow_admin=True)

    # 4. Administrator mengakses data User B (strict mode allow_admin=False) -> DITOLAK (403)
    with pytest.raises(HTTPException) as exc:
        verify_user_access(admin_user, user_b_id, allow_admin=False)
    assert exc.value.status_code == 403


def test_isbn13_validation_and_anti_path_traversal():
    """Validasi format ISBN-13 dan penolakan injeksi Path Traversal."""
    from app.schemas.book import clean_and_validate_isbn13

    # ISBN-13 valid (Clean Code: 9780132350884)
    assert clean_and_validate_isbn13("9780132350884") == "9780132350884"
    assert clean_and_validate_isbn13("978-0-13-235088-4") == "9780132350884"

    # Check digit salah
    with pytest.raises(ValueError, match="Check-digit"):
        clean_and_validate_isbn13("9780132350885")

    # Prefix salah (bukan 978 / 979)
    with pytest.raises(ValueError):
        clean_and_validate_isbn13("1234567890123")

    # Serangan Path Traversal ditolak oleh validator
    for traversal in ("../../etc/passwd", "..\\..\\boot.ini", "9780132350884/../../test", ""):
        with pytest.raises(ValueError):
            clean_and_validate_isbn13(traversal)


def test_book_search_query_dos_prevention():
    """Validasi parameter query pencarian buku untuk mencegah DoS dan Mass-Assignment."""
    from pydantic import ValidationError
    from app.schemas.book import BookSearchQuery

    # Valid query
    q = BookSearchQuery(q="keamanan sistem", page=1, page_size=20)
    assert q.q == "keamanan sistem"
    assert q.page == 1
    assert q.page_size == 20

    # Batas page_size maksimal 50 (anti memory exhaustion DoS)
    with pytest.raises(ValidationError):
        BookSearchQuery(page_size=51)

    # Halaman tidak boleh negatif atau 0
    with pytest.raises(ValidationError):
        BookSearchQuery(page=0)

    # Mass assignment / parameter tak dikenal ditolak (extra='forbid')
    with pytest.raises(ValidationError):
        BookSearchQuery(unknown_field="injeksi")
