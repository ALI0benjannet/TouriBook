from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum as SQLAlchemyEnum

from app.database import Base
from app.models.enums import PaymentStatus, PaymentType


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id"))
    montant: Mapped[float] = mapped_column(Float)
    type: Mapped[PaymentType] = mapped_column(
        SQLAlchemyEnum(PaymentType, name="paymenttype"), default=PaymentType.full
    )
    methode: Mapped[str] = mapped_column(String(50), default="stripe")
    statut: Mapped[PaymentStatus] = mapped_column(
        SQLAlchemyEnum(PaymentStatus, name="paymentstatus"),
        default=PaymentStatus.pending,
    )
    stripe_intent_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_paiement: Mapped[datetime] = mapped_column(DateTime, server_default="now()")

    booking = relationship("Booking", back_populates="payments")
