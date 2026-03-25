from __future__ import annotations
from datetime import date, timedelta
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.patient import Patient, Gender
from app.schemas.patient import PatientCreate, PatientUpdate


async def create_patient(db: AsyncSession, data: PatientCreate, created_by: str) -> Patient:
    patient = Patient(**data.model_dump(), created_by=created_by)
    db.add(patient)
    await db.flush()
    await db.refresh(patient)
    return patient


async def get_patient(db: AsyncSession, patient_id: str) -> Patient:
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


async def update_patient(db: AsyncSession, patient_id: str, data: PatientUpdate) -> Patient:
    patient = await get_patient(db, patient_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
    await db.flush()
    await db.refresh(patient)
    return patient


async def get_patients(
    db: AsyncSession,
    page: int,
    page_size: int,
    name: str | None,
    gender: Gender | None,
    min_age: int | None,
    max_age: int | None,
) -> tuple[list[Patient], int]:
    query = select(Patient)

    if name:
        like = f"%{name}%"
        query = query.where(
            or_(Patient.first_name.ilike(like), Patient.last_name.ilike(like))
        )

    if gender:
        query = query.where(Patient.gender == gender)

    today = date.today()
    if min_age is not None:
        max_dob = today - timedelta(days=min_age * 365)
        query = query.where(Patient.date_of_birth <= max_dob)

    if max_age is not None:
        min_dob = today - timedelta(days=(max_age + 1) * 365)
        query = query.where(Patient.date_of_birth >= min_dob)

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar_one()

    query = query.order_by(Patient.last_name).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = list(result.scalars().all())

    return items, total
