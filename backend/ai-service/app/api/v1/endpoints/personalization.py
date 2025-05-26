from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

from app.core.dependencies import get_current_user, get_db
from app.services.model_service import ModelService, ModelFeature
from app.utils.compliance import check_consent, log_data_access, audit_log

router = APIRouter()
model_service = ModelService()

class AIPreferences(BaseModel):
    lyfbot_name: Optional[str] = Field(None, description="Personalized name for LyfBot")
    lyfbot_tone: Optional[str] = Field(None, description="Preferred tone for LyfBot (casual, professional, supportive, etc.)")
    lyfbot_memory: bool = Field(True, description="Whether LyfBot should remember conversation history")
    content_preferences: Dict[str, bool] = Field(default_factory=dict, description="Content type preferences")
    topic_preferences: Dict[str, str] = Field(default_factory=dict, description="Topic preferences (avoid, neutral, prefer)")
    language: Optional[str] = Field(None, description="Preferred language")
    notification_preferences: Dict[str, bool] = Field(default_factory=dict, description="Notification preferences")

class TherapyGoals(BaseModel):
    goals: List[str] = Field(..., description="List of therapy goals")
    primary_goal: Optional[str] = Field(None, description="Primary therapy goal")
    difficulty_preference: Optional[str] = Field(None, description="Preferred difficulty level for activities")
    time_preference: Optional[str] = Field(None, description="Preferred time commitment for activities")

class UserInsight(BaseModel):
    category: str = Field(..., description="Insight category")
    description: str = Field(..., description="Description of the insight")
    confidence: float = Field(..., description="Confidence level in the insight (0-1)")
    evidence: List[str] = Field(..., description="Evidence supporting this insight")
    recommendations: List[str] = Field(..., description="Recommendations based on this insight")
    date_generated: datetime = Field(default_factory=datetime.utcnow)

class ConsentSettings(BaseModel):
    data_collection: Dict[str, bool] = Field(..., description="Consent for different types of data collection")
    data_processing: Dict[str, bool] = Field(..., description="Consent for different types of data processing")
    data_sharing: Dict[str, bool] = Field(..., description="Consent for different types of data sharing")
    marketing: bool = Field(False, description="Consent for marketing communications")
    research: bool = Field(False, description="Consent for anonymized research use")
    third_party: Dict[str, bool] = Field(default_factory=dict, description="Consent for specific third parties")

@router.get("/preferences", response_model=AIPreferences)
async def get_ai_preferences(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get the user's AI personalization preferences.
    """
    try:
        # Log data access for GDPR compliance
        log_data_access(
            user_id=current_user.id,
            data_type="ai_preferences",
            access_reason="get_preferences",
            data_categories=["user_preferences"]
        )
        
        # In a real implementation, we would fetch this from the database
        # For now, return placeholder preferences
        return AIPreferences(
            lyfbot_name="LyfBot",
            lyfbot_tone="supportive",
            lyfbot_memory=True,
            content_preferences={
                "mindfulness": True,
                "cbt": True,
                "physical_exercise": True,
                "nutrition": False
            },
            topic_preferences={
                "work_stress": "prefer",
                "relationships": "neutral",
                "trauma": "avoid"
            },
            language="en",
            notification_preferences={
                "daily_check_in": True,
                "journal_reminders": True,
                "activity_suggestions": True,
                "goal_progress": True
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI preferences: {str(e)}"
        )

@router.put("/preferences", response_model=AIPreferences)
async def update_ai_preferences(
    preferences: AIPreferences,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update the user's AI personalization preferences.
    """
    try:
        # Log the update for audit purposes
        audit_log(
            action="update_ai_preferences",
            user_id=current_user.id,
            resource_type="user_preferences",
            resource_id=current_user.id,
            metadata={
                "lyfbot_name": preferences.lyfbot_name,
                "lyfbot_tone": preferences.lyfbot_tone,
                "lyfbot_memory": preferences.lyfbot_memory,
                "language": preferences.language
            }
        )
        
        # In a real implementation, we would update the database
        # For now, just return the provided preferences
        return preferences
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update AI preferences: {str(e)}"
        )

