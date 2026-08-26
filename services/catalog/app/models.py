"""Modèles du domaine Catalogue : catégories, activités, disponibilités.

NOTE microservices : plus de relations vers bookings/reviews — ces données
appartiennent à d'autres services et référencent activity_id par simple entier.
"""

from datetime import date, time

from sqlalchemy import Date, Float, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    nom: Mapped[str] = mapped_column(String(100), unique=True)
    # Traductions optionnelles ; `nom` (français) sert de repli.
    nom_en: Mapped[str | None] = mapped_column(String(100), nullable=True)
    nom_ar: Mapped[str | None] = mapped_column(String(100), nullable=True)

    activities = relationship("Activity", back_populates="category")


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(primary_key=True)
    titre: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    # Traductions optionnelles : le français (colonnes ci-dessus) sert de repli
    # quand une langue n'est pas renseignée.
    titre_en: Mapped[str | None] = mapped_column(String(200), nullable=True)
    titre_ar: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_ar: Mapped[str | None] = mapped_column(Text, nullable=True)
    prix: Mapped[float] = mapped_column(Float)
    duree: Mapped[int] = mapped_column(Integer)
    localisation: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    photos: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))

    category = relationship("Category", back_populates="activities")
    availabilities = relationship("Availability", back_populates="activity")


class Availability(Base):
    __tablename__ = "availabilities"

    id: Mapped[int] = mapped_column(primary_key=True)
    activity_id: Mapped[int] = mapped_column(ForeignKey("activities.id"))
    date: Mapped[date] = mapped_column(Date)
    heure: Mapped[time] = mapped_column(Time)
    # Compteur décrémenté à chaque réservation (UPDATE conditionnel atomique).
    places_disponibles: Mapped[int] = mapped_column(Integer, default=0)
    # Capacité d'origine, figée à la création du créneau. Sans elle,
    # `places_disponibles` n'est qu'un nombre : impossible de vérifier qu'il
    # correspond aux réservations réellement enregistrées. Sert de référence au
    # script de réconciliation (voir architecture.md §12 n° 3).
    places_totales: Mapped[int] = mapped_column(Integer, default=0, server_default="0")

    activity = relationship("Activity", back_populates="availabilities")
