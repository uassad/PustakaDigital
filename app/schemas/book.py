import re
from datetime import datetime
from typing import Annotated, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

def clean_and_validate_isbn13(v: str) -> str:
    """Validasi ISBN-13 sesuai domain database PostgreSQL (uas_sad.isbn13).
    
    Format: 13 digit angka diawali 978 atau 979, disertai validasi check digit (modulo 10).
    """
    clean = re.sub(r"[-\s]", "", str(v).strip())
    if not re.fullmatch(r"^97[89][0-9]{10}$", clean):
        raise ValueError("Format ISBN-13 tidak valid. Harus diawali 978 atau 979 sebanyak 13 digit.")
    
    # Check digit algorithm (EAN-13 / ISBN-13)
    total = sum(int(clean[i]) * (1 if i % 2 == 0 else 3) for i in range(12))
    check_digit = (10 - (total % 10)) % 10
    if check_digit != int(clean[12]):
        raise ValueError("Check-digit ISBN-13 tidak valid.")
    return clean


ISBN13 = Annotated[str, Field(description="ISBN-13 tanpa spasi/tanda hubung")]


class KategoriPublic(BaseModel):
    id_kategori: int
    kategori: str


class BookPublic(BaseModel):
    """Informasi publik buku untuk tampilan katalog / pencarian."""

    isbn: str
    id_kategori: int
    kategori_nama: Optional[str] = None
    judul_buku: str
    nama_penulis: Optional[str] = None
    nama_penerbit: Optional[str] = None
    tahun_terbit: Optional[str] = None
    jumlah_halaman: int
    sinopsis: Optional[str] = None
    book_cover: Optional[str] = None
    book_body: Optional[str] = None
    has_cover: bool = False
    is_favorite: bool = False
    has_pdf: bool = False


class BookSearchQuery(BaseModel):
    """Parameter pencarian katalog buku. Batas input ketat untuk mencegah DoS."""

    model_config = ConfigDict(extra="forbid")

    q: Optional[str] = Field(default=None, max_length=100, description="Kata kunci pencarian")
    kategori_id: Optional[int] = Field(default=None, ge=1, description="Filter ID kategori")
    page: int = Field(default=1, ge=1, description="Halaman hasil")
    page_size: int = Field(default=12, ge=1, le=50, description="Jumlah item per halaman (maks 50 anti-DoS)")

    @field_validator("q")
    @classmethod
    def _sanitize_q(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        # Cegah karakter kontrol
        if any(ord(c) < 32 for c in v):
            raise ValueError("Kata kunci memuat karakter yang tidak diizinkan.")
        return v if len(v) > 0 else None


class BookListResponse(BaseModel):
    items: list[BookPublic]
    total: int
    page: int
    page_size: int
    total_pages: int


class FavoriteToggleResponse(BaseModel):
    isbn: str
    is_favorite: bool
    message: str


class UserFavoriteItem(BaseModel):
    isbn: str
    judul_buku: str
    nama_penulis: Optional[str] = None
    nama_penerbit: Optional[str] = None
    tahun_terbit: Optional[str] = None
    jumlah_halaman: int
    kategori_nama: Optional[str] = None
    book_cover: Optional[str] = None
    has_cover: bool = False
    has_pdf: bool = False
    favorited_at: datetime


class BookCreate(BaseModel):
    """Payload pembuatan buku baru oleh Administrator."""
    model_config = ConfigDict(extra="forbid")

    isbn: str
    id_kategori: int = Field(ge=1)
    judul_buku: str = Field(min_length=1, max_length=250)
    nama_penulis: Optional[str] = Field(default=None, max_length=60)
    nama_penerbit: Optional[str] = Field(default=None, max_length=60)
    tahun_terbit: Optional[str] = Field(default=None, max_length=4, pattern=r"^\d{4}$")
    jumlah_halaman: int = Field(ge=1, le=10000)
    sinopsis: Optional[str] = Field(default=None, max_length=500)

    @field_validator("isbn")
    @classmethod
    def _validate_isbn(cls, v: str) -> str:
        return clean_and_validate_isbn13(v)


class BookUpdate(BaseModel):
    """Metadata yang dapat diubah administrator; ISBN dan berkas dikelola terpisah."""

    model_config = ConfigDict(extra="forbid")

    id_kategori: Optional[int] = Field(default=None, ge=1)
    judul_buku: Optional[str] = Field(default=None, min_length=1, max_length=250)
    nama_penulis: Optional[str] = Field(default=None, max_length=60)
    nama_penerbit: Optional[str] = Field(default=None, max_length=60)
    tahun_terbit: Optional[str] = Field(default=None, max_length=4, pattern=r"^\d{4}$")
    jumlah_halaman: Optional[int] = Field(default=None, ge=1, le=10000)
    sinopsis: Optional[str] = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def _require_changes(self) -> "BookUpdate":
        if not self.model_fields_set:
            raise ValueError("Minimal satu informasi buku harus diubah.")
        for field in ("id_kategori", "judul_buku", "jumlah_halaman"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} tidak boleh kosong.")
        return self
