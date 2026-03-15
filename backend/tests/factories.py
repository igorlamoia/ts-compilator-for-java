"""Factories for creating test data."""
import uuid
from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.organization import Organization
from app.models.user import User, UserRole

fake = Faker("pt_BR")


async def create_organization(session: AsyncSession, **kwargs) -> Organization:
    org = Organization(
        id=kwargs.get("id", str(uuid.uuid4())),
        name=kwargs.get("name", fake.company()),
    )
    session.add(org)
    await session.flush()
    return org


async def create_user(
    session: AsyncSession,
    organization: Organization,
    role: UserRole = UserRole.STUDENT,
    **kwargs,
) -> User:
    user = User(
        id=kwargs.get("id", str(uuid.uuid4())),
        organization_id=organization.id,
        role=role,
        email=kwargs.get("email", fake.unique.email()),
        password=hash_password(kwargs.get("password", "secret123")),
        name=kwargs.get("name", fake.name()),
        avatar_url=kwargs.get("avatar_url", None),
        bio=kwargs.get("bio", None),
    )
    session.add(user)
    await session.flush()
    return user
