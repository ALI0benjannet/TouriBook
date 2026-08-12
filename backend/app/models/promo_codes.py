from datetime import date

from sqlalchemy import Boolean, Date, Float, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    reduction: Mapped[float] = mapped_column(Float)
    date_expiration: Mapped[date] = mapped_column(Date)
    actif: Mapped[bool] = mapped_column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="promo_code")
