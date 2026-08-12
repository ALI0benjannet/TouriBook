from datetime import date, time

from sqlalchemy import Date, ForeignKey, Integer, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Availability(Base):
    __tablename__ = "availabilities"

    id: Mapped[int] = mapped_column(primary_key=True)
    activity_id: Mapped[int] = mapped_column(ForeignKey("activities.id"))
    date: Mapped[date] = mapped_column(Date)
    heure: Mapped[time] = mapped_column(Time)
    places_disponibles: Mapped[int] = mapped_column(Integer, default=0)

    activity = relationship("Activity", back_populates="availabilities")
    bookings = relationship("Booking", back_populates="availability")
