from sqlalchemy import Column, String, DateTime, Boolean, Table, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    preferences = relationship("UserPreference", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")

class UserPreference(Base):
    __tablename__ = "user_preferences"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    preference_key = Column(String, index=True)
    preference_value = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="preferences")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_message_at = Column(DateTime(timezone=True))
    message_count = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id"))
    role = Column(String)  # user, assistant, system
    content = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    resource_type = Column(String)  # article, exercise, video, etc.
    resource_id = Column(String)
    title = Column(String)
    description = Column(String)
    relevance_score = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    viewed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="recommendations") 