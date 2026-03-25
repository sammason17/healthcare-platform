from __future__ import annotations
import enum
import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, Date, DateTime, Enum, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Gender(str, enum.Enum):
    male = "Male"
    female = "Female"
    non_binary = "Non-binary"
    gender_fluid = "Gender fluid"
    transgender_male = "Transgender male"
    transgender_female = "Transgender female"
    genderqueer = "Genderqueer"
    agender = "Agender"
    prefer_not_to_say = "Prefer not to say"
    other = "Other"


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[Gender | None] = mapped_column(Enum(Gender), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    creator: Mapped["User | None"] = relationship("User", back_populates="patients_created", foreign_keys=[created_by])
    prescriptions: Mapped[list["Prescription"]] = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    medical_reports: Mapped[list["MedicalReport"]] = relationship("MedicalReport", back_populates="patient", cascade="all, delete-orphan")
