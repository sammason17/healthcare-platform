from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.medical_report import MedicalReport
from app.schemas.medical_report import MedicalReportCreate


async def create_medical_report(db: AsyncSession, data: MedicalReportCreate, recorded_by: str) -> MedicalReport:
    report = MedicalReport(**data.model_dump(), recorded_by=recorded_by)
    db.add(report)
    await db.flush()
    await db.refresh(report)
    return report


async def get_patient_medical_reports(db: AsyncSession, patient_id: str) -> list[MedicalReport]:
    result = await db.execute(
        select(MedicalReport).where(MedicalReport.patient_id == patient_id).order_by(MedicalReport.recorded_at.desc())
    )
    return list(result.scalars().all())
