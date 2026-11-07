"""Kolom audit yang ada di SEMUA tabel (lihat table.sql).

- created_at  : diisi DB (DEFAULT now()).
- created_by  : diisi aplikasi (id pengguna pelaku); tidak bisa diubah (trigger DB).
- updated_at  : diisi trigger DB saat UPDATE (tidak bisa dipalsukan klien).
- updated_by  : WAJIB diisi aplikasi pada setiap UPDATE.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column


class AuditMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
