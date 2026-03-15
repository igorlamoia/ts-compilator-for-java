from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    role: UserRole
    email: str
    name: str
    avatar_url: str | None = None
    bio: str | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
