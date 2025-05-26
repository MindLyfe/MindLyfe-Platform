from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.core.security import validate_token
from app.models.journal import Journal
from app.schemas.journal import JournalCreate, JournalUpdate, JournalResponse
from app.services.journal_service import JournalService
from app.services.ai_service import AIService

router = APIRouter()
journal_service = JournalService()
ai_service = AIService()

@router.post("", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
async def create_journal(
    journal: JournalCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Create a new journal entry
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Create journal entry
        journal_entry = await journal_service.create_journal(db, user_id, journal)
        
        # Analyze journal content in the background
        background_tasks.add_task(
            ai_service.analyze_journal,
            journal_id=journal_entry.id,
            content=journal_entry.content,
            user_id=user_id,
            db=db
        )
        
        return journal_entry
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create journal entry: {str(e)}"
        )

@router.get("", response_model=List[JournalResponse])
async def get_journals(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    tag: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Get all journal entries for the current user with optional filtering
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Get journal entries
        journals = await journal_service.get_journals(
            db,
            user_id,
            skip=skip,
            limit=limit,
            start_date=start_date,
            end_date=end_date,
            tag=tag,
            category_id=category_id
        )
        
        return journals
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve journal entries: {str(e)}"
        )

@router.get("/{journal_id}", response_model=JournalResponse)
async def get_journal(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Get a specific journal entry by ID
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Get journal entry
        journal = await journal_service.get_journal(db, journal_id, user_id)
        
        if not journal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Journal entry not found"
            )
            
        return journal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve journal entry: {str(e)}"
        )

@router.put("/{journal_id}", response_model=JournalResponse)
async def update_journal(
    journal_id: int,
    journal: JournalUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Update a journal entry
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Check if journal entry exists and belongs to the user
        existing_journal = await journal_service.get_journal(db, journal_id, user_id)
        
        if not existing_journal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Journal entry not found"
            )
            
        # Update journal entry
        updated_journal = await journal_service.update_journal(db, journal_id, journal)
        
        # Re-analyze journal content if content changed
        if journal.content and journal.content != existing_journal.content:
            background_tasks.add_task(
                ai_service.analyze_journal,
                journal_id=journal_id,
                content=journal.content,
                user_id=user_id,
                db=db
            )
            
        return updated_journal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update journal entry: {str(e)}"
        )

@router.delete("/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Delete a journal entry
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Check if journal entry exists and belongs to the user
        existing_journal = await journal_service.get_journal(db, journal_id, user_id)
        
        if not existing_journal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Journal entry not found"
            )
            
        # Delete journal entry
        await journal_service.delete_journal(db, journal_id)
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete journal entry: {str(e)}"
        ) 