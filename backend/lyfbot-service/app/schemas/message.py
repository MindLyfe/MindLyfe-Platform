from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class MessageRequest(BaseModel):
    content: str = Field(..., description="Content of the message")
    conversation_id: Optional[int] = Field(None, description="Conversation ID (null for new conversation)")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context for the message")

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    conversation_id: int
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        orm_mode = True

class MessageWithAnalysis(MessageResponse):
    analysis: Optional[Dict[str, Any]] = Field(None, description="Analysis of the message content")
    detected_topics: Optional[List[str]] = Field(None, description="Topics detected in the message")
    detected_sentiment: Optional[str] = Field(None, description="Sentiment detected in the message")
    detected_crisis: Optional[bool] = Field(None, description="Whether a crisis was detected in the message")
    
    class Config:
        orm_mode = True

class StreamMessageRequest(BaseModel):
    content: str = Field(..., description="Content of the message")
    conversation_id: Optional[int] = Field(None, description="Conversation ID (null for new conversation)")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context for the message")
    stream: bool = Field(True, description="Whether to stream the response")

class StreamMessageResponse(BaseModel):
    message_part: str = Field(..., description="Part of the message being streamed")
    conversation_id: int = Field(..., description="ID of the conversation")
    message_id: Optional[int] = Field(None, description="ID of the message (null until complete)")
    is_final: bool = Field(False, description="Whether this is the final part of the message")
    analysis: Optional[Dict[str, Any]] = Field(None, description="Analysis (only included with final part)")

class MessageFeedback(BaseModel):
    message_id: int = Field(..., description="ID of the message being rated")
    is_helpful: bool = Field(..., description="Whether the message was helpful")
    feedback_text: Optional[str] = Field(None, description="Optional feedback text") 