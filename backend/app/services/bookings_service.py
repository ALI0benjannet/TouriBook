from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.bookings import Booking


def get_booking(db: Session, booking_id: int) -> Optional[Booking]:
    return db.scalar(select(Booking).where(Booking.id == booking_id))


def list_bookings(db: Session, user_id: Optional[int] = None, page: int = 1, size: int = 20):
    stmt = select(Booking)
    if user_id:
        stmt = stmt.where(Booking.user_id == user_id)

    total = int(db.scalar(select(func.count(Booking.id)).select_from(stmt.subquery())) or 0)
    rows = db.scalars(stmt.order_by(Booking.date_reservation.desc()).offset((page - 1) * size).limit(size)).all()
    return {"total": total, "items": rows}


def create_booking(db: Session, booking: Booking) -> Booking:
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking
