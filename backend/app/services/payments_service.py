from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.payments import Payment


def get_payment(db: Session, payment_id: int) -> Optional[Payment]:
    return db.scalar(select(Payment).where(Payment.id == payment_id))


def list_payments(db: Session, page: int = 1, size: int = 20):
    total = int(db.scalar(select(func.count(Payment.id))) or 0)
    items = db.scalars(select(Payment).order_by(Payment.date_paiement.desc()).offset((page - 1) * size).limit(size)).all()
    return {"total": total, "items": items}


def create_payment(db: Session, payment: Payment) -> Payment:
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment
