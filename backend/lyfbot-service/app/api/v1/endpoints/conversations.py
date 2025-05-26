from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.core.security import validate_token
from app.schemas.conversation import (
    Conversation,
    ConversationDetail,
    ConversationCreate,
    ConversationUpdate
)
from app.services.conversation_service import ConversationService

router = APIRouter()
conversation_service = ConversationService()

@router.post("", response_model=Conversation, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Create a new conversation
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Create conversation
        new_conversation = await conversation_service.create_conversation(
            db,
            user_id,
            title=conversation.title,
            metadata=conversation.metadata,
            initial_message=conversation.initial_message,
            system_message=conversation.system_message
        )
        
        return new_conversation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}"
        )

@router.get("", response_model=List[Conversation])
async def get_conversations(
    skip: int = 0,
    limit: int = 10,
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Get all conversations for the current user
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Get conversations
        conversations = await conversation_service.get_conversations(
            db,
            user_id,
            skip=skip,
            limit=limit,
            include_inactive=include_inactive
        )
        
        return conversations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get conversations: {str(e)}"
        )

@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Get a specific conversation with its messages
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Get conversation
        conversation = await conversation_service.get_conversation_with_messages(
            db,
            conversation_id,
            user_id
        )
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
            
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get conversation: {str(e)}"
        )

@router.put("/{conversation_id}", response_model=Conversation)
async def update_conversation(
    conversation_id: int,
    conversation: ConversationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Update a conversation
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Verify the conversation exists and belongs to the user
        existing_conversation = await conversation_service.get_conversation(
            db,
            conversation_id,
            user_id
        )
        
        if not existing_conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
            
        # Update conversation
        updated_conversation = await conversation_service.update_conversation(
            db,
            conversation_id,
            title=conversation.title,
            metadata=conversation.metadata,
            is_active=conversation.is_active
        )
        
        return updated_conversation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update conversation: {str(e)}"
        )

@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(validate_token)
):
    """
    Delete a conversation (marks as inactive)
    """
    try:
        # Set the user ID from the token
        user_id = current_user["id"]
        
        # Verify the conversation exists and belongs to the user
        existing_conversation = await conversation_service.get_conversation(
            db,
            conversation_id,
            user_id
        )
        
        if not existing_conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
            
        # Mark conversation as inactive
        await conversation_service.mark_conversation_inactive(
            db,
            conversation_id
        )
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}"
        ) 