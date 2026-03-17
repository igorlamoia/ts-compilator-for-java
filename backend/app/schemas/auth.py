from pydantic import EmailStr
from app.schemas.base import CamelModel


class LoginRequest(CamelModel):
    email: EmailStr
    password: str


class RegisterRequest(CamelModel):
    email: EmailStr
    password: str
    name: str
    organization_id: int


class TokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"
