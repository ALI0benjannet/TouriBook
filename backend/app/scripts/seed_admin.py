import sys
import os

# Ajoute le dossier parent (backend/) au chemin de recherche
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.database import SessionLocal
from app.models.enums import UserRole
from app.models.users import User
from app.core.security import hash_password
from app.core.config import settings
from datetime import datetime, timezone

def run():
    db = SessionLocal()
    print(f"🔎 Mot de passe lu : {settings.FIRST_ADMIN_PASSWORD!r} (longueur : {len(settings.FIRST_ADMIN_PASSWORD)})")

    if db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first():
        print("Admin déjà présent")
        return

    db.add(User(
        email=settings.FIRST_ADMIN_EMAIL,
        hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
        nom="Administrateur",
        prenom="Principal",              # <- champ ajouté
        role=UserRole.admin,             # <- enum utilisé
        is_verified=True,
        is_active=True,
        email_verified_at=datetime.now(timezone.utc),
    ))
    db.commit()
    print("Admin créé")

if __name__ == "__main__":
    run()