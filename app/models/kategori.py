from sqlalchemy import Identity, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.mixins import AuditMixin
from configuration.database_session import Base


class KategoriBuku(AuditMixin, Base):
    """Tabel kategori_buku. Ditulis oleh Administrator / Migrator."""

    __tablename__ = "kategori_buku"

    id_kategori: Mapped[int] = mapped_column(Integer, Identity(always=True), primary_key=True)
    kategori: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)

    def __repr__(self) -> str:
        return f"<KategoriBuku {self.id_kategori}: {self.kategori}>"
