from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.prescription import PrescriptionStatus


class PrescriptionCreate(BaseModel):
    patient_id: str
    medication_name: str
    dosage: str | None = None
    instructions: str | None = None


class PrescriptionStatusUpdate(BaseModel):
    status: PrescriptionStatus


class PrescriptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    prescribed_by: str
    medication_name: str
    dosage: str | None
    instructions: str | None
    status: PrescriptionStatus
    created_at: datetime
    updated_at: datetime
