from pydantic import BaseModel, EmailStr, ConfigDict


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    organization_id: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
