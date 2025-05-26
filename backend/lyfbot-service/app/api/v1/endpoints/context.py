from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.core.security import validate_token
from app.services.context_service import ContextService

router = APIRouter()
context_service = ContextService()

@router.get("", response_model=Dict[str, Any])
async def get_user_context(
    conversation_id: int = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Get the current context for a user or conversation
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Get context
        context = await context_service.gather_context(
            user_id=user_id,
            conversation_id=conversation_id
        )
        
        return context
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get context: {str(e)}"
        )

@router.post("/reload", response_model=Dict[str, Any])
async def reload_user_context(
    conversation_id: int = None,
    force: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Force a reload of the user context from other services
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Reload context
        context = await context_service.gather_context(
            user_id=user_id,
            conversation_id=conversation_id,
            force_reload=True
        )
        
        return context
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reload context: {str(e)}"
        ) 