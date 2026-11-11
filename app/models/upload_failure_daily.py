import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from configuration.database_session import SCHEMA, Base


class UploadFailureDaily(Base):
    __tablename__ = "upload_failure_daily"
    __table_args__ = {"schema": SCHEMA}

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(f"{SCHEMA}.pengguna.id_pengguna", ondelete="CASCADE"),
        primary_key=True,
    )
    failure_date: Mapped[date] = mapped_column(Date, primary_key=True)
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
