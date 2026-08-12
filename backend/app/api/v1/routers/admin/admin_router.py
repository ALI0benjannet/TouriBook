import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.activities import Activity
from app.models.bookings import Booking
from app.models.categories import Category
from app.models.enums import BookingStatus
from app.models.payments import Payment
from app.models.users import User
from app.schemas.admin import (
    AdminActivityRow,
    AdminBookingRow,
    AdminPaymentRow,
    AdminUserRow,
    DashboardStats,
    Page,
)
from app.services import admin_service

router = APIRouter(
    prefix="/admin",
    tags=["Administration"],
    dependencies=[Depends(require_admin)],  #  toutes les routes sont admin-only
)


def _paginate(total: int, page: int, size: int, items: list) -> dict:
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": math.ceil(total / size) if size else 0,
    }


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)):
    """Toutes les métriques du tableau de bord en un seul appel."""
    return admin_service.get_dashboard_stats(db)


@router.get("/users", response_model=Page[AdminUserRow])
def list_users(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, min_length=1, max_length=100),
):
    result = admin_service.list_users(db, page=page, size=size, search=search)
    return result


@router.get("/bookings", response_model=Page[AdminBookingRow])
def list_bookings(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    statut: BookingStatus | None = None,
):
    result = admin_service.list_bookings(db, page=page, size=size, statut=statut)
    return result


@router.get("/activities", response_model=Page[AdminActivityRow])
def list_activities(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    result = admin_service.list_activities(db, page=page, size=size)
    return result


@router.get("/payments", response_model=Page[AdminPaymentRow])
def list_payments(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    result = admin_service.list_payments(db, page=page, size=size)
    return result
