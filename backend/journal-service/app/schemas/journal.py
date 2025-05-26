from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class TagBase(BaseModel):
    name: str

class Tag(TagBase):
    id: int
    
    class Config:
        orm_mode = True

class CategoryBase(BaseModel):
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None

class Category(CategoryBase):
    id: int
    
    class Config:
        orm_mode = True

class JournalBase(BaseModel):
    title: Optional[str] = None
    content: str
    mood_score: Optional[int] = Field(None, ge=1, le=10, description="User's mood score (1-10)")
    category_id: Optional[int] = None

class JournalCreate(JournalBase):
    tags: Optional[List[str]] = []
    private: bool = True
    location: Optional[str] = None
    weather: Optional[str] = None
    images: Optional[List[str]] = []
    prompt_id: Optional[int] = None

class JournalUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood_score: Optional[int] = Field(None, ge=1, le=10, description="User's mood score (1-10)")
    category_id: Optional[int] = None
    tags: Optional[List[str]] = None
    private: Optional[bool] = None
    location: Optional[str] = None
    weather: Optional[str] = None
    images: Optional[List[str]] = None

class JournalInDB(JournalBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime
    tags: List[Tag] = []
    category: Optional[Category] = None
    private: bool
    location: Optional[str] = None
    weather: Optional[str] = None
    images: List[str] = []
    prompt_id: Optional[int] = None
    
    class Config:
        orm_mode = True

class JournalResponse(JournalInDB):
    has_analysis: bool = False
    word_count: Optional[int] = None
    sentiment: Optional[str] = None
    
    class Config:
        orm_mode = True 