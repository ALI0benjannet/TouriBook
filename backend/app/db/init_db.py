from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.user import UserCreate
from app.services import user_service

ADMIN_EMAIL = "admin@touribook.com"
ADMIN_PASSWORD = "Admin@1234"  # 10 caractères, OK pour bcrypt


def main() -> None:
    db = next(get_db())
    try:
        if user_service.get_by_email(db, ADMIN_EMAIL):
            print("Admin déjà existant.")
            return

        user_service.create_user(
            db,
            UserCreate(
                email=ADMIN_EMAIL,
                nom="Admin",
                prenom="TouriBook",
                password=ADMIN_PASSWORD
            ),
            role=UserRole.admin,   # Attention : minuscule
        )
        print(f"Admin créé : {ADMIN_EMAIL}")
    finally:
        db.close()


if __name__ == "__main__":
    main()