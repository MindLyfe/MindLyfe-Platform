from fastapi import APIRouter

from app.api.v1.endpoints import (
    conversations,
    messages,
    context,
    feedback,
    health
)

api_router = APIRouter()

api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(context.router, prefix="/context", tags=["context"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(health.router, prefix="/health", tags=["health"]) 