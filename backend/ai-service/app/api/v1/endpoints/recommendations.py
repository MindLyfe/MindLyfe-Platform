from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import uuid

from app.core.dependencies import get_current_user, get_db
from app.services.model_service import ModelService, ModelFeature
from app.services.training_service import ModelTrainingService
from app.utils.compliance import check_consent, log_data_access, audit_log
from app.utils.notification import send_notification_event

router = APIRouter()
model_service = ModelService()
training_service = ModelTrainingService()

class RecommendationRequest(BaseModel):
    category: Optional[str] = Field(None, description="Category of recommendations (meditation, exercise, social, etc.)")
    count: int = Field(5, description="Number of recommendations to generate", ge=1, le=10)
    difficulty: Optional[str] = Field(None, description="Difficulty level (easy, medium, hard)")
    include_context: bool = Field(True, description="Include user context data")
    context: Optional[Dict[str, Any]] = Field(default={}, description="Additional context")

class Recommendation(BaseModel):
    id: str = Field(..., description="Unique ID for this recommendation")
    title: str = Field(..., description="Title of the recommendation")
    description: str = Field(..., description="Description of the recommendation")
    rationale: str = Field(..., description="Why this recommendation would help")
    implementation: str = Field(..., description="How to implement this recommendation")
    category: str = Field(..., description="Category (meditation, exercise, social, etc.)")
    difficulty: str = Field(..., description="Difficulty level (easy, medium, hard)")
    estimated_time: Optional[str] = Field(None, description="Estimated time to complete")
    benefits: List[str] = Field(..., description="Benefits of this recommendation")
    suitable_for: List[str] = Field(..., description="What conditions/goals this is suitable for")

class RecommendationFeedbackRequest(BaseModel):
    recommendation_id: str = Field(..., description="ID of the recommendation")
    is_helpful: bool = Field(..., description="Whether the recommendation was helpful")
    was_implemented: Optional[bool] = Field(None, description="Whether the user implemented the recommendation")
    difficulty_rating: Optional[int] = Field(None, description="User-rated difficulty (1-5)", ge=1, le=5)
    feedback_text: Optional[str] = Field(None, description="Detailed feedback from the user")

class ScheduleRecommendationRequest(BaseModel):
    recommendation_id: str = Field(..., description="ID of the recommendation to schedule")
    scheduled_time: datetime = Field(..., description="When to schedule the recommendation")
    reminder_type: str = Field("notification", description="Type of reminder (notification, email, etc.)")
    repeat: Optional[str] = Field(None, description="Repeat pattern (daily, weekly, etc.)")

