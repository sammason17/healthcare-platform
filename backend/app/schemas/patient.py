from __future__ import annotations
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.patient import Gender


class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: Gender | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None


class PatientUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    gender: Gender | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None


class PatientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: Gender | None
    email: str | None
    phone: str | None
    address: str | None
    created_at: datetime
    updated_at: datetime


class PaginatedPatients(BaseModel):
    items: list[PatientRead]
    total: int
    page: int
    page_size: int
    pages: int
