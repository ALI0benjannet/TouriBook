from datetime import datetime, timedelta, timezone
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.activities import Activity
from app.models.availabilities import Availability
from app.models.bookings import Booking
from app.models.categories import Category
from app.models.enums import BookingStatus, PaymentStatus, UserRole
from app.models.payments import Payment
from app.models.users import User
from app.schemas.admin import (
    ActivityStats,
    BookingStats,
    DashboardStats,
    RecentBooking,
    RevenueStats,
    UserStats,
)


def _since(days: int) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=days)


def _count(db: Session, stmt) -> int:
    return int(db.scalar(stmt) or 0)


def _sum(db: Session, stmt) -> float:
    return float(db.scalar(stmt) or 0.0)


def get_booking_stats(db: Session) -> BookingStats:
    base = select(func.count(Booking.id))
    return BookingStats(
        total=_count(db, base),
        pending=_count(db, base.where(Booking.statut == BookingStatus.pending)),
        confirmed=_count(db, base.where(Booking.statut == BookingStatus.confirmed)),
        cancelled=_count(db, base.where(Booking.statut == BookingStatus.cancelled)),
        last_30_days=_count(db, base.where(Booking.date_reservation >= _since(30))),
    )


def get_revenue_stats(db: Session) -> RevenueStats:
    paid = select(func.coalesce(func.sum(Payment.montant), 0.0)).where(
        Payment.statut == PaymentStatus.succeeded
    )
    total = _sum(db, paid)

    # Fallback : si aucun paiement enregistré, on se base sur les réservations confirmées
    if total == 0.0:
        total = _sum(
            db,
            select(func.coalesce(func.sum(Booking.montant_total), 0.0)).where(
                Booking.statut == BookingStatus.confirmed
            ),
        )
    confirmed_count = _count(
        db,
        select(func.count(Booking.id)).where(Booking.statut == BookingStatus.confirmed),
    )
    return RevenueStats(
        total=round(total, 2),
        last_30_days=round(_sum(db, paid.where(Payment.date_paiement >= _since(30))), 2),
        pending=round(
            _sum(
                db,
                select(func.coalesce(func.sum(Payment.montant), 0.0)).where(
                    Payment.statut == PaymentStatus.pending
                ),
            ),
            2,
        ),
        average_basket=round(total / confirmed_count, 2) if confirmed_count else 0.0,
    )


def get_user_stats(db: Session) -> UserStats:
    base = select(func.count(User.id))
    return UserStats(
        total=_count(db, base),
        active=_count(db, base.where(User.is_active.is_(True))),
        verified=_count(db, base.where(User.is_verified.is_(True))),
        admins=_count(db, base.where(User.role == UserRole.admin)),
        new_30_days=_count(db, base.where(User.date_inscription >= _since(30))),
    )


def get_activity_stats(db: Session) -> ActivityStats:
    return ActivityStats(
        total=_count(db, select(func.count(Activity.id))),
        categories=_count(db, select(func.count(Category.id))),
        upcoming_availabilities=_count(
            db,
            select(func.count(Availability.id)).where(
                Availability.date >= datetime.now(timezone.utc).date()
            ),
        ),
    )


def get_recent_bookings(db: Session, limit: int = 8) -> list[RecentBooking]:
    rows = db.execute(
        select(Booking, User, Activity)
        .join(User, Booking.user_id == User.id)
        .join(Activity, Booking.activity_id == Activity.id)
        .order_by(Booking.date_reservation.desc())
        .limit(limit)
    ).all()
    return [
        RecentBooking(
            id=booking.id,
            client=f"{user.prenom} {user.nom}".strip(),
            email=user.email,
            activity=activity.titre,
            statut=booking.statut.value,
            montant_total=float(booking.montant_total or 0.0),
            date_reservation=booking.date_reservation,
        )
        for booking, user, activity in rows
    ]


def get_dashboard_stats(db: Session) -> DashboardStats:
    return DashboardStats(
        bookings=get_booking_stats(db),
        revenue=get_revenue_stats(db),
        users=get_user_stats(db),
        activities=get_activity_stats(db),
        recent_bookings=get_recent_bookings(db),
        generated_at=datetime.now(timezone.utc),
    )


def list_users(db: Session, page: int = 1, size: int = 20, search: str | None = None) -> dict:
    """Return paginated users matching optional search."""
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
        {
            "id": u.id,
            "nom": u.nom,
            "prenom": u.prenom,
            "email": u.email,
            "role": u.role.name,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "phone": u.phone,
            "date_inscription": u.date_inscription,
        }
        for u in users
    ]
    return _paginate(total, page, size, items)


def list_bookings(db: Session, page: int = 1, size: int = 20, statut: BookingStatus | None = None) -> dict:
    stmt = (
        select(Booking, User, Activity)
        .join(User, Booking.user_id == User.id)
        .join(Activity, Booking.activity_id == Activity.id)
    )
    if statut:
        stmt = stmt.where(Booking.statut == statut)

    total = int(db.scalar(select(func.count()).select_from(stmt.subquery())) or 0)
    rows = db.execute(
        stmt.order_by(Booking.date_reservation.desc()).offset((page - 1) * size).limit(size)
    ).all()

    items = [
        {
            "id": b.id,
            "user_id": u.id,
            "client": f"{u.prenom} {u.nom}".strip(),
            "email": u.email,
            "activity_id": a.id,
            "activity": a.titre,
            "statut": b.statut.value,
            "montant_total": float(b.montant_total or 0.0),
            "date_reservation": b.date_reservation,
        }
        for b, u, a in rows
    ]
    return _paginate(total, page, size, items)


def list_activities(db: Session, page: int = 1, size: int = 20) -> dict:
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
    rows = db.execute(stmt.order_by(Activity.id.desc()).offset((page - 1) * size).limit(size)).all()

    items = [
        {
            "id": a.id,
            "titre": a.titre,
            "prix": float(a.prix or 0.0),
            "duree": a.duree,
            "localisation": a.localisation,
            "category": category_name,
            "bookings_count": int(nb or 0),
        }
        for a, category_name, nb in rows
    ]
    return _paginate(total, page, size, items)


def list_payments(db: Session, page: int = 1, size: int = 20) -> dict:
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
        {
            "id": p.id,
            "booking_id": p.booking_id,
            "client": f"{u.prenom} {u.nom}".strip(),
            "montant": float(p.montant or 0.0),
            "type": p.type.value,
            "methode": p.methode,
            "statut": p.statut.value,
            "date_paiement": p.date_paiement,
        }
        for p, u in rows
    ]
    return _paginate(total, page, size, items)