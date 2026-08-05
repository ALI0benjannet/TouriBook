from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.core.security import REFRESH, create_access_token, create_refresh_token, decode_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.token import LoginRequest, RefreshRequest, Token
from app.schemas.user import UserCreate, UserRead
from app.services import user_service

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if user_service.get_by_email(db, payload.email):
        raise HTTPException(status_code=409, detail="Cet e-mail est déjà utilisé")
    return user_service.create_user(db, payload)


def _issue_tokens(user: User) -> Token:
    return Token(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=create_refresh_token(user.id, user.role.value),
    )


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = user_service.authenticate(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="E-mail ou mot de passe incorrect")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Compte désactivé")
    return _issue_tokens(user)


# Permet le bouton "Authorize" de Swagger
@router.post("/login/form", response_model=Token, include_in_schema=False)
def login_form(
    form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = user_service.authenticate(db, form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="E-mail ou mot de passe incorrect")
    return _issue_tokens(user)


@router.post("/refresh", response_model=Token)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    data = decode_token(payload.refresh_token)
    if data is None or data.get("type") != REFRESH:
        raise HTTPException(status_code=401, detail="Refresh token invalide")
    user = user_service.get_by_id(db, int(data["sub"]))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    return _issue_tokens(user)


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_active_user)):
    return current_user