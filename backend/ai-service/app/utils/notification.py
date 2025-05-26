import json
import logging
import uuid
from typing import Dict, Any, Optional
from datetime import datetime
import httpx
import asyncio

from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_notification_event(
    event_type: str,
    user_id: str,
    data: Dict[str, Any],
    priority: str = "normal",
    scheduled_time: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Send a notification event to the notification service
    
    Args:
        event_type: Type of notification event (e.g., "journal_reminder", "crisis_alert")
        user_id: ID of the user to notify
        data: Data to include in the notification
        priority: Priority of the notification ("low", "normal", "high", "urgent")
        scheduled_time: When to send the notification (None for immediate)
        
    Returns:
        Response from the notification service
    """
    try:
        # Create the notification payload
        notification_id = str(uuid.uuid4())
        
        payload = {
            "notification_id": notification_id,
            "event_type": event_type,
            "user_id": user_id,
            "data": data,
            "source": "ai-service",
            "priority": priority,
            "created_at": datetime.utcnow().isoformat(),
            "scheduled_time": scheduled_time.isoformat() if scheduled_time else None
        }
        
        # In a production environment, we'd use a message queue (SQS, RabbitMQ, etc.)
        # or make a direct API call to the notification service
        
        if settings.NOTIFICATION_SERVICE_URL:
            # Make an async HTTP request to the notification service
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.NOTIFICATION_SERVICE_URL}/api/v1/notifications",
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "X-Service-Key": settings.NOTIFICATION_SERVICE_API_KEY
                    },
                    timeout=10.0
                )
                
                if response.status_code != 200 and response.status_code != 202:
                    logger.error(f"Error sending notification: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "error": f"Notification service returned status {response.status_code}",
                        "notification_id": notification_id
                    }
                    
                return response.json()
        else:
            # For local development without the notification service
            # Just log the notification payload and simulate a delay
            logger.info(f"NOTIFICATION EVENT: {json.dumps(payload)}")
            await asyncio.sleep(0.1)  # Simulate processing delay
            
            return {
                "success": True,
                "notification_id": notification_id,
                "message": "Notification logged (notification service not configured)"
            }
            
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "notification_id": notification_id if 'notification_id' in locals() else None
        }

async def schedule_recurring_notification(
    event_type: str,
    user_id: str,
    data: Dict[str, Any],
    recurrence_pattern: str,  # "daily", "weekly", "monthly"
    start_time: datetime,
    end_time: Optional[datetime] = None,
    priority: str = "normal"
) -> Dict[str, Any]:
    """
    Schedule a recurring notification
    
    Args:
        event_type: Type of notification event
        user_id: ID of the user to notify
        data: Data to include in the notification
        recurrence_pattern: How often to send the notification
        start_time: When to start sending notifications
        end_time: When to stop sending notifications (None for no end)
        priority: Priority of the notification
        
    Returns:
        Response from the notification service
    """
    try:
        # Create the recurring notification payload
        schedule_id = str(uuid.uuid4())
        
        payload = {
            "schedule_id": schedule_id,
            "event_type": event_type,
            "user_id": user_id,
            "data": data,
            "source": "ai-service",
            "priority": priority,
            "recurrence_pattern": recurrence_pattern,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat() if end_time else None,
            "created_at": datetime.utcnow().isoformat()
        }
        
        if settings.NOTIFICATION_SERVICE_URL:
            # Make an async HTTP request to the notification service
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.NOTIFICATION_SERVICE_URL}/api/v1/notifications/schedule",
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "X-Service-Key": settings.NOTIFICATION_SERVICE_API_KEY
                    },
                    timeout=10.0
                )
                
                if response.status_code != 200 and response.status_code != 202:
                    logger.error(f"Error scheduling notification: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "error": f"Notification service returned status {response.status_code}",
                        "schedule_id": schedule_id
                    }
                    
                return response.json()
        else:
            # For local development without the notification service
            logger.info(f"SCHEDULED NOTIFICATION: {json.dumps(payload)}")
            await asyncio.sleep(0.1)  # Simulate processing delay
            
            return {
                "success": True,
                "schedule_id": schedule_id,
                "message": "Notification scheduled (notification service not configured)"
            }
            
    except Exception as e:
        logger.error(f"Error scheduling notification: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "schedule_id": schedule_id if 'schedule_id' in locals() else None
        }

async def cancel_scheduled_notification(
    schedule_id: str,
    user_id: str
) -> Dict[str, Any]:
    """
    Cancel a scheduled notification
    
    Args:
        schedule_id: ID of the notification schedule to cancel
        user_id: ID of the user who owns the notification
        
    Returns:
        Response from the notification service
    """
    try:
        if settings.NOTIFICATION_SERVICE_URL:
            # Make an async HTTP request to the notification service
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{settings.NOTIFICATION_SERVICE_URL}/api/v1/notifications/schedule/{schedule_id}",
                    params={"user_id": user_id},
                    headers={
                        "X-Service-Key": settings.NOTIFICATION_SERVICE_API_KEY
                    },
                    timeout=10.0
                )
                
                if response.status_code != 200 and response.status_code != 204:
                    logger.error(f"Error canceling notification: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "error": f"Notification service returned status {response.status_code}",
                        "schedule_id": schedule_id
                    }
                    
                return {"success": True, "schedule_id": schedule_id}
        else:
            # For local development without the notification service
            logger.info(f"CANCELED NOTIFICATION: Schedule ID {schedule_id} for user {user_id}")
            await asyncio.sleep(0.1)  # Simulate processing delay
            
            return {
                "success": True,
                "schedule_id": schedule_id,
                "message": "Notification cancellation logged (notification service not configured)"
            }
            
    except Exception as e:
        logger.error(f"Error canceling notification: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "schedule_id": schedule_id
        } 