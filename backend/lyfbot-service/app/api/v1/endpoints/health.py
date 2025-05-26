from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.services.health_service import HealthService

router = APIRouter()
health_service = HealthService()

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    dependencies: dict

@router.get("", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Check the health of the service and its dependencies
    """
    health_status = await health_service.check_health(db)
    return health_status 