@router.post("/generate", response_model=List[Recommendation])
async def generate_recommendations(
    request: RecommendationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Generate personalized mental health and wellbeing recommendations based on user profile,
    journal entries, mood data, and therapy goals.
    """
    try:
        # Check user consent for AI processing
        has_consent = check_consent(current_user.id, "ai_recommendations")
        if not has_consent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has not provided consent for AI recommendations"
            )
            
        # Log data access for GDPR compliance
        log_data_access(
            user_id=current_user.id,
            data_type="user_profile",
            access_reason="generate_recommendations",
            data_categories=["preferences", "therapy_goals", "mood_data", "activity_history"]
        )
        
        # Build user data for recommendation generation
        user_data = {}
        
        # Include user context if requested
        if request.include_context:
            # In a real implementation, we would fetch this from various services
            # For now, use placeholders or context if provided
            context = request.context or {}
            
            # User profile (would come from auth/profile service)
            user_data["user_profile"] = context.get("user_profile", {
                "name": "User",
                "age_range": "30-40",
                "therapy_goals": ["stress management", "anxiety reduction", "better sleep"],
                "interests": ["meditation", "nature", "reading", "music"]
            })
            
            # Recent mood data (would come from journal service)
            user_data["recent_moods"] = context.get("mood_history", [
                {"date": (datetime.utcnow() - timedelta(days=1)).isoformat(), "score": 7, "notes": "Feeling okay"},
                {"date": (datetime.utcnow() - timedelta(days=2)).isoformat(), "score": 6, "notes": "A bit stressed"},
                {"date": (datetime.utcnow() - timedelta(days=3)).isoformat(), "score": 5, "notes": "Tired and anxious"}
            ])
            
            # Previous recommendations feedback (would come from recommendation service)
            user_data["previous_recommendations"] = context.get("previous_recommendations", [
                {"id": "rec123", "title": "5-minute meditation", "was_helpful": True, "was_implemented": True},
                {"id": "rec456", "title": "Journaling exercise", "was_helpful": True, "was_implemented": False}
            ])
            
            # Journal themes (would come from journal service)
            user_data["journal_themes"] = context.get("journal_themes", ["work stress", "relationship", "sleep"])
        
        # Add request parameters
        user_data["category"] = request.category
        user_data["count"] = request.count
        user_data["difficulty"] = request.difficulty
        
        # Generate recommendations using the model service
        recommendations, metrics = await model_service.generate_recommendations(
            user_id=current_user.id,
            user_data=user_data
        )
        
        # Collect training data asynchronously if content is approved for training
        if request.context and request.context.get("approved_for_training", False):
            background_tasks.add_task(
                training_service.collect_training_data,
                feature=ModelFeature.RECOMMENDATION,
                input_data=user_data,
                output_data=recommendations,
                metadata={
                    "user_id": current_user.id,
                    "metrics": metrics
                }
            )
        
        # Log this recommendation generation for audit purposes
        audit_log(
            action="generate_recommendations",
            user_id=current_user.id,
            resource_type="recommendations",
            resource_id=f"batch:{datetime.utcnow().isoformat()}",
            metadata={
                "count": len(recommendations),
                "category": request.category,
                "difficulty": request.difficulty
            }
        )
        
        # Ensure each recommendation has an ID
        for rec in recommendations:
            if "id" not in rec:
                rec["id"] = str(uuid.uuid4())
        
        # Convert to response models
        return [
            Recommendation(
                id=rec.get("id", str(uuid.uuid4())),
                title=rec.get("title", ""),
                description=rec.get("description", ""),
                rationale=rec.get("rationale", ""),
                implementation=rec.get("implementation", ""),
                category=rec.get("category", "general"),
                difficulty=rec.get("difficulty", "medium"),
                estimated_time=rec.get("estimated_time"),
                benefits=rec.get("benefits", []),
                suitable_for=rec.get("suitable_for", [])
            )
            for rec in recommendations
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}"
        )

@router.post("/feedback")
async def submit_recommendation_feedback(
    request: RecommendationFeedbackRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """
    Submit feedback on a recommendation to improve future recommendations.
    """
    try:
        # Log the feedback for audit and training purposes
        audit_log(
            action="recommendation_feedback",
            user_id=current_user.id,
            resource_type="recommendation",
            resource_id=request.recommendation_id,
            metadata={
                "is_helpful": request.is_helpful,
                "was_implemented": request.was_implemented,
                "difficulty_rating": request.difficulty_rating,
                "feedback_text": request.feedback_text
            }
        )
        
        # If the recommendation was particularly helpful, we might want to
        # suggest similar recommendations in the future
        if request.is_helpful and (request.was_implemented is True):
            # In a real implementation, we might update a user preference model
            # or store this information for future recommendation generation
            pass
            
        # If the user found it too difficult, we might want to adjust the difficulty
        # of future recommendations
        if request.difficulty_rating is not None and request.difficulty_rating > 3:
            # In a real implementation, we might update user preferences
            pass
            
        # Collect training data for improving recommendations
        background_tasks.add_task(
            training_service.collect_training_data,
            feature=ModelFeature.RECOMMENDATION,
            input_data={
                "recommendation_id": request.recommendation_id,
            },
            output_data={
                "is_helpful": request.is_helpful,
                "was_implemented": request.was_implemented,
                "difficulty_rating": request.difficulty_rating,
                "feedback_text": request.feedback_text
            },
            metadata={
                "user_id": current_user.id,
                "feedback_type": "recommendation"
            }
        )
        
        return {
            "success": True,
            "message": "Feedback submitted successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        )

@router.post("/schedule")
async def schedule_recommendation(
    request: ScheduleRecommendationRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """
    Schedule a recommendation for later, with reminders via notification service.
    """
    try:
        # Calculate when to send the reminder
        now = datetime.utcnow()
        time_until_reminder = request.scheduled_time - now
        
        # Ensure the scheduled time is in the future
        if time_until_reminder.total_seconds() <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scheduled time must be in the future"
            )
            
        # Log the scheduling for audit purposes
        audit_log(
            action="schedule_recommendation",
            user_id=current_user.id,
            resource_type="recommendation",
            resource_id=request.recommendation_id,
            metadata={
                "scheduled_time": request.scheduled_time.isoformat(),
                "reminder_type": request.reminder_type,
                "repeat": request.repeat
            }
        )
        
        # In a real implementation, we would store this schedule in a database
        # and set up a job to send the notification at the scheduled time
        
        # For now, send a confirmation notification
        background_tasks.add_task(
            send_notification_event,
            event_type="recommendation_scheduled",
            user_id=current_user.id,
            data={
                "message": f"Your activity has been scheduled for {request.scheduled_time.strftime('%Y-%m-%d %H:%M')}",
                "recommendation_id": request.recommendation_id,
                "scheduled_time": request.scheduled_time.isoformat(),
                "priority": "low"
            }
        )
        
        return {
            "success": True,
            "message": "Recommendation scheduled successfully",
            "scheduled_time": request.scheduled_time,
            "reminder_type": request.reminder_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to schedule recommendation: {str(e)}"
        ) 