from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime, timedelta

from app.core.dependencies import get_current_user, get_db
from app.services.model_service import ModelService, ModelFeature
from app.services.training_service import ModelTrainingService
from app.utils.compliance import check_consent, log_data_access, audit_log
from app.utils.notification import send_notification_event

router = APIRouter()
model_service = ModelService()
training_service = ModelTrainingService()

class JournalEntryRequest(BaseModel):
    content: str = Field(..., description="Journal entry content")
    date: datetime = Field(default_factory=datetime.utcnow, description="Date of the journal entry")
    mood_score: Optional[int] = Field(None, description="User-provided mood score (1-10)")
    tags: Optional[List[str]] = Field(default=[], description="User-provided tags for the entry")
    context: Optional[Dict[str, Any]] = Field(default={}, description="Additional context")

class JournalAnalysisResponse(BaseModel):
    sentiment: str = Field(..., description="Overall sentiment (positive, negative, neutral, mixed)")
    emotions: List[str] = Field(..., description="Detected emotions in the entry")
    themes: List[str] = Field(..., description="Detected themes in the entry")
    insights: str = Field(..., description="Supportive insights based on the entry")
    word_count: int = Field(..., description="Word count of the entry")
    suggested_coping_strategies: List[str] = Field(..., description="Suggested coping strategies")
    mood_prediction: Optional[float] = Field(None, description="Predicted mood score if not provided")
    analysis_id: str = Field(..., description="Unique ID for this analysis")

class JournalTrendsRequest(BaseModel):
    start_date: datetime = Field(..., description="Start date for trend analysis")
    end_date: datetime = Field(..., description="End date for trend analysis")
    include_content: bool = Field(False, description="Whether to include entry content in response")

class JournalTrend(BaseModel):
    date_range: str = Field(..., description="Date range for the trend")
    sentiment_distribution: Dict[str, float] = Field(..., description="Distribution of sentiments")
    top_emotions: List[str] = Field(..., description="Top emotions during this period")
    top_themes: List[str] = Field(..., description="Top themes during this period")
    mood_trend: List[float] = Field(..., description="Mood trend over time")
    word_count_avg: int = Field(..., description="Average word count")
    entry_count: int = Field(..., description="Number of entries in this period")

