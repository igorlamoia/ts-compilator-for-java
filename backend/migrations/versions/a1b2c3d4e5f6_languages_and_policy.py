"""languages table and exercise language policy

Revision ID: a1b2c3d4e5f6
Revises: f77e31d3931b
Create Date: 2026-05-19 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "f77e31d3931b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


language_policy_enum = postgresql.ENUM("OPEN", "LOCKED", name="languagepolicy")


def upgrade() -> None:
    """Upgrade schema."""
    schema_name = op.get_context().config.get_main_option("schema_name") or "public"
    if schema_name != "public":
        schema_escaped = schema_name.replace('"', '""')
        op.execute(sa.text(f'SET search_path TO "{schema_escaped}"'))

    bind = op.get_bind()

    # 1) Extend userrole enum with SYSTEM (Postgres-only DDL; no-op elsewhere).
    if bind.dialect.name == "postgresql":
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'SYSTEM'")

    # 2) Create languages table.
    op.create_table(
        "languages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column(
            "customization",
            postgresql.JSONB(astext_type=sa.Text()) if bind.dialect.name == "postgresql" else sa.JSON(),
            nullable=False,
        ),
        sa.Column("cloned_from_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["cloned_from_id"], ["languages.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("owner_id", "name", name="uq_languages_owner_name"),
    )
    op.create_index("ix_languages_owner_id", "languages", ["owner_id"], unique=False)

    # 3) users.active_language_id (alterable FK to break circular dependency).
    op.add_column("users", sa.Column("active_language_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_users_active_language_id",
        "users",
        "languages",
        ["active_language_id"],
        ["id"],
        ondelete="SET NULL",
    )

    # 4) exercises: language_policy + locked_language_id + CHECK.
    if bind.dialect.name == "postgresql":
        language_policy_enum.create(bind, checkfirst=True)
        op.add_column(
            "exercises",
            sa.Column(
                "language_policy",
                language_policy_enum,
                nullable=False,
                server_default="OPEN",
            ),
        )
    else:
        op.add_column(
            "exercises",
            sa.Column(
                "language_policy",
                sa.Enum("OPEN", "LOCKED", name="languagepolicy"),
                nullable=False,
                server_default="OPEN",
            ),
        )
    op.add_column("exercises", sa.Column("locked_language_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_exercises_locked_language_id",
        "exercises",
        "languages",
        ["locked_language_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_check_constraint(
        "ck_exercises_locked_language_consistency",
        "exercises",
        "(language_policy = 'LOCKED') = (locked_language_id IS NOT NULL)",
    )

    # 5) submissions.language_snapshot (NOT NULL with default '{}' so existing rows pass).
    if bind.dialect.name == "postgresql":
        op.add_column(
            "submissions",
            sa.Column(
                "language_snapshot",
                postgresql.JSONB(astext_type=sa.Text()),
                nullable=False,
                server_default=sa.text("'{}'::jsonb"),
            ),
        )
    else:
        op.add_column(
            "submissions",
            sa.Column(
                "language_snapshot",
                sa.JSON(),
                nullable=False,
                server_default=sa.text("'{}'"),
            ),
        )

    # 6) Seed system organization + system user.
    organizations = sa.table(
        "organizations",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("created_at", sa.DateTime),
    )
    users = sa.table(
        "users",
        sa.column("id", sa.Integer),
        sa.column("organization_id", sa.Integer),
        sa.column("role", sa.String),
        sa.column("email", sa.String),
        sa.column("password", sa.String),
        sa.column("name", sa.String),
    )

    existing_org = bind.execute(
        sa.select(organizations.c.id).where(organizations.c.name == "System")
    ).scalar_one_or_none()
    if existing_org is None:
        result = bind.execute(
            sa.insert(organizations)
            .values(name="System", created_at=sa.func.now())
            .returning(organizations.c.id)
        )
        org_id = result.scalar_one()
    else:
        org_id = existing_org

    existing_user = bind.execute(
        sa.select(users.c.id).where(users.c.email == "system@internal")
    ).scalar_one_or_none()
    if existing_user is None:
        bind.execute(
            sa.insert(users).values(
                organization_id=org_id,
                role="SYSTEM",
                email="system@internal",
                password="!disabled",
                name="System",
            )
        )


def downgrade() -> None:
    """Downgrade schema."""
    schema_name = op.get_context().config.get_main_option("schema_name") or "public"
    if schema_name != "public":
        schema_escaped = schema_name.replace('"', '""')
        op.execute(sa.text(f'SET search_path TO "{schema_escaped}"'))

    bind = op.get_bind()

    # Remove system user/org (idempotent).
    op.execute(sa.text("DELETE FROM users WHERE email = 'system@internal'"))
    op.execute(sa.text("DELETE FROM organizations WHERE name = 'System'"))

    op.drop_column("submissions", "language_snapshot")

    op.drop_constraint(
        "ck_exercises_locked_language_consistency", "exercises", type_="check"
    )
    op.drop_constraint("fk_exercises_locked_language_id", "exercises", type_="foreignkey")
    op.drop_column("exercises", "locked_language_id")
    op.drop_column("exercises", "language_policy")
    if bind.dialect.name == "postgresql":
        language_policy_enum.drop(bind, checkfirst=True)

    op.drop_constraint("fk_users_active_language_id", "users", type_="foreignkey")
    op.drop_column("users", "active_language_id")

    op.drop_index("ix_languages_owner_id", table_name="languages")
    op.drop_table("languages")

    # NOTE: 'SYSTEM' value is intentionally left in the userrole enum.
    # PostgreSQL does not support removing enum values without recreating the type;
    # leaving it is safe (no rows use it after the system user is deleted).
