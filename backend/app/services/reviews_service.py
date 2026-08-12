from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.reviews import Review


def add_review(db: Session, user_id: int, activity_id: int, rating: int, comment: str) -> Review:
    r = Review(user_id=user_id, activity_id=activity_id, note=rating, commentaire=comment)
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


def list_reviews_for_activity(db: Session, activity_id: int):
    return db.scalars(select(Review).where(Review.activity_id == activity_id)).all()
