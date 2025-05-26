from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.core.security import validate_token
from app.schemas.message import (
    MessageRequest,
    MessageResponse,
    MessageWithAnalysis,
    StreamMessageRequest,
    MessageFeedback
)
from app.services.message_service import MessageService
from app.services.conversation_service import ConversationService
from app.services.ai_service import AIService
from app.services.context_service import ContextService
from app.services.crisis_service import CrisisService

router = APIRouter()
message_service = MessageService()
conversation_service = ConversationService()
ai_service = AIService()
context_service = ContextService()
crisis_service = CrisisService()

@router.post("", response_model=MessageResponse)
async def send_message(
    message: MessageRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Send a message to LyfBot and get a response
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Get or create conversation
        conversation_id = message.conversation_id
        if not conversation_id:
            conversation = await conversation_service.create_conversation(
                db, 
                user_id, 
                initial_message=message.content
            )
            conversation_id = conversation.id
        else:
            # Verify the conversation belongs to the user
            conversation = await conversation_service.get_conversation(
                db, 
                conversation_id, 
                user_id
            )
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found"
                )
                
        # Get user context from other services
        context = await context_service.gather_context(
            user_id=user_id,
            conversation_id=conversation_id,
            additional_context=message.context
        )
        
        # Check for crisis indicators
        is_crisis, crisis_type = await crisis_service.detect_crisis(
            message.content, 
            user_id
        )
        
        if is_crisis:
            # Handle crisis in the background
            background_tasks.add_task(
                crisis_service.handle_crisis,
                user_id=user_id,
                crisis_type=crisis_type,
                message_content=message.content,
                conversation_id=conversation_id
            )
        
        # Save user message
        user_message = await message_service.create_message(
            db,
            conversation_id=conversation_id,
            role="user",
            content=message.content,
            user_id=user_id
        )
        
        # Get response from AI service
        response_content = await ai_service.generate_response(
            message=message.content,
            conversation_id=conversation_id,
            user_id=user_id,
            context=context,
            is_crisis=is_crisis,
            crisis_type=crisis_type if is_crisis else None
        )
        
        # Save assistant response
        assistant_message = await message_service.create_message(
            db,
            conversation_id=conversation_id,
            role="assistant",
            content=response_content,
            user_id=user_id
        )
        
        # Update conversation timestamp
        await conversation_service.update_conversation_timestamp(
            db,
            conversation_id=conversation_id
        )
        
        # Analyze message and response in the background
        background_tasks.add_task(
            ai_service.analyze_message,
            message_id=user_message.id,
            content=message.content,
            user_id=user_id,
            db=db
        )
        
        return assistant_message
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )

@router.post("/stream", response_model=None)
async def stream_message(
    message: StreamMessageRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Send a message to LyfBot and get a streamed response
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Get or create conversation
        conversation_id = message.conversation_id
        if not conversation_id:
            conversation = await conversation_service.create_conversation(
                db, 
                user_id, 
                initial_message=message.content
            )
            conversation_id = conversation.id
        else:
            # Verify the conversation belongs to the user
            conversation = await conversation_service.get_conversation(
                db, 
                conversation_id, 
                user_id
            )
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found"
                )
        
        # Get user context from other services
        context = await context_service.gather_context(
            user_id=user_id,
            conversation_id=conversation_id,
            additional_context=message.context
        )
        
        # Check for crisis indicators
        is_crisis, crisis_type = await crisis_service.detect_crisis(
            message.content, 
            user_id
        )
        
        if is_crisis:
            # Handle crisis in the background
            background_tasks.add_task(
                crisis_service.handle_crisis,
                user_id=user_id,
                crisis_type=crisis_type,
                message_content=message.content,
                conversation_id=conversation_id
            )
        
        # Save user message
        user_message = await message_service.create_message(
            db,
            conversation_id=conversation_id,
            role="user",
            content=message.content,
            user_id=user_id
        )
        
        # Update conversation timestamp
        await conversation_service.update_conversation_timestamp(
            db,
            conversation_id=conversation_id
        )
        
        # Analyze message in the background
        background_tasks.add_task(
            ai_service.analyze_message,
            message_id=user_message.id,
            content=message.content,
            user_id=user_id,
            db=db
        )
        
        # Return streaming response
        return StreamingResponse(
            ai_service.stream_response(
                message=message.content,
                conversation_id=conversation_id,
                user_id=user_id,
                context=context,
                is_crisis=is_crisis,
                crisis_type=crisis_type if is_crisis else None,
                db=db
            ),
            media_type="text/event-stream"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )

@router.get("/{message_id}", response_model=MessageWithAnalysis)
async def get_message(
    message_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Get a specific message with its analysis
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Get message
        message = await message_service.get_message_with_analysis(
            db,
            message_id=message_id,
            user_id=user_id
        )
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
            
        return message
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get message: {str(e)}"
        )

@router.post("/feedback", response_model=dict)
async def submit_message_feedback(
    feedback: MessageFeedback,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Submit feedback on a message to improve future responses
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Save feedback
        await message_service.save_message_feedback(
            db,
            message_id=feedback.message_id,
            user_id=user_id,
            is_helpful=feedback.is_helpful,
            feedback_text=feedback.feedback_text
        )
        
        return {"status": "success", "message": "Feedback saved"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save feedback: {str(e)}"
        ) 