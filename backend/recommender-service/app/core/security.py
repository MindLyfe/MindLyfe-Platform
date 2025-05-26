import httpx
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

# Set up logger
logger = logging.getLogger(__name__)

# Set up HTTP Bearer scheme
security = HTTPBearer()

async def validate_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validate JWT token by calling the Auth Service
    
    Args:
        credentials: The authorization credentials (JWT token)
        
    Returns:
        dict: User data from the token if valid
        
    Raises:
        HTTPException: If token is invalid or Auth Service is unavailable
    """
    token = credentials.credentials
    
    try:
        # Call Auth Service to validate token
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.AUTH_SERVICE_URL}/api/auth/validate-token",
                json={"token": token},
                timeout=5.0
            )
            
            if response.status_code != 200:
                logger.error(f"Token validation failed: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
                
            user_data = response.json()
            return user_data
            
    except httpx.RequestError as exc:
        logger.error(f"Auth Service request failed: {str(exc)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable",
        )

async def get_service_token():
    """
    Get a service token from the Auth Service for service-to-service communication
    
    Returns:
        str: Service token
        
    Raises:
        HTTPException: If Auth Service is unavailable
    """
    try:
        # Call Auth Service to get service token
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.AUTH_SERVICE_URL}/api/auth/service-token",
                json={"service": "recommender-service"},
                timeout=5.0
            )
            
            if response.status_code != 200:
                logger.error(f"Service token request failed: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Failed to authenticate with Auth Service",
                )
                
            token_data = response.json()
            return token_data["token"]
            
    except httpx.RequestError as exc:
        logger.error(f"Auth Service request failed: {str(exc)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable",
        ) 