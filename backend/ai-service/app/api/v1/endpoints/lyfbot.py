from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.dependencies import get_current_user, get_db
from app.schemas.lyfbot import ChatMessage, ChatResponse
from app.services.model_service import ModelService, ModelFeature
from app.services.training_service import ModelTrainingService
from app.utils.compliance import check_consent, log_data_access

router = APIRouter()
model_service = ModelService()
training_service = ModelTrainingService()

class CrisisDetectionResponse(BaseModel):
    is_crisis: bool
    resources: Dict[str, str]
    recommendations: List[str]

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
        # Check user consent for AI processing
        has_consent = check_consent(current_user.id, "ai_chat_processing")
        if not has_consent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has not provided consent for AI chat processing"
            )
            
        # Log data access for GDPR compliance
        log_data_access(
            user_id=current_user.id,
            data_type="chat_message",
            access_reason="lyfbot_conversation",
            data_categories=["user_input", "chat_history"]
        )
        
        # Generate response using the model service
        response, metrics = await model_service.generate_chat_response(
            user_id=current_user.id,
            message=message.content,
            chat_history=message.history,
            context=message.context
        )
        
        # Collect training data asynchronously if content is approved for training
        # In a real implementation, this would check if the user has consented to their data being used for training
        if message.context and message.context.get("approved_for_training", False):
            await training_service.collect_training_data(
                feature=ModelFeature.CHAT,
                input_data={
                    "message": message.content,
                    "history": message.history,
                    "context": message.context
                },
                output_data=response,
                metadata={
                    "user_id": current_user.id,
                    "metrics": metrics
                }
            )
        
        return ChatResponse(
            message=response,
            success=True,
            metrics=metrics
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
        await model_service.reset_conversation(user_id=current_user.id)
        return {"success": True, "message": "Conversation history has been reset"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset conversation: {str(e)}"
        )

@router.post("/crisis-detection", response_model=CrisisDetectionResponse)
async def detect_crisis(
    message: ChatMessage,
    current_user = Depends(get_current_user)
):
    """
    Analyze user message for potential crisis signals and provide resources.
    """
    try:
        # For now, we'll implement a simple keyword-based approach
        # In a real implementation, this would use a dedicated model
        
        is_crisis = False
        lowercase_content = message.content.lower()
        
        for keyword in ["suicide", "kill myself", "end my life", "want to die", 
                      "harm myself", "self harm", "hurt myself"]:
            if keyword in lowercase_content:
                is_crisis = True
                break
                
        resources = {
            "crisis_text_line": "Text HOME to 741741",
            "suicide_prevention_lifeline": "1-800-273-8255",
            "samhsa_helpline": "1-800-662-4357"
        }
        
        recommendations = [
            "Contact a mental health professional immediately",
            "Reach out to a trusted friend or family member",
            "Go to your nearest emergency room if you're in immediate danger"
        ]
        
        return CrisisDetectionResponse(
            is_crisis=is_crisis,
            resources=resources,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform crisis detection: {str(e)}"
        ) 