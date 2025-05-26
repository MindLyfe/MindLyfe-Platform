from fastapi import APIRouter

from app.api.v1.endpoints import (
    recommendations,
    categories,
    feedback,
    schedule,
    history,
    health
)

api_router = APIRouter()

api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(schedule.router, prefix="/schedule", tags=["schedule"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
api_router.include_router(health.router, prefix="/health", tags=["health"]) 