@router.post("/analyze", response_model=JournalAnalysisResponse)
async def analyze_journal_entry(
    request: JournalEntryRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Analyze a journal entry for sentiment, emotions, themes, and insights.
    Also provides personalized coping strategies based on the content.
    """
    try:
        # Check user consent for AI processing
        has_consent = check_consent(current_user.id, "ai_journal_analysis")
        if not has_consent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has not provided consent for AI journal analysis"
            )
            
        # Log data access for GDPR compliance
        log_data_access(
            user_id=current_user.id,
            data_type="journal_entry",
            access_reason="journal_analysis",
            data_categories=["journal_content", "mood_data"]
        )
        
        # Add user context if available
        context = request.context or {}
        if not context.get("user_profile"):
            # In a real implementation, we would fetch this from the user service
            # For now, just use a placeholder
            context["user_profile"] = {
                "name": "User",
                "therapy_goals": ["stress management", "anxiety reduction"],
                "interests": ["meditation", "exercise", "reading"]
            }
            
        # Add mood history if available
        if not context.get("mood_history"):
            # In a real implementation, we would fetch this from the journal service
            # For now, just use placeholders
            context["mood_history"] = [
                {"date": (datetime.utcnow() - timedelta(days=1)).isoformat(), "score": 7},
                {"date": (datetime.utcnow() - timedelta(days=2)).isoformat(), "score": 6},
                {"date": (datetime.utcnow() - timedelta(days=3)).isoformat(), "score": 5}
            ]
        
        # Analyze journal entry using the model service
        analysis, metrics = await model_service.analyze_journal_entry(
            user_id=current_user.id,
            journal_text=request.content,
            context=context
        )
        
        # Check if we should trigger a notification for concerning content
        if analysis.get("sentiment") == "negative" and any(emotion in ["distressed", "overwhelmed", "anxious", "depressed"] for emotion in analysis.get("emotions", [])):
            # Send a notification to check in with the user
            background_tasks.add_task(
                send_notification_event,
                event_type="journal_concern",
                user_id=current_user.id,
                data={
                    "message": "We noticed your journal entry indicates you might be going through a difficult time. Would you like to talk to LyfBot about it?",
                    "action": "open_lyfbot",
                    "priority": "medium"
                }
            )
        
        # Collect training data asynchronously if content is approved for training
        if request.context and request.context.get("approved_for_training", False):
            background_tasks.add_task(
                training_service.collect_training_data,
                feature=ModelFeature.JOURNAL_ANALYSIS,
                input_data={
                    "content": request.content,
                    "date": request.date.isoformat(),
                    "mood_score": request.mood_score,
                    "tags": request.tags,
                    "context": context
                },
                output_data=analysis,
                metadata={
                    "user_id": current_user.id,
                    "metrics": metrics
                }
            )
        
        # Log this analysis for audit purposes
        audit_log(
            action="journal_analysis",
            user_id=current_user.id,
            resource_type="journal_entry",
            resource_id=f"analysis:{analysis.get('analysis_id', 'unknown')}",
            metadata={
                "sentiment": analysis.get("sentiment"),
                "word_count": analysis.get("word_count"),
                "date": request.date.isoformat()
            }
        )
        
        # Convert to response model
        return JournalAnalysisResponse(
            sentiment=analysis.get("sentiment", "neutral"),
            emotions=analysis.get("emotions", []),
            themes=analysis.get("themes", []),
            insights=analysis.get("insights", ""),
            word_count=analysis.get("word_count", 0),
            suggested_coping_strategies=analysis.get("suggested_coping_strategies", []),
            mood_prediction=analysis.get("mood_prediction"),
            analysis_id=analysis.get("analysis_id", "unknown")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze journal entry: {str(e)}"
        )

@router.post("/trends", response_model=JournalTrend)
async def get_journal_trends(
    request: JournalTrendsRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Analyze journal entries over time to identify trends in mood, sentiment, and themes.
    """
    try:
        # Check user consent for AI processing
        has_consent = check_consent(current_user.id, "ai_journal_analysis")
        if not has_consent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has not provided consent for AI journal analysis"
            )
            
        # Log data access for GDPR compliance
        log_data_access(
            user_id=current_user.id,
            data_type="journal_entries",
            access_reason="trend_analysis",
            data_categories=["journal_content", "mood_data", "temporal_data"]
        )
        
        # In a real implementation, we would fetch the journal entries from the journal service
        # and perform analysis on them. For now, just return a placeholder response.
        
        # Log this analysis for audit purposes
        audit_log(
            action="journal_trend_analysis",
            user_id=current_user.id,
            resource_type="journal_entries",
            resource_id=f"trend:{request.start_date.isoformat()}-{request.end_date.isoformat()}",
            metadata={
                "start_date": request.start_date.isoformat(),
                "end_date": request.end_date.isoformat(),
                "include_content": request.include_content
            }
        )
        
        # Return placeholder trend data
        return JournalTrend(
            date_range=f"{request.start_date.strftime('%Y-%m-%d')} to {request.end_date.strftime('%Y-%m-%d')}",
            sentiment_distribution={
                "positive": 0.4,
                "neutral": 0.3,
                "negative": 0.2,
                "mixed": 0.1
            },
            top_emotions=["happy", "calm", "anxious", "frustrated"],
            top_themes=["work", "relationships", "health", "personal growth"],
            mood_trend=[6.5, 7.0, 6.8, 7.2, 6.9],
            word_count_avg=250,
            entry_count=10
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze journal trends: {str(e)}"
        )

@router.post("/feedback")
async def submit_journal_analysis_feedback(
    analysis_id: str,
    is_helpful: bool,
    feedback_text: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """
    Submit feedback on a journal analysis to improve future analyses.
    """
    try:
        # Log the feedback for training purposes
        audit_log(
            action="journal_analysis_feedback",
            user_id=current_user.id,
            resource_type="journal_analysis",
            resource_id=f"analysis:{analysis_id}",
            metadata={
                "is_helpful": is_helpful,
                "feedback_text": feedback_text
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