import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.models import Activity, Booking, BookingStatus, Category, Payment
from app.models.user import User
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
    stmt = select(User)
    if search:
        pattern = f"%{search.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(User.email).like(pattern),
                func.lower(User.nom).like(pattern),
                func.lower(User.prenom).like(pattern),
            )
        )

    total = int(db.scalar(select(func.count()).select_from(stmt.subquery())) or 0)
    users = db.scalars(
        stmt.order_by(User.date_inscription.desc()).offset((page - 1) * size).limit(size)
    ).all()

    items = [
        AdminUserRow(
            id=u.id,
            nom=u.nom,
            prenom=u.prenom,
            email=u.email,
            role=u.role.value,
            is_active=u.is_active,
            is_verified=u.is_verified,
            phone=u.phone,
            date_inscription=u.date_inscription,
        )
        for u in users
    ]
    return _paginate(total, page, size, items)


@router.get("/bookings", response_model=Page[AdminBookingRow])
def list_bookings(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    statut: BookingStatus | None = None,
):
    stmt = (
        select(Booking, User, Activity)
        .join(User, Booking.user_id == User.id)
        .join(Activity, Booking.activity_id == Activity.id)
    )
    if statut:
        stmt = stmt.where(Booking.statut == statut)

    total = int(db.scalar(select(func.count()).select_from(stmt.subquery())) or 0)
    rows = db.execute(
        stmt.order_by(Booking.date_reservation.desc())
        .offset((page - 1) * size)
        .limit(size)
    ).all()

    items = [
        AdminBookingRow(
            id=b.id,
            user_id=u.id,
            client=f"{u.prenom} {u.nom}".strip(),
            email=u.email,
            activity_id=a.id,
            activity=a.titre,
            statut=b.statut.value,
            montant_total=float(b.montant_total or 0.0),
            date_reservation=b.date_reservation,
        )
        for b, u, a in rows
    ]
    return _paginate(total, page, size, items)


@router.get("/activities", response_model=Page[AdminActivityRow])
def list_activities(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    bookings_count = (
        select(Booking.activity_id, func.count(Booking.id).label("nb"))
        .group_by(Booking.activity_id)
        .subquery()
    )
    stmt = (
        select(Activity, Category.nom, func.coalesce(bookings_count.c.nb, 0))
        .join(Category, Activity.category_id == Category.id, isouter=True)
        .join(bookings_count, bookings_count.c.activity_id == Activity.id, isouter=True)
    )

    total = int(db.scalar(select(func.count(Activity.id))) or 0)
    rows = db.execute(
        stmt.order_by(Activity.id.desc()).offset((page - 1) * size).limit(size)
    ).all()

    items = [
        AdminActivityRow(
            id=a.id,
            titre=a.titre,
            prix=float(a.prix or 0.0),
            duree=a.duree,
            localisation=a.localisation,
            category=category_name,
            bookings_count=int(nb or 0),
        )
        for a, category_name, nb in rows
    ]
    return _paginate(total, page, size, items)


@router.get("/payments", response_model=Page[AdminPaymentRow])
def list_payments(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    stmt = (
        select(Payment, User)
        .join(Booking, Payment.booking_id == Booking.id)
        .join(User, Booking.user_id == User.id)
    )

    total = int(db.scalar(select(func.count(Payment.id))) or 0)
    rows = db.execute(
        stmt.order_by(Payment.date_paiement.desc()).offset((page - 1) * size).limit(size)
    ).all()

    items = [
        AdminPaymentRow(
            id=p.id,
            booking_id=p.booking_id,
            client=f"{u.prenom} {u.nom}".strip(),
            montant=float(p.montant or 0.0),
            type=p.type.value,
            methode=p.methode,
            statut=p.statut.value,
            date_paiement=p.date_paiement,
        )
        for p, u in rows
    ]
    return _paginate(total, page, size, items)