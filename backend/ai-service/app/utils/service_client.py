import json
import logging
import httpx
from typing import Dict, Any, Optional, Union
from datetime import datetime
import jwt
import asyncio

from app.core.config import settings

logger = logging.getLogger(__name__)

class ServiceClient:
    """
    Client for making authenticated requests to other services in the MindLyf platform.
    Handles service-to-service authentication and request formatting.
    """
    
    def __init__(self):
        self.auth_service_url = settings.AUTH_SERVICE_URL
        self.journal_service_url = settings.JOURNAL_SERVICE_URL
        self.recommender_service_url = settings.RECOMMENDER_SERVICE_URL
        self.lyfbot_service_url = settings.LYFBOT_SERVICE_URL
        self.notification_service_url = settings.NOTIFICATION_SERVICE_URL
        
        # Cache for service tokens
        self._service_tokens = {}
    
    async def _get_service_token(self) -> str:
        """
        Get a service token for authenticating with other services.
        Tokens are cached until they expire.
        """
        # Check if we have a non-expired token already
        if "token" in self._service_tokens and "expires_at" in self._service_tokens:
            expires_at = self._service_tokens["expires_at"]
            if expires_at > datetime.utcnow().timestamp():
                return self._service_tokens["token"]
        
        try:
            # Request a new service token from Auth Service
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.auth_service_url}/api/auth/service-token",
                    json={
                        "service_id": "ai-service",
                        "secret": settings.SECRET_KEY,
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Error getting service token: {response.status_code} - {response.text}")
                    raise Exception(f"Failed to get service token: {response.status_code}")
                
                token_response = response.json()
                self._service_tokens = {
                    "token": token_response["token"],
                    "expires_at": datetime.utcnow().timestamp() + (settings.SERVICE_TOKEN_EXPIRY_MINUTES * 60)
                }
                
                return self._service_tokens["token"]
        except Exception as e:
            logger.error(f"Error requesting service token: {str(e)}")
            # Fallback for development/testing
            if settings.SECRET_KEY:
                # Create a JWT token manually as fallback
                expires = datetime.utcnow().timestamp() + (60 * 60)  # 1 hour
                payload = {
                    "service_id": "ai-service",
                    "exp": expires
                }
                token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
                self._service_tokens = {
                    "token": token,
                    "expires_at": expires
                }
                return token
            raise
    
    async def _make_service_request(
        self,
        method: str,
        url: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, Any]] = None,
        timeout: float = 30.0
    ) -> Dict[str, Any]:
        """
        Make an authenticated request to another service
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            url: Full URL to request
            data: JSON data to send
            params: Query parameters
            headers: Additional headers
            timeout: Request timeout in seconds
            
        Returns:
            Response data as dict
        """
        if not headers:
            headers = {}
            
        # Add service token if configured
        if settings.SERVICE_TOKEN_ENABLED:
            token = await self._get_service_token()
            headers["Authorization"] = f"Bearer {token}"
            
        headers["Content-Type"] = "application/json"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await getattr(client, method.lower())(
                    url,
                    json=data,
                    params=params,
                    headers=headers,
                    timeout=timeout
                )
                
                if response.status_code >= 400:
                    logger.error(f"Service request error: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "error": f"Service returned status {response.status_code}",
                        "status_code": response.status_code,
                        "detail": response.text
                    }
                
                if response.status_code == 204:  # No content
                    return {"success": True}
                    
                return response.json()
        except Exception as e:
            logger.error(f"Error in service request to {url}: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    # Journal Service Methods
    
    async def get_journal_insights(self, user_id: str) -> Dict[str, Any]:
        """Get user's journal insights from Journal Service"""
        url = f"{self.journal_service_url}/api/v1/insights/user/{user_id}/summary"
        return await self._make_service_request("GET", url)
    
    async def get_journal_entries(
        self,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get user's recent journal entries"""
        url = f"{self.journal_service_url}/api/v1/entries"
        params = {"user_id": user_id, "limit": limit, "offset": offset}
        return await self._make_service_request("GET", url, params=params)
    
    # Recommender Service Methods
    
    async def get_recommendations(
        self,
        user_id: str,
        category: Optional[str] = None,
        count: int = 3
    ) -> Dict[str, Any]:
        """Get personalized recommendations for a user"""
        url = f"{self.recommender_service_url}/api/v1/recommendations"
        data = {
            "user_id": user_id,
            "count": count,
            "include_context": True
        }
        if category:
            data["category"] = category
            
        return await self._make_service_request("POST", url, data=data)
    
    # LyfBot Service Methods
    
    async def get_conversation_history(self, user_id: str, limit: int = 10) -> Dict[str, Any]:
        """Get user's recent conversation history with LyfBot"""
        url = f"{self.lyfbot_service_url}/api/v1/conversations/history/{user_id}"
        params = {"limit": limit}
        return await self._make_service_request("GET", url, params=params)
    
    # Notification Service Methods
    
    async def send_notification(
        self,
        user_id: str,
        event_type: str,
        data: Dict[str, Any],
        priority: str = "normal"
    ) -> Dict[str, Any]:
        """Send a notification to a user"""
        url = f"{self.notification_service_url}/api/v1/notifications"
        payload = {
            "event_type": event_type,
            "user_id": user_id,
            "data": data,
            "source": "ai-service",
            "priority": priority,
            "created_at": datetime.utcnow().isoformat()
        }
        return await self._make_service_request("POST", url, data=payload)

# Singleton instance
service_client = ServiceClient() 