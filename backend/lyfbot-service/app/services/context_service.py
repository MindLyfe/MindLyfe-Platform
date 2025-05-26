import httpx
import logging
import json
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

from app.core.config import settings
from app.core.security import get_service_token

logger = logging.getLogger(__name__)

class ContextService:
    """Service for gathering context from other services for personalized responses"""
    
    # Cache for context data to avoid excessive API calls
    _context_cache = {}
    _cache_ttl = 300  # 5 minutes in seconds
    
    async def gather_context(
        self,
        user_id: str,
        conversation_id: Optional[int] = None,
        additional_context: Optional[Dict[str, Any]] = None,
        force_reload: bool = False
    ) -> Dict[str, Any]:
        """
        Gather context from various services to personalize LyfBot responses
        
        Args:
            user_id: The ID of the user
            conversation_id: The ID of the conversation (optional)
            additional_context: Additional context provided by the client
            force_reload: Whether to force reload the context from services
            
        Returns:
            Dict containing context information
        """
        cache_key = f"{user_id}:{conversation_id or 'none'}"
        
        # Check cache first if not forcing reload
        if not force_reload and cache_key in self._context_cache:
            cached_data = self._context_cache[cache_key]
            if datetime.now().timestamp() - cached_data["timestamp"] < self._cache_ttl:
                # Add additional context if provided
                if additional_context:
                    merged_context = cached_data["context"].copy()
                    merged_context.update(additional_context)
                    return merged_context
                return cached_data["context"]
        
        # Initialize context dictionary
        context = {}
        
        # Get token for service-to-service communication
        token = await get_service_token()
        
        # Gather user profile data
        try:
            user_profile = await self._get_user_profile(user_id, token)
            context["user_profile"] = user_profile
        except Exception as e:
            logger.error(f"Failed to get user profile: {str(e)}")
            context["user_profile"] = {}
            
        # Gather journal insights if available
        try:
            journal_insights = await self._get_journal_insights(user_id, token)
            context["journal_insights"] = journal_insights
        except Exception as e:
            logger.error(f"Failed to get journal insights: {str(e)}")
            context["journal_insights"] = {}
            
        # Gather recommended activities if available
        try:
            recommendations = await self._get_recommendations(user_id, token)
            context["recommendations"] = recommendations
        except Exception as e:
            logger.error(f"Failed to get recommendations: {str(e)}")
            context["recommendations"] = {}
            
        # Add any additional context provided by the client
        if additional_context:
            context.update(additional_context)
            
        # Cache the context
        self._context_cache[cache_key] = {
            "context": context,
            "timestamp": datetime.now().timestamp()
        }
        
        return context
    
    async def _get_user_profile(self, user_id: str, token: str) -> Dict[str, Any]:
        """
        Get user profile data from Auth Service
        
        Args:
            user_id: The ID of the user
            token: Service token for authentication
            
        Returns:
            Dict containing user profile data
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.AUTH_SERVICE_URL}/api/users/{user_id}/profile",
                    headers={
                        "Authorization": f"Bearer {token}"
                    },
                    timeout=5.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Failed to get user profile: {response.text}")
                    return {}
                    
                profile = response.json()
                
                # Filter sensitive information
                safe_profile = {
                    "name": profile.get("name", ""),
                    "preferences": profile.get("preferences", {}),
                    "mental_health_goals": profile.get("mental_health_goals", []),
                    "interests": profile.get("interests", []),
                    "joined_at": profile.get("created_at", "")
                }
                
                return safe_profile
                
        except httpx.RequestError as e:
            logger.error(f"Request to Auth Service failed: {str(e)}")
            return {}
    
    async def _get_journal_insights(self, user_id: str, token: str) -> Dict[str, Any]:
        """
        Get journal insights from Journal Service
        
        Args:
            user_id: The ID of the user
            token: Service token for authentication
            
        Returns:
            Dict containing journal insights
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.JOURNAL_SERVICE_URL}/api/v1/insights/user/{user_id}/summary",
                    headers={
                        "Authorization": f"Bearer {token}"
                    },
                    timeout=5.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Failed to get journal insights: {response.text}")
                    return {}
                    
                insights = response.json()
                
                # Filter and process insights
                processed_insights = {
                    "recent_themes": insights.get("recent_themes", [])[:5],
                    "mood_trend": insights.get("mood_trend", "stable"),
                    "common_emotions": insights.get("common_emotions", [])[:5],
                    "journaling_frequency": insights.get("journaling_frequency", "unknown")
                }
                
                return processed_insights
                
        except httpx.RequestError as e:
            logger.error(f"Request to Journal Service failed: {str(e)}")
            return {}
    
    async def _get_recommendations(self, user_id: str, token: str) -> Dict[str, Any]:
        """
        Get recommendations from Recommender Service
        
        Args:
            user_id: The ID of the user
            token: Service token for authentication
            
        Returns:
            Dict containing recommendations
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.RECOMMENDER_SERVICE_URL}/api/v1/recommendations",
                    json={
                        "count": 3,
                        "category": None,
                        "exclude_ids": []
                    },
                    headers={
                        "Authorization": f"Bearer {token}"
                    },
                    timeout=5.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Failed to get recommendations: {response.text}")
                    return {}
                    
                recommendations = response.json()
                
                # Process recommendations to a simpler format
                processed_recommendations = []
                for rec in recommendations:
                    processed_recommendations.append({
                        "title": rec.get("title", ""),
                        "category": rec.get("category", ""),
                        "description": rec.get("description", "")
                    })
                
                return {
                    "activities": processed_recommendations
                }
                
        except httpx.RequestError as e:
            logger.error(f"Request to Recommender Service failed: {str(e)}")
            return {} 