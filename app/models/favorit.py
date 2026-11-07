import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.mixins import AuditMixin
from configuration.database_session import SCHEMA, Base

if TYPE_CHECKING:
    from app.models.buku import Buku
    from app.models.pengguna import Pengguna


class Favorit(AuditMixin, Base):
    """Tabel favorit buku per pengguna. PK komposit (isbn, id_pengguna)."""

    __tablename__ = "favorit"

    isbn: Mapped[str] = mapped_column(
        String(13),
        ForeignKey(f"{SCHEMA}.buku.isbn", ondelete="CASCADE"),
        primary_key=True,
    )
    id_pengguna: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(f"{SCHEMA}.pengguna.id_pengguna", ondelete="CASCADE"),
        primary_key=True,
    )

    buku: Mapped["Buku"] = relationship("Buku", back_populates="favorit", lazy="joined")
    pengguna: Mapped["Pengguna"] = relationship("Pengguna")

    def __repr__(self) -> str:
        return f"<Favorit {self.id_pengguna} - {self.isbn}>"
