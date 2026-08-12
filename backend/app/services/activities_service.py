from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.activities import Activity


def get_activity(db: Session, activity_id: int) -> Optional[Activity]:
    return db.scalar(select(Activity).where(Activity.id == activity_id))


def list_activities(db: Session, page: int = 1, size: int = 20):
    total = int(db.scalar(select(func.count(Activity.id))) or 0)
    items = db.scalars(select(Activity).order_by(Activity.id.desc()).offset((page - 1) * size).limit(size)).all()
    return {"total": total, "items": items}