@router.get("/therapy-goals", response_model=TherapyGoals)
async def get_therapy_goals(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get the user's therapy goals.
    """
    try:
        # Log data access for GDPR compliance
        log_data_access(
            user_id=current_user.id,
            data_type="therapy_goals",
            access_reason="get_goals",
            data_categories=["health_data"]
        )
        
        # In a real implementation, we would fetch this from the database
        # For now, return placeholder goals
        return TherapyGoals(
            goals=["reduce anxiety", "improve sleep", "manage stress", "build resilience"],
            primary_goal="reduce anxiety",
            difficulty_preference="moderate",
            time_preference="short"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get therapy goals: {str(e)}"
        )

@router.put("/therapy-goals", response_model=TherapyGoals)
async def update_therapy_goals(
    goals: TherapyGoals,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update the user's therapy goals.
    """
    try:
        # Log the update for audit purposes
        audit_log(
            action="update_therapy_goals",
            user_id=current_user.id,
            resource_type="therapy_goals",
            resource_id=current_user.id,
            metadata={
                "goals": goals.goals,
                "primary_goal": goals.primary_goal,
                "difficulty_preference": goals.difficulty_preference,
                "time_preference": goals.time_preference
            }
        )
        
        # In a real implementation, we would update the database
        # For now, just return the provided goals
        return goals
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update therapy goals: {str(e)}"
        )

@router.get("/insights", response_model=List[UserInsight])
async def get_user_insights(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get AI-generated insights about the user based on their data.
    """
    try:
        # Check user consent for AI processing
        has_consent = check_consent(current_user.id, "ai_insights")
        if not has_consent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has not provided consent for AI insights"
            )
            
        # Log data access for GDPR compliance
        log_data_access(
            user_id=current_user.id,
            data_type="user_insights",
            access_reason="get_insights",
            data_categories=["health_data", "behavior_patterns", "activity_data"]
        )
        
        # In a real implementation, we would generate these insights from user data
        # For now, return placeholder insights
        return [
            UserInsight(
                category="sleep",
                description="You tend to have better sleep quality when you journal before bed",
                confidence=0.85,
                evidence=[
                    "Sleep scores are 25% higher on days you journal before bed",
                    "You reported feeling more rested on 8/10 days after journaling"
                ],
                recommendations=[
                    "Continue your journaling practice before bed",
                    "Try adding a 5-minute meditation to your journaling routine"
                ],
                date_generated=datetime.utcnow()
            ),
            UserInsight(
                category="mood",
                description="Your mood tends to decline after 3+ days without exercise",
                confidence=0.78,
                evidence=[
                    "Mood scores drop an average of 2 points after 3 days without exercise",
                    "You've noted feeling 'sluggish' or 'low energy' in 90% of entries after no exercise"
                ],
                recommendations=[
                    "Schedule at least 2-3 exercise sessions per week",
                    "Try shorter, more frequent activity rather than longer, less frequent sessions"
                ],
                date_generated=datetime.utcnow()
            )
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user insights: {str(e)}"
        )

@router.get("/consent", response_model=ConsentSettings)
async def get_consent_settings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get the user's consent settings for data collection, processing, and sharing.
    """
    try:
        # In a real implementation, we would fetch this from the database
        # For now, return placeholder consent settings
        return ConsentSettings(
            data_collection={
                "journal_entries": True,
                "mood_tracking": True,
                "activity_data": True,
                "chat_history": True,
                "therapy_sessions": False
            },
            data_processing={
                "ai_analysis": True,
                "personalization": True,
                "recommendations": True,
                "crisis_detection": True
            },
            data_sharing={
                "therapists": False,
                "healthcare_providers": False,
                "emergency_contacts": True
            },
            marketing=False,
            research=True,
            third_party={}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get consent settings: {str(e)}"
        )

@router.put("/consent", response_model=ConsentSettings)
async def update_consent_settings(
    settings: ConsentSettings,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update the user's consent settings for data collection, processing, and sharing.
    """
    try:
        # Log the update for audit purposes
        audit_log(
            action="update_consent_settings",
            user_id=current_user.id,
            resource_type="consent_settings",
            resource_id=current_user.id,
            metadata={
                "data_collection": settings.data_collection,
                "data_processing": settings.data_processing,
                "data_sharing": settings.data_sharing,
                "marketing": settings.marketing,
                "research": settings.research,
                "third_party": settings.third_party
            }
        )
        
        # In a real implementation, we would update the database
        # For now, just return the provided settings
        return settings
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update consent settings: {str(e)}"
        ) 