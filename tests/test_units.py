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


def test_profile_update_and_account_deletion_schemas(secure_env):
    pytest.importorskip("pydantic_settings")
    from pydantic import ValidationError
    from app.schemas.user import AccountDeletion, UserProfileUpdate

    profile = UserProfileUpdate(
        username="reader_1",
        nomor_telepon="",
        current_password="Current-Password-123!",
    )
    assert profile.nomor_telepon is None

    for bad in (
        {"username": "bad name", "current_password": "Current-Password-123!"},
        {"username": "reader_1", "nomor_telepon": "invalid", "current_password": "secret"},
        {
            "username": "reader_1",
            "email": "new@example.com",
            "current_password": "Current-Password-123!",
        },
    ):
        with pytest.raises(ValidationError):
            UserProfileUpdate(**bad)

    with pytest.raises(ValidationError):
        AccountDeletion(password="")


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


def test_frozen_admin_auth_is_blocked_except_profile_status(secure_env, monkeypatch):
    pytest.importorskip("fastapi")
    import asyncio
    from types import SimpleNamespace
    from fastapi import HTTPException
    from fastapi.security import HTTPAuthorizationCredentials
    from configuration import authentication

    frozen_user = SimpleNamespace(account_status="beku")

    async def load_frozen_user(credentials, db):
        return frozen_user

    monkeypatch.setattr(authentication, "_get_authenticated_user", load_frozen_user)
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")

    with pytest.raises(HTTPException) as exc:
        asyncio.run(authentication.get_current_user(credentials, object()))
    assert exc.value.status_code == 403
    assert asyncio.run(authentication.get_current_user_for_profile(credentials, object())) is frozen_user


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


def test_upload_endpoint_requires_administrator_role(secure_env, monkeypatch):
    pytest.importorskip("fastapi")
    pytest.importorskip("httpx")
    from fastapi import HTTPException
    from fastapi.testclient import TestClient
    from types import SimpleNamespace
    from app.services import book_service
    from configuration.authentication import get_current_user
    from configuration.database_session import get_db
    from main import app

    async def provide_db():
        yield object()

    reader = SimpleNamespace(
        role=SimpleNamespace(role_name="Authenticated User"),
        account_status="normal",
    )
    admin = SimpleNamespace(
        id_pengguna="admin-id",
        role=SimpleNamespace(role_name="Administrator"),
        account_status="normal",
    )

    async def book_not_found(*args, **kwargs):
        raise HTTPException(status_code=404, detail="Buku tidak ditemukan.")

    async def provide_reader():
        return reader

    async def provide_admin():
        return admin

    app.dependency_overrides[get_db] = provide_db
    monkeypatch.setattr(book_service, "get_book_by_isbn", book_not_found)
    try:
        app.dependency_overrides[get_current_user] = provide_reader
        with TestClient(app, base_url="http://127.0.0.1") as client:
            denied = client.post(
                "/api/books/9780132350884/upload-files",
                files={"cover": ("cover.jpg", b"image", "image/jpeg")},
            )
            assert denied.status_code == 403

            app.dependency_overrides[get_current_user] = provide_admin
            allowed = client.post(
                "/api/books/9780132350884/upload-files",
                files={"cover": ("cover.jpg", b"image", "image/jpeg")},
            )
            assert allowed.status_code == 404
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)


