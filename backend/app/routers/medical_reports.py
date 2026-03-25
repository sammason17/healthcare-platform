from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.dependencies.auth import require_role
from app.models.user import User, Role
from app.schemas.medical_report import MedicalReportCreate, MedicalReportRead
from app.services import medical_report_service

router = APIRouter()


@router.post("", response_model=MedicalReportRead, status_code=status.HTTP_201_CREATED)
async def create_medical_report(
    data: MedicalReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.doctor, Role.admin)),
):
    return await medical_report_service.create_medical_report(db, data, current_user.id)
