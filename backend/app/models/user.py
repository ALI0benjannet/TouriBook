import enum
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    tourist = "tourist"
    admin = "admin"


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    nom: Mapped[str] = mapped_column(String(100), nullable=False)
    prenom: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.tourist, nullable=False
    )
    preferences: Mapped[str | None] = mapped_column(String(500), nullable=True)
    date_inscription: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    bookings = relationship("Booking", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(5), default="fr", nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
