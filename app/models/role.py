import uuid

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.mixins import AuditMixin
from configuration.database_session import Base


class Role(AuditMixin, Base):
    """Tabel role. Ditulis HANYA oleh role migrator (bukan oleh aplikasi)."""

    __tablename__ = "role"

    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
