from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime
import httpx
import time
import asyncio

from app.services.model_service import ModelService
from app.core.config import settings
from app.core.dependencies import get_current_user, get_admin_user

router = APIRouter()
model_service = ModelService()

class HealthStatus(BaseModel):
    status: str
    version: str
    timestamp: datetime
    features: Dict[str, bool]
    models: Dict[str, Any]
    environment: str

@router.get("/")
async def health_check():
    """
    Basic health check endpoint to verify if the service is running.
    """
    return {
        "status": "ok",
        "service": "ai-service",
        "version": "0.1.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/detailed", dependencies=[Depends(get_current_user)])
async def detailed_health_check():
    """
    Detailed health check with memory usage, uptime, and service dependencies.
    Requires authentication.
    """
    start_time = time.time()
    
    # Check service dependencies
    service_statuses = await check_service_dependencies()
    
    # Check OpenAI API
    openai_status = await check_openai_api()
    
    # Get system info
    import psutil
    import os
    
    # Process info
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    
    return {
        "status": "ok",
        "service": "ai-service",
        "version": "0.1.0",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": time.time() - process.create_time(),
        "memory": {
            "rss": memory_info.rss / (1024 * 1024),  # MB
            "vms": memory_info.vms / (1024 * 1024),  # MB
        },
        "dependencies": {
            "services": service_statuses,
            "openai": openai_status
        },
        "response_time": time.time() - start_time
    }

@router.get("/metrics", dependencies=[Depends(get_admin_user)])
async def health_metrics():
    """
    Advanced health metrics for monitoring.
    Requires admin privileges.
    """
    # Implementation would include more detailed metrics
    # like request count, error rates, etc.
    return {
        "status": "ok",
        "service": "ai-service",
        "metrics": {
            "request_count": 0,  # Would be populated from metrics collection
            "error_rate": 0.0,
            "average_response_time": 0.0
        }
    }

async def check_service_dependencies() -> Dict[str, Dict[str, Any]]:
    """
    Check connectivity with dependent services
    """
    services = {
        "auth-service": settings.AUTH_SERVICE_URL,
        "journal-service": settings.JOURNAL_SERVICE_URL,
        "recommender-service": settings.RECOMMENDER_SERVICE_URL,
        "lyfbot-service": settings.LYFBOT_SERVICE_URL,
        "notification-service": settings.NOTIFICATION_SERVICE_URL
    }
    
    results = {}
    
    async def check_service(name: str, url: str):
        try:
            start_time = time.time()
            health_url = f"{url}/health"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(health_url, timeout=5.0)
                latency = time.time() - start_time
                
                results[name] = {
                    "status": "ok" if response.status_code == 200 else "error",
                    "latency": latency,
                    "status_code": response.status_code
                }
        except Exception as e:
            results[name] = {
                "status": "error",
                "error": str(e),
                "latency": time.time() - start_time
            }
    
    # Check services concurrently
    await asyncio.gather(*[check_service(name, url) for name, url in services.items()])
    return results

async def check_openai_api() -> Dict[str, Any]:
    """
    Check OpenAI API connectivity
    """
    if not settings.OPENAI_API_KEY:
        return {"status": "not_configured"}
    
    try:
        # Import here to avoid importing OpenAI on service startup
        import openai
        
        start_time = time.time()
        openai.api_key = settings.OPENAI_API_KEY
        
        # Just check models endpoint which is lightweight
        models = openai.Model.list()
        latency = time.time() - start_time
        
        return {
            "status": "ok",
            "latency": latency,
            "model_count": len(models.data) if hasattr(models, 'data') else 0
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "latency": time.time() - start_time if 'start_time' in locals() else None
        }

@router.get("", response_model=HealthStatus)
async def get_health_status():
    """
    Get the health status of the AI service
    """
    # Get model status
    model_status = await model_service.get_model_status()
    
    # Determine service health based on model availability
    status = "healthy" if model_status.get("status") == "available" else "degraded"
    
    # Get the features that are enabled
    features = {
        "lyfbot": True,
        "journal_analysis": True,
        "recommendations": True,
        "personalization": True,
        "crisis_detection": settings.CRISIS_DETECTION_ENABLED,
        "custom_models": model_status.get("custom_models_available", False),
        "ab_testing": settings.AB_TESTING_ENABLED,
        "phi_detection": settings.PHI_DETECTION_ENABLED,
        "consent_check": settings.CONSENT_CHECK_ENABLED,
    }
    
    # Get the environment name
    environment = "production" if settings.AWS_SECRETS_MANAGER_ENABLED else "development"
    
    return HealthStatus(
        status=status,
        version="1.0.0",  # This should be dynamically determined in a real implementation
        timestamp=datetime.utcnow(),
        features=features,
        models=model_status.get("models", {}),
        environment=environment
    )

@router.get("/ping")
async def ping():
    """
    Simple ping endpoint for load balancers and basic health checks
    """
    return {"status": "ok"}

@router.get("/models")
async def get_model_status():
    """
    Get the status of all AI models
    """
    return await model_service.get_model_status() 