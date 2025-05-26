import httpx
import logging
import time
import asyncio
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text

from app.core.config import settings

logger = logging.getLogger(__name__)

class HealthService:
    """Service for checking the health of the LyfBot service and its dependencies"""
    
    async def check_health(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Check the health of the service and its dependencies
        
        Args:
            db: Database session
            
        Returns:
            Dict containing health status
        """
        # Initialize health status
        health_status = {
            "status": "ok",
            "service": "lyfbot-service",
            "version": "0.1.0",
            "dependencies": {}
        }
        
        # Check database connection
        db_status = await self._check_database(db)
        health_status["dependencies"]["database"] = db_status
        
        # Check auth service
        auth_status = await self._check_service(settings.AUTH_SERVICE_URL, "auth-service")
        health_status["dependencies"]["auth_service"] = auth_status
        
        # Check AI service
        ai_status = await self._check_service(settings.AI_SERVICE_URL, "ai-service")
        health_status["dependencies"]["ai_service"] = ai_status
        
        # Check journal service
        journal_status = await self._check_service(settings.JOURNAL_SERVICE_URL, "journal-service")
        health_status["dependencies"]["journal_service"] = journal_status
        
        # Check recommender service
        recommender_status = await self._check_service(settings.RECOMMENDER_SERVICE_URL, "recommender-service")
        health_status["dependencies"]["recommender_service"] = recommender_status
        
        # Check notification service
        notification_status = await self._check_service(settings.NOTIFICATION_SERVICE_URL, "notification-service")
        health_status["dependencies"]["notification_service"] = notification_status
        
        # Determine overall status
        if any(dep["status"] == "error" for dep in health_status["dependencies"].values()):
            if all(dep["status"] == "error" for dep in health_status["dependencies"].values()):
                health_status["status"] = "error"
            else:
                health_status["status"] = "degraded"
        
        return health_status
    
    async def _check_database(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Check database connection
        
        Args:
            db: Database session
            
        Returns:
            Dict containing database health status
        """
        try:
            # Execute a simple query
            start_time = time.time()
            result = await db.execute(text("SELECT 1"))
            response_time = time.time() - start_time
            
            return {
                "status": "ok",
                "response_time": round(response_time * 1000, 2),  # ms
                "message": "Database connection successful"
            }
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return {
                "status": "error",
                "response_time": None,
                "message": f"Database connection failed: {str(e)}"
            }
    
    async def _check_service(self, url: str, name: str) -> Dict[str, Any]:
        """
        Check the health of a dependent service
        
        Args:
            url: The base URL of the service
            name: The name of the service
            
        Returns:
            Dict containing service health status
        """
        try:
            # Make a request to the service's health endpoint
            start_time = time.time()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{url}/health",
                    timeout=2.0
                )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                return {
                    "status": "ok",
                    "response_time": round(response_time * 1000, 2),  # ms
                    "message": f"{name} is healthy"
                }
            else:
                return {
                    "status": "degraded",
                    "response_time": round(response_time * 1000, 2),  # ms
                    "message": f"{name} returned status {response.status_code}"
                }
        except httpx.RequestError as e:
            logger.error(f"Health check for {name} failed: {str(e)}")
            return {
                "status": "error",
                "response_time": None,
                "message": f"Failed to connect to {name}: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Health check for {name} failed with unexpected error: {str(e)}")
            return {
                "status": "error",
                "response_time": None,
                "message": f"Unexpected error checking {name}: {str(e)}"
            } 