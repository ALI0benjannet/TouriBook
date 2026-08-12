from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


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
