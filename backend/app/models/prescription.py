from __future__ import annotations
import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Enum, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class PrescriptionStatus(str, enum.Enum):
    pending = "Pending"
    approved = "Approved"
    dispensed = "Dispensed"


class Prescription(Base):
    __tablename__ = "prescriptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    prescribed_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    medication_name: Mapped[str] = mapped_column(String(255), nullable=False)
    dosage: Mapped[str | None] = mapped_column(String(100), nullable=True)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[PrescriptionStatus] = mapped_column(
        Enum(PrescriptionStatus), default=PrescriptionStatus.pending, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    patient: Mapped["Patient"] = relationship("Patient", back_populates="prescriptions")
    prescriber: Mapped["User"] = relationship("User", back_populates="prescriptions_written", foreign_keys=[prescribed_by])
