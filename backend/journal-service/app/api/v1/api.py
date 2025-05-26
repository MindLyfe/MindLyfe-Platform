from fastapi import APIRouter

from app.api.v1.endpoints import (
    journals,
    analysis,
    insights,
    categories,
    tags,
    health
)

api_router = APIRouter()

api_router.include_router(journals.router, prefix="/journals", tags=["journals"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])
api_router.include_router(health.router, prefix="/health", tags=["health"]) 