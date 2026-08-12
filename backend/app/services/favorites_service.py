from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.favorites import Favorite


def add_favorite(db: Session, user_id: int, activity_id: int) -> Favorite:
    fav = Favorite(user_id=user_id, activity_id=activity_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav


def remove_favorite(db: Session, user_id: int, activity_id: int) -> None:
    db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.activity_id == activity_id).delete()
    db.commit()


def list_favorites(db: Session, user_id: int):
    return db.scalars(select(Favorite).where(Favorite.user_id == user_id)).all()
