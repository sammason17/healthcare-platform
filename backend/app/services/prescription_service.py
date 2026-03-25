from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.prescription import Prescription, PrescriptionStatus
from app.schemas.prescription import PrescriptionCreate


async def create_prescription(db: AsyncSession, data: PrescriptionCreate, prescribed_by: str) -> Prescription:
    prescription = Prescription(**data.model_dump(), prescribed_by=prescribed_by)
    db.add(prescription)
    await db.flush()
    await db.refresh(prescription)
    return prescription


async def get_prescription(db: AsyncSession, prescription_id: str) -> Prescription:
    result = await db.execute(select(Prescription).where(Prescription.id == prescription_id))
    prescription = result.scalar_one_or_none()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    return prescription


async def update_prescription_status(
    db: AsyncSession, prescription_id: str, new_status: PrescriptionStatus
) -> Prescription:
    prescription = await get_prescription(db, prescription_id)

    valid_transitions: dict[PrescriptionStatus, list[PrescriptionStatus]] = {
        PrescriptionStatus.pending: [PrescriptionStatus.approved, PrescriptionStatus.dispensed],
        PrescriptionStatus.approved: [PrescriptionStatus.dispensed],
        PrescriptionStatus.dispensed: [],
    }

    if new_status not in valid_transitions[prescription.status]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Cannot transition from {prescription.status} to {new_status}",
        )

    prescription.status = new_status
    await db.flush()
    await db.refresh(prescription)
    return prescription


async def get_active_prescriptions(db: AsyncSession) -> list[Prescription]:
    result = await db.execute(
        select(Prescription)
        .where(Prescription.status.in_([PrescriptionStatus.pending, PrescriptionStatus.approved]))
        .order_by(Prescription.created_at)
    )
    return list(result.scalars().all())


async def get_patient_prescriptions(db: AsyncSession, patient_id: str) -> list[Prescription]:
    result = await db.execute(
        select(Prescription).where(Prescription.patient_id == patient_id).order_by(Prescription.created_at.desc())
    )
    return list(result.scalars().all())
