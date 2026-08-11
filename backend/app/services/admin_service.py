from datetime import datetime, timedelta, timezone
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.models import (
    Activity,
    Availability,
    Booking,
    BookingStatus,
    Category,
    Payment,
    PaymentStatus,
)
from app.models.user import User, UserRole
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