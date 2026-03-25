from __future__ import annotations
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User, Role
from app.models.patient import Gender
from app.schemas.patient import PatientCreate, PatientUpdate, PatientRead, PaginatedPatients
from app.schemas.prescription import PrescriptionRead
from app.schemas.medical_report import MedicalReportRead
from app.services import patient_service, prescription_service, medical_report_service
from pydantic import BaseModel, ConfigDict
import math

router = APIRouter()


class PatientDetailRead(PatientRead):
    model_config = ConfigDict(from_attributes=True)
    prescriptions: list[PrescriptionRead] = []
    medical_reports: list[MedicalReportRead] = []


@router.post("", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
async def create_patient(
    data: PatientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.doctor, Role.admin)),
):
    return await patient_service.create_patient(db, data, current_user.id)


@router.get("", response_model=PaginatedPatients)
async def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    name: str | None = Query(None),
    gender: Gender | None = Query(None),
    min_age: int | None = Query(None, ge=0),
    max_age: int | None = Query(None, ge=0),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    items, total = await patient_service.get_patients(db, page, page_size, name, gender, min_age, max_age)
    pages = math.ceil(total / page_size) if total > 0 else 1
    return PaginatedPatients(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/{patient_id}", response_model=PatientDetailRead)
async def get_patient(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    patient = await patient_service.get_patient(db, patient_id)
    prescriptions = await prescription_service.get_patient_prescriptions(db, patient_id)
    medical_reports = await medical_report_service.get_patient_medical_reports(db, patient_id)
    return PatientDetailRead.model_validate(
        {**patient.__dict__, "prescriptions": prescriptions, "medical_reports": medical_reports}
    )


@router.put("/{patient_id}", response_model=PatientRead)
async def update_patient(
    patient_id: str,
    data: PatientUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(Role.doctor, Role.admin)),
):
    return await patient_service.update_patient(db, patient_id, data)
