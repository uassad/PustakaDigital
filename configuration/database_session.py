"""Konfigurasi database — SQLAlchemy 2.0 async + asyncpg.

KEAMANAN:
- Kredensial TIDAK di-hardcode (sebelumnya ada default postgres:admin) — wajib dari .env.
- Aplikasi harus terhubung sebagai role runtime (anggota grp_uas_sad_rw), BUKAN
  uas_sad_migrator / superuser. Role runtime tidak boleh menulis kolom role_id.
- Semua kueri lewat ORM / parameter terikat (bound parameters) -> tidak ada SQL injection.
- statement_timeout membatasi kueri yang menggantung (mitigasi DoS).
- TIDAK ada create_all(): skema dibuat oleh table.sql (dimiliki role migrator).
"""
from collections.abc import AsyncIterator

from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from configuration.settings import settings


SCHEMA = settings.db_schema


class Base(DeclarativeBase):
    # Semua tabel berada di schema "uas_sad" (sesuai table.sql).
    metadata = MetaData(schema=SCHEMA)


_connect_args: dict = {
    "server_settings": {
        "application_name": "uas_sad_ebook_api",
        "statement_timeout": "10000",                      # 10 detik
        "idle_in_transaction_session_timeout": "15000",
    },
    "command_timeout": 15,
}
if settings.database_sslmode:
    _connect_args["ssl"] = settings.database_sslmode     # asyncpg menerima 'require', 'verify-full', dst.

engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=10,
    pool_recycle=1800,
    echo=False,                                           # jangan echo SQL (bisa membocorkan data di log)
    hide_parameters=True,                                 # nilai parameter (email, hash) tidak ikut tercetak di pesan error/log
    connect_args=_connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,   # objek tetap bisa dibaca setelah commit (penting di mode async)
    autoflush=False,
)


async def get_db() -> AsyncIterator[AsyncSession]:
    """Dependency FastAPI: satu session per request, selalu ditutup (perbaikan bug `db.close` tanpa tanda kurung)."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
