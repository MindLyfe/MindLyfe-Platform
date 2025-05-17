from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.schemas.lyfbot import ChatMessage, ChatResponse
from app.services.openai_service import OpenAIService

router = APIRouter()
openai_service = OpenAIService()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_lyfbot(
    message: ChatMessage,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Chat with LyfBot - the AI assistant for mental health support.
    """
    try:
        response = await openai_service.generate_chat_response(
            user_id=current_user.id,
            message=message.content,
            chat_history=message.history,
            context=message.context
        )
        return ChatResponse(
            message=response,
            success=True
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate response: {str(e)}"
        )

@router.post("/reset-conversation")
async def reset_lyfbot_conversation(
    current_user = Depends(get_current_user)
):
    """
    Reset the conversation history with LyfBot.
    """
    try:
        await openai_service.reset_conversation(user_id=current_user.id)
        return {"success": True, "message": "Conversation history has been reset"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset conversation: {str(e)}"
        ) 