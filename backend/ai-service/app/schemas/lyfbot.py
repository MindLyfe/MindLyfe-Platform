from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class Message(BaseModel):
    role: str = Field(..., description="The role of the message sender (user, assistant, system)")
    content: str = Field(..., description="The content of the message")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When the message was sent")

class ChatMessage(BaseModel):
    content: str = Field(..., description="The message content from the user")
    history: Optional[List[Dict[str, str]]] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str = Field(..., description="The response message from LyfeBot")
    success: bool = Field(..., description="Whether the request was successful")
    metrics: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = Field(default=[], description="Suggested follow-up messages")