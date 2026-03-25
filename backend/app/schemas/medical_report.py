from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class MedicalReportCreate(BaseModel):
    patient_id: str
    blood_pressure: str | None = None
    heart_rate: int | None = None
    temperature: float | None = None
    weight_kg: float | None = None
    height_cm: float | None = None
    notes: str | None = None


class MedicalReportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    recorded_by: str
    blood_pressure: str | None
    heart_rate: int | None
    temperature: float | None
    weight_kg: float | None
    height_cm: float | None
    notes: str | None
    recorded_at: datetime
