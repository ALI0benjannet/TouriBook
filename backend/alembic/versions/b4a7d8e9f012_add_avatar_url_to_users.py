"""add avatar url to users

Revision ID: b4a7d8e9f012
Revises: f9768632d239
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b4a7d8e9f012"
down_revision: Union[str, Sequence[str], None] = "f9768632d239"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("avatar_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "avatar_url")