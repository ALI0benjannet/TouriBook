# Cart model does not exist yet; provide a lightweight placeholder API.
from typing import Any
from sqlalchemy.orm import Session


def get_cart(db: Session, user_id: int) -> dict:
    # Placeholder: return empty cart structure
    return {"user_id": user_id, "items": []}


def add_to_cart(db: Session, user_id: int, activity_id: int, qty: int = 1) -> dict:
    # Placeholder implementation; real implementation requires a Cart model.
    raise NotImplementedError("Cart model not implemented")


def remove_from_cart(db: Session, user_id: int, activity_id: int) -> None:
    raise NotImplementedError("Cart model not implemented")
