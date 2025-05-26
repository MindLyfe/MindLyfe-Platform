from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.core.security import validate_token
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationCreateRequest
)
from app.services.recommendation_service import RecommendationService
from app.services.ai_service import AIService
from app.services.user_service import UserService

router = APIRouter()
recommendation_service = RecommendationService()
ai_service = AIService()
user_service = UserService()

@router.post("", response_model=List[RecommendationResponse])
async def get_recommendations(
    request: RecommendationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Get personalized recommendations based on user profile, preferences, and history
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Get user profile data
        user_profile = await user_service.get_user_profile(user_id)
        
        # Generate recommendations
        recommendations = await recommendation_service.get_recommendations(
            db=db,
            user_id=user_id,
            user_profile=user_profile,
            category=request.category,
            count=request.count or 5,
            difficulty=request.difficulty,
            time_commitment=request.time_commitment,
            exclude_ids=request.exclude_ids or []
        )
        
        # Log recommendation request for analytics
        background_tasks.add_task(
            recommendation_service.log_recommendation_request,
            db=db,
            user_id=user_id,
            request_data=request.dict(),
            recommendation_count=len(recommendations)
        )
        
        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}"
        )

@router.post("/analyze", response_model=List[RecommendationResponse])
async def analyze_and_recommend(
    content: str,
    category: Optional[str] = None,
    count: Optional[int] = 3,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Analyze user-provided text and generate relevant recommendations
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Get user profile data
        user_profile = await user_service.get_user_profile(user_id)
        
        # Analyze content to extract themes and sentiments
        analysis = await ai_service.analyze_text(content, user_id)
        
        # Generate recommendations based on analysis
        recommendations = await recommendation_service.get_recommendations_from_analysis(
            db=db,
            user_id=user_id,
            user_profile=user_profile,
            analysis=analysis,
            category=category,
            count=count,
            difficulty=difficulty
        )
        
        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze and recommend: {str(e)}"
        )

@router.get("/{recommendation_id}", response_model=RecommendationResponse)
async def get_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Get a specific recommendation by ID
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Get recommendation
        recommendation = await recommendation_service.get_recommendation(db, recommendation_id)
        
        if not recommendation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recommendation not found"
            )
            
        return recommendation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendation: {str(e)}"
        )

@router.post("/create", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
async def create_recommendation(
    request: RecommendationCreateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Create a custom recommendation (admin only)
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Check if user is admin
        if current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can create recommendations"
            )
            
        # Create recommendation
        recommendation = await recommendation_service.create_recommendation(
            db=db,
            recommendation_data=request,
            created_by=user_id
        )
        
        return recommendation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create recommendation: {str(e)}"
        ) 