def test_admin_session_cookie_is_server_authorized_and_cleared(secure_env, monkeypatch):
    pytest.importorskip("fastapi")
    pytest.importorskip("httpx")
    from fastapi.testclient import TestClient
    from types import SimpleNamespace
    from configuration.authentication import get_current_user
    from configuration.authorization import ADMIN_DASHBOARD_PATH, ADMIN_SESSION_COOKIE
    from configuration.database_session import get_db
    from main import app

    reader = SimpleNamespace(
        role=SimpleNamespace(role_name="Authenticated User"),
        account_status="normal",
    )
    admin = SimpleNamespace(
        role=SimpleNamespace(role_name="Administrator"),
        account_status="normal",
    )

    async def provide_db():
        yield object()

    async def provide_reader():
        return reader

    async def provide_admin():
        return admin

    app.dependency_overrides[get_db] = provide_db
    try:
        app.dependency_overrides[get_current_user] = provide_reader
        with TestClient(app, base_url="http://127.0.0.1") as client:
            denied = client.post("/api/auth/admin-session", headers={"Authorization": "Bearer reader-token"})
            assert denied.status_code == 403

            app.dependency_overrides[get_current_user] = provide_admin
            created = client.post("/api/auth/admin-session", headers={"Authorization": "Bearer admin-token"})
            assert created.status_code == 204
            cookie = created.headers["set-cookie"].lower()
            assert f"{ADMIN_SESSION_COOKIE.lower()}=admin-token" in cookie
            assert f"path={ADMIN_DASHBOARD_PATH.lower()}" in cookie
            assert "httponly" in cookie
            assert "samesite=strict" in cookie

            cleared = client.delete("/api/auth/admin-session")
            assert cleared.status_code == 204
            assert "max-age=0" in cleared.headers["set-cookie"].lower()
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)


def test_admin_dashboard_requires_cookie_and_administrator_role(secure_env, monkeypatch):
    from types import SimpleNamespace
    from fastapi import HTTPException
    from fastapi.testclient import TestClient
    from starlette.requests import Request
    from configuration import authorization
    from configuration.database_session import get_db
    from app.routers import pages
    from main import app

    reader = SimpleNamespace(role=SimpleNamespace(role_name="Authenticated User"), account_status="normal")
    admin = SimpleNamespace(role=SimpleNamespace(role_name="Administrator"), account_status="normal")

    async def provide_db():
        yield object()

    async def resolve_token(token, db):
        assert token == "valid-cookie-token"
        return admin

    monkeypatch.setattr(authorization, "get_authenticated_user_from_token", resolve_token)

    def request_with_cookie(cookie=None):
        headers = []
        if cookie:
            headers.append((b"cookie", cookie.encode()))
        return Request({"type": "http", "method": "GET", "path": "/", "headers": headers})

    async def check():
        with pytest.raises(HTTPException) as missing:
            await authorization.get_current_admin_page_user(request_with_cookie(), object())
        assert missing.value.status_code == 401

        assert await authorization.get_current_admin_page_user(
            request_with_cookie("uas_sad_admin_session=valid-cookie-token"), object()
        ) is admin

        async def resolve_reader(token, db):
            return reader

        monkeypatch.setattr(authorization, "get_authenticated_user_from_token", resolve_reader)
        with pytest.raises(HTTPException) as denied:
            await authorization.get_current_admin_page_user(
                request_with_cookie("uas_sad_admin_session=valid-cookie-token"), object()
            )
        assert denied.value.status_code == 403

    import asyncio
    asyncio.run(check())

    async def authorize_page(request, db):
        assert request.cookies.get(authorization.ADMIN_SESSION_COOKIE) == "valid-cookie-token"
        return admin

    monkeypatch.setattr(pages, "get_current_admin_page_user", authorize_page)
    app.dependency_overrides[get_db] = provide_db
    try:
        with TestClient(app, base_url="http://127.0.0.1", follow_redirects=False) as client:
            anonymous = client.get(authorization.ADMIN_DASHBOARD_PATH)
            assert anonymous.status_code == 303
            assert anonymous.headers["location"] == f"/login?next={authorization.ADMIN_DASHBOARD_PATH}"

            client.cookies.set(authorization.ADMIN_SESSION_COOKIE, "valid-cookie-token", path=authorization.ADMIN_DASHBOARD_PATH)
            authorized = client.get(authorization.ADMIN_DASHBOARD_PATH)
            assert authorized.status_code == 200
            assert "Dashboard Administrator" in authorized.text
    finally:
        app.dependency_overrides.pop(get_db, None)


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


def test_admin_book_metadata_update_requires_safe_nonempty_fields():
    from pydantic import ValidationError
    from app.schemas.book import BookUpdate

    update = BookUpdate(judul_buku="Judul baru", sinopsis=None)
    assert update.judul_buku == "Judul baru"
    assert update.sinopsis is None

    with pytest.raises(ValidationError):
        BookUpdate()
    with pytest.raises(ValidationError):
        BookUpdate(unknown="field")


