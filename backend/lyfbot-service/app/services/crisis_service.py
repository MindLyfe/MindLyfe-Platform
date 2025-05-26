import httpx
import logging
import time
from typing import Tuple, Optional, Dict, Any

from app.core.config import settings
from app.core.security import get_service_token

logger = logging.getLogger(__name__)

class CrisisService:
    """Service for detecting and handling crisis situations"""
    
    async def detect_crisis(
        self,
        content: str,
        user_id: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Detect if a message indicates a crisis situation
        
        Args:
            content: The message content
            user_id: The ID of the user
            
        Returns:
            Tuple of (is_crisis, crisis_type)
        """
        # Use AI Service for crisis detection through the AIService
        from app.services.ai_service import AIService
        ai_service = AIService()
        
        return await ai_service.detect_crisis(content, user_id)
    
    async def handle_crisis(
        self,
        user_id: str,
        crisis_type: str,
        message_content: str,
        conversation_id: int
    ) -> None:
        """
        Handle a detected crisis situation
        
        Args:
            user_id: The ID of the user
            crisis_type: The type of crisis
            message_content: The message content that triggered the crisis detection
            conversation_id: The ID of the conversation
        """
        try:
            # 1. Log the crisis
            logger.warning(f"Crisis detected: {crisis_type} for user {user_id} in conversation {conversation_id}")
            
            # 2. Get the crisis response template
            crisis_response = settings.CRISIS_RESPONSE.get(
                crisis_type,
                {
                    "message": "I notice you might be going through a difficult time. Please reach out to a mental health professional for support.",
                    "resources": [
                        {"name": "Crisis Text Line", "contact": "Text HOME to 741741"},
                        {"name": "National Suicide Prevention Lifeline", "contact": "1-800-273-8255"}
                    ],
                    "notification_level": "medium"
                }
            )
            
            # 3. Send notification to appropriate services based on severity
            notification_level = crisis_response.get("notification_level", "medium")
            
            if notification_level in ["high", "urgent"]:
                await self._send_crisis_notification(
                    user_id=user_id,
                    crisis_type=crisis_type,
                    notification_level=notification_level,
                    conversation_id=conversation_id
                )
            
            # 4. Store crisis record for future reference
            await self._store_crisis_record(
                user_id=user_id,
                crisis_type=crisis_type,
                message_content=message_content,
                conversation_id=conversation_id,
                notification_level=notification_level
            )
            
        except Exception as e:
            logger.error(f"Failed to handle crisis: {str(e)}")
    
    async def _send_crisis_notification(
        self,
        user_id: str,
        crisis_type: str,
        notification_level: str,
        conversation_id: int
    ) -> None:
        """
        Send a notification about the crisis to the notification service
        
        Args:
            user_id: The ID of the user
            crisis_type: The type of crisis
            notification_level: The severity level of the notification
            conversation_id: The ID of the conversation
        """
        try:
            # Get service token for authentication
            token = await get_service_token()
            
            # Prepare notification payload
            payload = {
                "user_id": user_id,
                "type": "crisis_alert",
                "urgency": notification_level,
                "data": {
                    "crisis_type": crisis_type,
                    "conversation_id": conversation_id,
                    "timestamp": str(int(time.time())),
                    "source": "lyfbot"
                }
            }
            
            # Send notification
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.NOTIFICATION_SERVICE_URL}/api/v1/notifications",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {token}"
                    },
                    timeout=5.0
                )
                
                if response.status_code != 200 and response.status_code != 201:
                    logger.error(f"Failed to send crisis notification: {response.text}")
                    
        except Exception as e:
            logger.error(f"Failed to send crisis notification: {str(e)}")
    
    async def _store_crisis_record(
        self,
        user_id: str,
        crisis_type: str,
        message_content: str,
        conversation_id: int,
        notification_level: str
    ) -> None:
        """
        Store a record of the crisis for future reference
        
        Args:
            user_id: The ID of the user
            crisis_type: The type of crisis
            message_content: The message content that triggered the crisis detection
            conversation_id: The ID of the conversation
            notification_level: The severity level of the notification
        """
        try:
            # This would typically store the crisis record in the database
            # TODO: Implement this with the database
            logger.info(f"Storing crisis record for user {user_id}, type {crisis_type}, level {notification_level}")
            
        except Exception as e:
            logger.error(f"Failed to store crisis record: {str(e)}") 