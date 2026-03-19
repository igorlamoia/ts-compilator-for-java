from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization


async def list_organizations(db: AsyncSession) -> list[Organization]:
    result = await db.execute(select(Organization))
    return list(result.scalars().all())
