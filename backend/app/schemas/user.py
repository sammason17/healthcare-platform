from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from app.models.user import Role


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Role
    first_name: str
    last_name: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    role: Role
    first_name: str | None
    last_name: str | None
    is_active: bool
