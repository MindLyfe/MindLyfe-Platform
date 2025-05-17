from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class Message(BaseModel):
    role: str = Field(..., description="The role of the message sender (user, assistant, system)")
    content: str = Field(..., description="The content of the message")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When the message was sent")

class ChatMessage(BaseModel):
    content: str = Field(..., description="The message content from the user")
    history: Optional[List[Message]] = Field(default=[], description="Previous messages in the conversation")
    context: Optional[Dict[str, Any]] = Field(default={}, description="Additional context for the conversation")

class ChatResponse(BaseModel):
    message: str = Field(..., description="The response message from LyfBot")
    success: bool = Field(..., description="Whether the request was successful")
    suggestions: Optional[List[str]] = Field(default=[], description="Suggested follow-up messages") 