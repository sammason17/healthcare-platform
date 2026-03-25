from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User, Role
from app.schemas.prescription import PrescriptionCreate, PrescriptionStatusUpdate, PrescriptionRead
from app.services import prescription_service

router = APIRouter()


@router.post("", response_model=PrescriptionRead, status_code=status.HTTP_201_CREATED)
async def create_prescription(
    data: PrescriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(Role.doctor)),
):
    return await prescription_service.create_prescription(db, data, current_user.id)


@router.get("/active", response_model=list[PrescriptionRead])
async def get_active_prescriptions(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(Role.doctor, Role.pharmacist, Role.admin)),
):
    return await prescription_service.get_active_prescriptions(db)


@router.patch("/{prescription_id}/status", response_model=PrescriptionRead)
async def update_prescription_status(
    prescription_id: str,
    data: PrescriptionStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(Role.doctor, Role.pharmacist, Role.admin)),
):
    return await prescription_service.update_prescription_status(db, prescription_id, data.status)
