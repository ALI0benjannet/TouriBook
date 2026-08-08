from pathlib import Path

from fastapi_mail import FastMail, MessageSchema, MessageType, ConnectionConfig

from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER=Path(__file__).parent.parent / "templates" / "email",
)

fm = FastMail(conf)


async def send_verification_email(email: str, name: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/verify-email?email={email}"
    message = MessageSchema(
        subject="Confirmez votre compte TouriBook",
        recipients=[email],
        template_body={
            "name": name,
            "code": token,
            "link": link,
            "hours": settings.EMAIL_VERIFICATION_EXPIRE_HOURS,
        },
        subtype=MessageType.html,
    )
    await fm.send_message(message, template_name="verify_account.html")


async def send_reset_password_email(email: str, name: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    message = MessageSchema(
        subject="Réinitialisation de votre mot de passe",
        recipients=[email],
        template_body={
            "name": name,
            "link": link,
            "minutes": settings.PASSWORD_RESET_EXPIRE_MINUTES,
        },
        subtype=MessageType.html,
    )
    await fm.send_message(message, template_name="reset_password.html")
