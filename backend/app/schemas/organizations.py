from app.schemas.base import CamelModel


class OrganizationResponse(CamelModel):
    id: int
    name: str
