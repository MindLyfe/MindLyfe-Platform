from fastapi import APIRouter

from app.api.v1.endpoints import personalization, lyfbot, journal, recommendations

api_router = APIRouter()

api_router.include_router(personalization.router, prefix="/personalization", tags=["personalization"])
api_router.include_router(lyfbot.router, prefix="/lyfbot", tags=["lyfbot"])
api_router.include_router(journal.router, prefix="/journal", tags=["journal"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"]) 