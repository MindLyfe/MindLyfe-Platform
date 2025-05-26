from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.config import settings
from app.db.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

class TokenData(BaseModel):
    id: Optional[str] = None
    email: Optional[str] = None
    roles: Optional[list] = None

class UserData(BaseModel):
    id: str
    email: str
    roles: list = []
    is_active: bool = True

async def get_token_header(token: str = Depends(oauth2_scheme)) -> TokenData:
    """
    Validate the authentication token and extract token data.
    
    Args:
        token: The JWT token from the Authorization header
        
    Returns:
        TokenData containing user information from the token
        
    Raises:
        HTTPException: If the token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        # Extract user information
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        email = payload.get("email")
        roles = payload.get("roles", [])
        
        token_data = TokenData(id=user_id, email=email, roles=roles)
        return token_data
        
    except JWTError:
        raise credentials_exception

async def get_current_user(
    token_data: TokenData = Depends(get_token_header),
    db: Session = Depends(get_db)
) -> UserData:
    """
    Get the current user from the token data.
    
    Args:
        token_data: The validated token data
        db: Database session
        
    Returns:
        UserData for the current user
        
    Raises:
        HTTPException: If the user does not exist or is inactive
    """
    # In a real implementation, this would query the user from the database
    # For now, we'll just use the token data
    
    user = UserData(
        id=token_data.id,
        email=token_data.email,
        roles=token_data.roles
    )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )
        
    return user

async def get_admin_user(current_user: UserData = Depends(get_current_user)) -> UserData:
    """
    Check if the current user has admin privileges.
    
    Args:
        current_user: The current user
        
    Returns:
        The current user if they have admin privileges
        
    Raises:
        HTTPException: If the user does not have admin privileges
    """
    if "admin" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
        
    return current_user 