import enum
from datetime import date, datetime, time

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    tourist = "tourist"
    admin = "admin"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"


class PaymentType(str, enum.Enum):
    full = "full"
    deposit = "deposit"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    succeeded = "succeeded"
    failed = "failed"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    nom: Mapped[str] = mapped_column(String(100))
    prenom: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    mot_de_passe: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.tourist)
    preferences: Mapped[str | None] = mapped_column(Text, nullable=True)
    date_inscription: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    bookings = relationship("Booking", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    nom: Mapped[str] = mapped_column(String(100), unique=True)

    activities = relationship("Activity", back_populates="category")


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(primary_key=True)
    titre: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    prix: Mapped[float] = mapped_column(Float)
    duree: Mapped[int] = mapped_column(Integer)
    localisation: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    photos: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))

    category = relationship("Category", back_populates="activities")
    availabilities = relationship("Availability", back_populates="activity")
    bookings = relationship("Booking", back_populates="activity")
    reviews = relationship("Review", back_populates="activity")


class Availability(Base):
    __tablename__ = "availabilities"

    id: Mapped[int] = mapped_column(primary_key=True)
    activity_id: Mapped[int] = mapped_column(ForeignKey("activities.id"))
    date: Mapped[date] = mapped_column(Date)
    heure: Mapped[time] = mapped_column(Time)
    places_disponibles: Mapped[int] = mapped_column(Integer, default=0)

    activity = relationship("Activity", back_populates="availabilities")
    bookings = relationship("Booking", back_populates="availability")


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    reduction: Mapped[float] = mapped_column(Float)
    date_expiration: Mapped[date] = mapped_column(Date)
    actif: Mapped[bool] = mapped_column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="promo_code")


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    activity_id: Mapped[int] = mapped_column(ForeignKey("activities.id"))
    availability_id: Mapped[int] = mapped_column(ForeignKey("availabilities.id"))
    promo_code_id: Mapped[int | None] = mapped_column(ForeignKey("promo_codes.id"), nullable=True)
    date_reservation: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    statut: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus), default=BookingStatus.pending)
    qr_code: Mapped[str | None] = mapped_column(String(255), nullable=True)
    montant_total: Mapped[float] = mapped_column(Float, default=0.0)

    user = relationship("User", back_populates="bookings")
    activity = relationship("Activity", back_populates="bookings")
    availability = relationship("Availability", back_populates="bookings")
    promo_code = relationship("PromoCode", back_populates="bookings")
    payments = relationship("Payment", back_populates="booking")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id"))
    montant: Mapped[float] = mapped_column(Float)
    type: Mapped[PaymentType] = mapped_column(Enum(PaymentType), default=PaymentType.full)
    methode: Mapped[str] = mapped_column(String(50), default="stripe")
    statut: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.pending)
    stripe_intent_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_paiement: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    booking = relationship("Booking", back_populates="payments")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    activity_id: Mapped[int] = mapped_column(ForeignKey("activities.id"))
    note: Mapped[int] = mapped_column(Integer)
    commentaire: Mapped[str | None] = mapped_column(Text, nullable=True)
    date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="reviews")
    activity = relationship("Activity", back_populates="reviews")


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "activity_id", name="uq_user_activity_fav"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    activity_id: Mapped[int] = mapped_column(ForeignKey("activities.id"))

    user = relationship("User", back_populates="favorites")
    activity = relationship("Activity")
