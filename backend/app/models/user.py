from __future__ import annotations
import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Role(str, enum.Enum):
    doctor = "Doctor"
    pharmacist = "Pharmacist"
    admin = "Admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(Enum(Role), nullable=False)
    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    patients_created: Mapped[list] = relationship("Patient", back_populates="creator", foreign_keys="Patient.created_by")
    prescriptions_written: Mapped[list] = relationship("Prescription", back_populates="prescriber", foreign_keys="Prescription.prescribed_by")
    medical_reports_recorded: Mapped[list] = relationship("MedicalReport", back_populates="recorder", foreign_keys="MedicalReport.recorded_by")
