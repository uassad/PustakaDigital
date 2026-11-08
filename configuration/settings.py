"""Konfigurasi aplikasi — SATU-SATUNYA tempat membaca environment / file .env.

KEAMANAN:
- Tidak ada secret yang di-hardcode. Jika .env tidak ada / tidak valid, aplikasi
  GAGAL START (fail closed) — lebih baik mati daripada berjalan dengan secret lemah.
- JWT secret dan pepper wajib >= 32 karakter dan tidak boleh berupa placeholder.
- CORS wildcard "*" ditolak di semua environment.
"""
import re
from functools import lru_cache
from pathlib import Path
from typing import Literal, Optional

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".secrets" / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- Umum -------------------------------------------------------------
    environment: Literal["development", "production"] = "development"

    # --- Database ---------------------------------------------------------
    # Wajib driver async: postgresql+asyncpg://user:pass@host:5432/dbname
    database_url: str
    # disable | prefer | require | verify-ca | verify-full (disarankan verify-full di produksi)
    database_sslmode: Optional[str] = None
    db_schema: str = "uas_sad"

    # --- JWT --------------------------------------------------------------
    jwt_secret_key: str
    jwt_algorithm: Literal["HS256", "HS384", "HS512"] = "HS256"
    jwt_issuer: str = "uas-sad-ebook"
    jwt_audience: str = "uas-sad-ebook-clients"
    access_token_expire_minutes: int = Field(30, ge=1, le=240)

    # --- Pepper password (disimpan di .env / secret manager, BUKAN di DB) ---
    password_pepper: str

    # --- HTTP -------------------------------------------------------------
    cors_origins: str = "http://localhost:8000"      # dipisah koma, tanpa wildcard
    allowed_hosts: str = "localhost,127.0.0.1"       # dipisah koma (anti Host-header attack)

    # --- Batas body request & Upload Berkas -------------------------------
    max_json_body_kb: int = Field(64, ge=1, le=1024)
    max_pdf_upload_mb: int = Field(100, ge=1, le=100, description="Batas maksimal ukuran upload PDF dalam MB")
    max_cover_upload_mb: int = Field(5, ge=1, le=20, description="Batas maksimal ukuran upload sampul dalam MB")

    # --- OTP registrasi lokal (SMTP ditangkap Mailpit) --------------------
    otp_smtp_host: str = "127.0.0.1"
    otp_smtp_port: int = Field(1025, ge=1, le=65535)
    otp_from_email: str = "no-reply@localhost"
    otp_expiry_seconds: int = Field(300, ge=60, le=900)

    # --- Berkas Buku (PDF & Cover) ----------------------------------------
    books_cover_path: str = "books/cover"
    books_body_path: str = "books/body"

    # ---------------------------------------------------------------------
    @field_validator("database_url")
    @classmethod
    def _db_url(cls, v: str) -> str:
        if not v.startswith("postgresql+asyncpg://"):
            raise ValueError("DATABASE_URL harus memakai driver async: postgresql+asyncpg://...")
        return v

    @field_validator("db_schema")
    @classmethod
    def _schema_name(cls, v: str) -> str:
        if not re.fullmatch(r"[a-z_][a-z0-9_]{0,62}", v):
            raise ValueError("DB_SCHEMA hanya boleh huruf kecil, angka, underscore")
        return v

    @field_validator("jwt_secret_key", "password_pepper")
    @classmethod
    def _strong_secret(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("secret minimal 32 karakter (gunakan secrets.token_urlsafe(64))")
        if "change_me" in v.lower() or "changeme" in v.lower():
            raise ValueError("secret masih berisi placeholder — ganti dengan nilai acak")
        return v

    @field_validator("cors_origins")
    @classmethod
    def _cors(cls, v: str) -> str:
        for origin in [o.strip() for o in v.split(",") if o.strip()]:
            if origin == "*" or "*" in origin:
                raise ValueError("CORS wildcard '*' dilarang — sebutkan origin secara eksplisit")
            if not re.fullmatch(r"https?://[A-Za-z0-9.\-]+(:\d{1,5})?", origin):
                raise ValueError(f"Origin CORS tidak valid: {origin!r} (format: https://host[:port], tanpa path/slash akhir)")
        return v

    @model_validator(mode="after")
    def _production_rules(self) -> "Settings":
        if self.environment == "production":
            if any(not o.startswith("https://") for o in self.cors_origin_list):
                raise ValueError("Di produksi semua CORS origin harus https://")
            if not self.database_sslmode or self.database_sslmode in {"disable", "prefer"}:
                raise ValueError("Di produksi DATABASE_SSLMODE minimal 'require' (disarankan 'verify-full')")
        return self

    # ---------------------------------------------------------------------
    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def allowed_host_list(self) -> list[str]:
        return [h.strip() for h in self.allowed_hosts.split(",") if h.strip()]

    @property
    def max_json_body_bytes(self) -> int:
        return self.max_json_body_kb * 1024

    @property
    def max_pdf_upload_bytes(self) -> int:
        return self.max_pdf_upload_mb * 1024 * 1024

    @property
    def max_cover_upload_bytes(self) -> int:
        return self.max_cover_upload_mb * 1024 * 1024

    @property
    def max_upload_request_bytes(self) -> int:
        # Menampung multipart overhead + pdf + cover
        return (self.max_pdf_upload_mb + self.max_cover_upload_mb + 2) * 1024 * 1024

    @property
    def books_cover_dir(self) -> Path:
        p = (BASE_DIR / self.books_cover_path).resolve()
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def books_body_dir(self) -> Path:
        p = (BASE_DIR / self.books_body_path).resolve()
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def books_storage_dir(self) -> Path:
        """Alias untuk direktori isi buku (PDF)."""
        return self.books_body_dir


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # nilai diambil dari environment/.env


settings = get_settings()
