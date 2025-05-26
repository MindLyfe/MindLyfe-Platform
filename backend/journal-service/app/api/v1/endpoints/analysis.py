from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.core.security import validate_token
from app.schemas.analysis import (
    JournalAnalysisResponse, 
    JournalAnalysisRequest,
    JournalTrendsRequest,
    JournalTrendsResponse,
    AnalysisFeedback
)
from app.services.analysis_service import AnalysisService
from app.services.ai_service import AIService
from app.services.journal_service import JournalService

router = APIRouter()
analysis_service = AnalysisService()
ai_service = AIService()
journal_service = JournalService()

@router.post("/analyze", response_model=JournalAnalysisResponse)
async def analyze_journal_text(
    request: JournalAnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Analyze journal text for sentiment, emotions, themes, and insights without saving it as a journal entry
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Call AI service to analyze the journal text
        analysis = await ai_service.analyze_text(
            content=request.content,
            user_id=user_id,
            context=request.context or {}
        )
        
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze journal text: {str(e)}"
        )

@router.get("/journal/{journal_id}", response_model=JournalAnalysisResponse)
async def get_journal_analysis(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Get the analysis for a specific journal entry
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Check if journal entry exists and belongs to the user
        journal = await journal_service.get_journal(db, journal_id, user_id)
        
        if not journal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Journal entry not found"
            )
            
        # Get the analysis
        analysis = await analysis_service.get_journal_analysis(db, journal_id)
        
        if not analysis:
            # If analysis doesn't exist, generate it
            analysis = await ai_service.analyze_journal(
                journal_id=journal_id,
                content=journal.content,
                user_id=user_id,
                db=db
            )
            
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get journal analysis: {str(e)}"
        )

@router.post("/trends", response_model=JournalTrendsResponse)
async def get_journal_trends(
    request: JournalTrendsRequest,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Analyze journal entries over time to identify trends in mood, sentiment, and themes
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Get trends
        trends = await analysis_service.get_journal_trends(
            db=db,
            user_id=user_id,
            start_date=request.start_date,
            end_date=request.end_date,
            include_content=request.include_content
        )
        
        return trends
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze journal trends: {str(e)}"
        )

@router.post("/feedback")
async def submit_analysis_feedback(
    feedback: AnalysisFeedback,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Submit feedback on a journal analysis to improve future analyses
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Store the feedback
        await analysis_service.store_analysis_feedback(
            db=db,
            analysis_id=feedback.analysis_id,
            user_id=user_id,
            is_helpful=feedback.is_helpful,
            feedback_text=feedback.feedback_text
        )
        
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        ) 