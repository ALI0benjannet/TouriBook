("""Authentication-related business logic extracted from route handlers.

This module centralizes operations such as user registration, refresh
token creation/rotation and password reset token creation. Routers should
stay thin and call these functions to perform DB mutations.
""")

from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
	generate_verification_code,
	hash_token,
	generate_raw_token,
	expires_in,
	hash_password,
)
from app.models.email_verification_tokens import EmailVerificationToken
from app.models.password_reset_tokens import PasswordResetToken
from app.models.refresh_tokens import RefreshToken
from app.models.users import User
from app.models.enums import UserRole


def register_user(db: Session, email: str, nom: str, prenom: str, password: str, role: UserRole = UserRole.tourist) -> tuple[User, str]:
	"""Create a new user and associated email verification token.

	Returns (user, raw_token) so the caller can send the raw token by email.
	"""
	user = User(
		email=email.lower(),
		nom=nom,
		prenom=prenom,
		hashed_password=hash_password(password),
		role=role,
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
	return user, raw


def create_refresh_token(db: Session, user: User, user_agent: str | None = None) -> str:
	"""Create a refresh token for `user` and return the raw token string."""
	raw = generate_raw_token()
	db.add(
		RefreshToken(
			user_id=user.id,
			token_hash=hash_token(raw),
			expires_at=expires_in(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
			user_agent=user_agent,
		)
	)
	db.commit()
	return raw


def rotate_refresh_token(db: Session, old_raw: str, user_agent: str | None = None) -> tuple[User, str]:
	"""Validate `old_raw`, revoke it, create a new refresh token and return (user, new_raw).

	Raises ValueError when the old token is invalid/expired/revoked.
	"""
	row = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(old_raw)))
	if not row or row.revoked or row.expires_at < datetime.now(timezone.utc):
		raise ValueError("invalid_refresh")

	row.revoked = True
	new_raw = generate_raw_token()
	db.add(
		RefreshToken(
			user_id=row.user_id,
			token_hash=hash_token(new_raw),
			expires_at=expires_in(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
			user_agent=user_agent,
		)
	)
	db.commit()
	return row.user, new_raw


def revoke_refresh_token(db: Session, raw: str) -> None:
	"""Mark a refresh token as revoked."""
	db.query(RefreshToken).filter(RefreshToken.token_hash == hash_token(raw)).update({"revoked": True}, synchronize_session=False)
	db.commit()


def create_password_reset_token(db: Session, user: User) -> str:
	"""Create a password reset token for a user and return the raw token."""
	raw = generate_verification_code()
	db.add(
		PasswordResetToken(
			user_id=user.id,
			token_hash=hash_token(raw),
			expires_at=expires_in(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES),
		)
	)
	db.commit()
	return raw


def reset_password(db: Session, raw_token: str, new_password: str) -> None:
	"""Reset a password given a raw password-reset token.

	This will set the new password, mark the token used and revoke active refresh tokens.
	Raises ValueError if token is invalid/expired.
	"""
	row = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == hash_token(raw_token)))
	if not row or row.used_at is not None or row.expires_at < datetime.now(timezone.utc):
		raise ValueError("invalid_token")

	user = row.user
	user.hashed_password = hash_password(new_password)
	row.used_at = datetime.now(timezone.utc)
	db.query(RefreshToken).filter(
		RefreshToken.user_id == user.id,
		RefreshToken.revoked.is_(False),
	).update({"revoked": True}, synchronize_session=False)
	db.commit()


def change_password(db: Session, user: User, old_password: str, new_password: str, current_refresh_raw: str) -> None:
	"""Change `user` password after verifying the old password and revoke other refresh tokens.

	Raises ValueError when the old password is incorrect or the new password equals the old one.
	"""
	from app.core.security import verify_password, hash_password, hash_token

	if not verify_password(old_password, user.hashed_password):
		raise ValueError("old_password_incorrect")
	if verify_password(new_password, user.hashed_password):
		raise ValueError("new_same_as_old")

	user.hashed_password = hash_password(new_password)
	current_hash = hash_token(current_refresh_raw)
	db.query(RefreshToken).filter(
		RefreshToken.user_id == user.id,
		RefreshToken.token_hash != current_hash,
		RefreshToken.revoked.is_(False),
	).update({"revoked": True}, synchronize_session=False)
	db.commit()


def resend_verification(db: Session, user: User) -> str:
	"""Mark existing verification tokens used, create a new one and return the raw token."""
	raw = generate_verification_code()
	from datetime import datetime

	now = datetime.now(timezone.utc)
	tokens = db.scalars(select(EmailVerificationToken).where(EmailVerificationToken.user_id == user.id)).all()
	for token in tokens:
		token.used_at = now

	db.add(
		EmailVerificationToken(
			user_id=user.id,
			token_hash=hash_token(raw),
			expires_at=expires_in(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS),
		)
	)
	db.commit()
	return raw


def verify_email(db: Session, email: str | None, raw_token: str) -> None:
	"""Verify an email using a raw token; mark user verified and token used.

	Raises ValueError if token invalid/expired.
	"""
	if email:
		row = db.scalar(
			select(EmailVerificationToken)
			.join(EmailVerificationToken.user)
			.where(
				User.email == email.lower(),
				EmailVerificationToken.token_hash == hash_token(raw_token),
			)
		)
	else:
		row = db.scalar(
			select(EmailVerificationToken)
			.join(EmailVerificationToken.user)
			.where(EmailVerificationToken.token_hash == hash_token(raw_token))
		)
	if not row or row.used_at is not None or row.expires_at < datetime.now(timezone.utc):
		raise ValueError("invalid_token")

	user = row.user
	if user.is_verified:
		return

	now = datetime.now(timezone.utc)
	user.is_verified = True
	user.email_verified_at = now
	row.used_at = now
	db.commit()

