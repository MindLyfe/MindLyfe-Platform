from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.api.dependencies import get_db
from app.core.security import validate_token
from app.services.feedback_service import FeedbackService

router = APIRouter()
feedback_service = FeedbackService()

class ConversationFeedback(BaseModel):
    conversation_id: int = Field(..., description="ID of the conversation being rated")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5")
    feedback_text: str = Field(None, description="Feedback text")
    improvement_areas: list = Field(None, description="Areas for improvement")

class BotFeedback(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5")
    feedback_text: str = Field(None, description="Feedback text")
    improvement_areas: list = Field(None, description="Areas for improvement")
    session_data: Dict[str, Any] = Field(None, description="Session data")

@router.post("/conversation", response_model=Dict[str, Any])
async def submit_conversation_feedback(
    feedback: ConversationFeedback,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Submit feedback for a specific conversation
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Store feedback
        result = await feedback_service.store_conversation_feedback(
            db=db,
            user_id=user_id,
            conversation_id=feedback.conversation_id,
            rating=feedback.rating,
            feedback_text=feedback.feedback_text,
            improvement_areas=feedback.improvement_areas
        )
        
        # Process feedback in the background
        background_tasks.add_task(
            feedback_service.process_feedback,
            feedback_id=result["feedback_id"],
            feedback_type="conversation",
            user_id=user_id,
            db=db
        )
        
        return {"status": "success", "message": "Feedback received"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        )

@router.post("/bot", response_model=Dict[str, Any])
async def submit_bot_feedback(
    feedback: BotFeedback,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Submit general feedback about LyfBot
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Store feedback
        result = await feedback_service.store_bot_feedback(
            db=db,
            user_id=user_id,
            rating=feedback.rating,
            feedback_text=feedback.feedback_text,
            improvement_areas=feedback.improvement_areas,
            session_data=feedback.session_data
        )
        
        # Process feedback in the background
        background_tasks.add_task(
            feedback_service.process_feedback,
            feedback_id=result["feedback_id"],
            feedback_type="bot",
            user_id=user_id,
            db=db
        )
        
        return {"status": "success", "message": "Feedback received"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        ) 