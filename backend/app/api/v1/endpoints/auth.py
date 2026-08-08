from datetime import datetime, timezone
from sqlalchemy import select
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import (
    create_access_token,
    decode_token,
    generate_verification_code,
    hash_password,
    generate_raw_token,
    hash_token,
    expires_in,
    is_valid,
)
from app.db.session import get_db
from app.models.token import (
    EmailVerificationToken,
    PasswordResetToken,
    RefreshToken,
)
from app.models.user import User, UserRole
from app.schemas.token import (
    ChangePasswordIn,
    EmailIn,
    LoginRequest,
    RefreshRequest,
    ResetPasswordIn,
    ResendVerificationRequest,
    Token,
    TokenIn,
    VerifyEmailIn,
)
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services import user_service
from app.services.email_service import send_reset_password_email, send_verification_email

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(
    request: Request,
    payload: UserCreate,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if user_service.get_by_email(db, payload.email):
        raise HTTPException(status_code=409, detail="Un compte existe déjà avec cet e-mail")

    user = User(
        email=payload.email.lower(),
        nom=payload.nom,
        prenom=payload.prenom,
        hashed_password=hash_password(payload.password),
        role=UserRole.tourist,
        is_verified=False,
    )
    db.add(user)
    db.flush()

    raw = generate_verification_code()
    db.add(
        EmailVerificationToken(
            user_id=user.id,
            token_hash=hash_token(raw),
            expires_at=expires_in(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS),
        )
    )
    db.commit()

    nom = f"{payload.prenom} {payload.nom}"
    background.add_task(send_verification_email, user.email, nom, raw)
    return {"message": "Compte créé. Vérifiez votre boîte mail pour l'activer."}


def _issue_tokens(user: User, refresh_token: str) -> Token:
    return Token(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=refresh_token,
    )


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    user = user_service.authenticate(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail={
                "code": "invalid_credentials",
                "message": "E-mail ou mot de passe incorrect",
            },
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "email_not_verified",
                "message": "Confirmez votre e-mail avant de vous connecter",
            },
        )
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "account_disabled",
                "message": "Compte désactivé",
            },
        )

    raw_refresh = generate_raw_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(raw_refresh),
            expires_at=expires_in(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_agent=request.headers.get("user-agent"),
        )
    )
    db.commit()

    return _issue_tokens(user, raw_refresh)


# Permet le bouton "Authorize" de Swagger
@router.post("/login/form", response_model=Token, include_in_schema=False)
@limiter.limit("5/minute")
def login_form(
    request: Request,
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = user_service.authenticate(db, form.username, form.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail={
                "code": "invalid_credentials",
                "message": "E-mail ou mot de passe incorrect",
            },
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "email_not_verified",
                "message": "Confirmez votre e-mail avant de vous connecter",
            },
        )
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "account_disabled",
                "message": "Compte désactivé",
            },
        )

    raw_refresh = generate_raw_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(raw_refresh),
            expires_at=expires_in(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_agent=request.headers.get("user-agent"),
        )
    )
    db.commit()
    return _issue_tokens(user, raw_refresh)


@router.post("/refresh", response_model=Token)
@limiter.limit("10/minute")
def refresh(payload: RefreshRequest, request: Request, db: Session = Depends(get_db)):
    row = db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_token(payload.refresh_token)
        )
    )
    if not row or row.revoked or row.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expirée, reconnectez-vous")

    row.revoked = True
    new_raw = generate_raw_token()
    db.add(
        RefreshToken(
            user_id=row.user_id,
            token_hash=hash_token(new_raw),
            expires_at=expires_in(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_agent=request.headers.get("user-agent"),
        )
    )
    db.commit()

    return _issue_tokens(row.user, new_raw)


@router.post("/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(
    request: Request,
    payload: EmailIn,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = user_service.get_by_email(db, payload.email.lower())

    if user and user.is_active:
        raw = generate_raw_token()
        db.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=hash_token(raw),
                expires_at=expires_in(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES),
            )
        )
        db.commit()
        nom = f"{user.prenom} {user.nom}"
        background.add_task(send_reset_password_email, user.email, nom, raw)

    return {"message": "Si un compte existe avec cet e-mail, un lien vient d'être envoyé."}


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, payload: ResetPasswordIn, db: Session = Depends(get_db)):
    row = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == hash_token(payload.token)
        )
    )

    if not is_valid(row):
        raise HTTPException(status_code=400, detail="Lien invalide ou expiré")

    user = row.user
    user.hashed_password = hash_password(payload.new_password)
    row.used_at = datetime.now(timezone.utc)
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id,
        RefreshToken.revoked.is_(False),
    ).update({"revoked": True}, synchronize_session=False)
    db.commit()
    return {"message": "Mot de passe réinitialisé. Vous pouvez vous connecter."}


@router.post("/change-password")
@limiter.limit("10/minute")
def change_password(
    request: Request,
    payload: ChangePasswordIn,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not user_service.verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")
    if user_service.verify_password(payload.new_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit être différent de l'ancien")

    current_user.hashed_password = hash_password(payload.new_password)
    current_hash = hash_token(payload.refresh_token)
    db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.token_hash != current_hash,
        RefreshToken.revoked.is_(False),
    ).update({"revoked": True}, synchronize_session=False)
    db.commit()
    return {"message": "Mot de passe changé avec succès."}


@router.post("/logout")
@limiter.limit("10/minute")
def logout(request: Request, payload: TokenIn, db: Session = Depends(get_db)):
    db.query(RefreshToken).filter(
        RefreshToken.token_hash == hash_token(payload.token)
    ).update({"revoked": True}, synchronize_session=False)
    db.commit()
    return {"message": "Déconnecté"}


@router.post("/resend-verification")
@limiter.limit("5/minute")
def resend_verification(
    request: Request,
    payload: ResendVerificationRequest,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = user_service.get_by_email(db, payload.email)
    if user:
        now = datetime.now(timezone.utc)
        tokens = db.scalars(
            select(EmailVerificationToken).where(EmailVerificationToken.user_id == user.id)
        ).all()
        for token in tokens:
            token.used_at = now

        raw = generate_verification_code()
        db.add(
            EmailVerificationToken(
                user_id=user.id,
                token_hash=hash_token(raw),
                expires_at=expires_in(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS),
            )
        )
        db.commit()
        nom = f"{user.prenom} {user.nom}"
        background.add_task(send_verification_email, user.email, nom, raw)

    return {"message": "Si cet e-mail existe, un nouveau lien de vérification a été envoyé."}


@router.post("/verify-email")
@limiter.limit("5/minute")
def verify_email(request: Request, payload: VerifyEmailIn, db: Session = Depends(get_db)):
    row = db.scalar(
        select(EmailVerificationToken)
        .join(EmailVerificationToken.user)
        .where(
            User.email == payload.email.lower(),
            EmailVerificationToken.token_hash == hash_token(payload.token),
        )
    )

    if not is_valid(row):
        raise HTTPException(status_code=400, detail="Code invalide ou expiré")

    user = row.user
    if user.is_verified:
        return {"message": "Compte déjà vérifié"}

    now = datetime.now(timezone.utc)
    user.is_verified = True
    user.email_verified_at = now
    row.used_at = now
    db.commit()
    return {"message": "Compte activé avec succès"}


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.patch("/me", response_model=UserRead)
@limiter.limit("10/minute")
def update_me(
    request: Request,
    payload: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    updates = payload.model_dump(exclude_unset=True)
    if updates:
        for key, value in updates.items():
            setattr(current_user, key, value)
        db.commit()
        db.refresh(current_user)
    return current_user