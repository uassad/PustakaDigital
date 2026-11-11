from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import ForeignKey, Integer, SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.mixins import AuditMixin
from configuration.database_session import SCHEMA, Base

if TYPE_CHECKING:
    from app.models.favorit import Favorit
    from app.models.kategori import KategoriBuku


class Buku(AuditMixin, Base):
    """Tabel buku. Hanya Administrator yang dapat menambah/mengubah berkas buku PDF."""

    __tablename__ = "buku"

    isbn: Mapped[str] = mapped_column(String(13), primary_key=True)
    id_kategori: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(f"{SCHEMA}.kategori_buku.id_kategori", ondelete="RESTRICT"),
        nullable=False,
    )
    judul_buku: Mapped[str] = mapped_column(String(250), nullable=False)
    nama_penulis: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    nama_penerbit: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    tahun_terbit: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    jumlah_halaman: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    sinopsis: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Path penyimpanan lokal:
    # book_cover: 'books/cover/<random_token>.<ext>'
    # book_body: 'books/body/<random_token>.pdf'
    # Nama berkas acak (unguessable) mematahkan serangan CSRF / direct file guessing.
    book_cover: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    book_body: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    kategori: Mapped["KategoriBuku"] = relationship("KategoriBuku", lazy="joined")
    favorit: Mapped[List["Favorit"]] = relationship("Favorit", back_populates="buku", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Buku {self.isbn}: {self.judul_buku}>"
