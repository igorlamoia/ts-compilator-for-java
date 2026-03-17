from fastapi import APIRouter

from app.core.dependencies import SessionDep
from app.modules.organizations.service import list_organizations
from app.schemas.organizations import OrganizationResponse

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("", response_model=list[OrganizationResponse])
async def list_organizations_endpoint(session: SessionDep):
    return await list_organizations(session)
