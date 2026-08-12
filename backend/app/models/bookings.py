from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import BookingStatus
from sqlalchemy import Enum as SQLAlchemyEnum


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    activity_id: Mapped[int] = mapped_column(ForeignKey("activities.id"))
    availability_id: Mapped[int] = mapped_column(ForeignKey("availabilities.id"))
    promo_code_id: Mapped[int | None] = mapped_column(ForeignKey("promo_codes.id"), nullable=True)
    date_reservation: Mapped[datetime] = mapped_column(DateTime, server_default="now()")
    statut: Mapped[BookingStatus] = mapped_column(
        SQLAlchemyEnum(BookingStatus, name="bookingstatus"),
        default=BookingStatus.pending,
    )
    qr_code: Mapped[str | None] = mapped_column(String(255), nullable=True)
    montant_total: Mapped[float] = mapped_column(Float, default=0.0)

    user = relationship("User", back_populates="bookings")
    activity = relationship("Activity", back_populates="bookings")
    availability = relationship("Availability", back_populates="bookings")
    promo_code = relationship("PromoCode", back_populates="bookings")
    payments = relationship("Payment", back_populates="booking")