def test_book_upload_file_signatures_and_extensions(secure_env):
    from fastapi import HTTPException
    from app.services.book_service import validate_book_body, validate_book_cover

    validate_book_body(b"%PDF-1.7\nIsi buku\n%%EOF", "buku.pdf")
    validate_book_cover(b"\xff\xd8\xffdata\xff\xd9", "sampul.jpg")

    for validator, data, filename in (
        (validate_book_body, b"%PDF-1.7\n%%EOF", "buku.txt"),
        (validate_book_body, b"bukan pdf", "buku.pdf"),
        (validate_book_cover, b"\xff\xd8\xffdata\xff\xd9", "sampul.png"),
        (validate_book_cover, b"bukan jpg", "sampul.jpg"),
    ):
        with pytest.raises(HTTPException) as exc:
            validator(data, filename)
        assert exc.value.status_code == 400


def test_daily_upload_failures_are_database_backed_and_freeze_at_four(secure_env):
    import asyncio
    import uuid
    from types import SimpleNamespace
    from sqlalchemy.dialects import postgresql
    from app.services import book_service

    class FakeSession:
        def __init__(self):
            self.count = 0
            self.statements = []
            self.commits = 0

        async def execute(self, statement):
            self.statements.append(statement)
            if getattr(statement, "is_insert", False):
                self.count += 1
            return SimpleNamespace(scalar_one=lambda: self.count)

        async def commit(self):
            self.commits += 1

    async def run():
        session = FakeSession()
        user = SimpleNamespace(id_pengguna=uuid.uuid4(), account_status="normal", updated_by=None)
        for expected in range(1, 5):
            assert await book_service.record_bad_upload_attempt(session, user) == expected
        assert user.account_status == "beku"
        assert session.commits == 4
        insert_sql = next(statement for statement in session.statements if getattr(statement, "is_insert", False))
        sql = str(insert_sql.compile(dialect=postgresql.dialect()))
        assert "CURRENT_DATE" in sql
        assert "ON CONFLICT" in sql

    asyncio.run(run())


def test_secure_filename_generation_and_anti_csrf(secure_env, tmp_path):
    """Pengujian pembuatan nama berkas acak ber-entropi tinggi (anti-CSRF) dan pencegahan traversal."""
    from fastapi import HTTPException
    from app.services import book_service
    from configuration.settings import settings

    # 1. Verifikasi keunikan dan format nama berkas acak
    name1 = book_service.generate_secure_filename(".pdf")
    name2 = book_service.generate_secure_filename(".pdf")
    assert name1.endswith(".pdf")
    assert name2.endswith(".pdf")
    assert name1 != name2  # Unik & unguessable (mematahkan tebakan CSRF)
    assert len(name1) > 40  # Memuat UUID + 32-char hex token

    # 2. Pengujian penyimpanan cover dengan ekstensi yang diizinkan & ditolak
    settings.books_cover_path = str(tmp_path / "books" / "cover")
    settings.books_body_path = str(tmp_path / "books" / "body")

    cover_rel = book_service.save_book_cover(b"\xff\xd8\xffimage\xff\xd9", "my_book.jpg")
    assert cover_rel.startswith("books/cover/")
    assert cover_rel.endswith(".jpg")

    # Tolak format selain JPG (termasuk tipe gambar lain)
    for bad_ext in ("exploit.exe", "script.php", "doc.pdf", "cover.png", "cover.jpeg"):
        with pytest.raises(HTTPException) as exc:
            book_service.save_book_cover(b"test", bad_ext)
        assert exc.value.status_code == 400

    # 3. Pengujian penyimpanan body (wajib PDF)
    body_rel = book_service.save_book_body(b"%PDF-1.4\nclean code\n%%EOF", "clean_code.pdf")
    assert body_rel.startswith("books/body/")
    assert body_rel.endswith(".pdf")

    # Tolak berkas non-PDF untuk body
    with pytest.raises(HTTPException) as exc:
        book_service.save_book_body(b"test", "code.docx")
    assert exc.value.status_code == 400

    # 4. Anti-Path Traversal pada resolve path
    with pytest.raises(HTTPException) as exc:
        book_service.resolve_secure_file_path("../../etc/passwd", settings.books_body_dir)
    assert exc.value.status_code in (400, 403)
