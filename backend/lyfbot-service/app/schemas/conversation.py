from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class MessageBase(BaseModel):
    role: str = Field(..., description="Role of the message sender (user, assistant, system)")
    content: str = Field(..., description="Content of the message")

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class ConversationBase(BaseModel):
    title: Optional[str] = Field(None, description="Title of the conversation")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class ConversationCreate(ConversationBase):
    initial_message: Optional[str] = Field(None, description="Initial message to start the conversation")
    system_message: Optional[str] = Field(None, description="Custom system message for this conversation")

class ConversationUpdate(BaseModel):
    title: Optional[str] = Field(None, description="Title of the conversation")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    is_active: Optional[bool] = Field(None, description="Whether the conversation is active")

class Conversation(ConversationBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool
    message_count: int
    last_message_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class ConversationDetail(Conversation):
    messages: List[Message] = []
    
    class Config:
        orm_mode = True 