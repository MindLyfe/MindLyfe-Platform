from typing import List, Optional, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "MindLyfe Journal Service"
    
    # CORS
    CORS_ORIGINS: List[str] = []
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Security
    JWT_SECRET: str = "mindlyfe-journal-secret-key-dev"
    JWT_ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@postgres:5432/mindlyfe_journal"
    
    # AI Service
    AI_SERVICE_URL: str = "http://ai-service:8000"
    
    # Auth Service
    AUTH_SERVICE_URL: str = "http://auth-service:3001"
    
    # Notification Service
    NOTIFICATION_SERVICE_URL: str = "http://notification-service:3005"
    
    # Sentiment Analysis
    ENABLE_SENTIMENT_ANALYSIS: bool = True
    
    # Theme Extraction
    ENABLE_THEME_EXTRACTION: bool = True
    
    # Insights Generation
    ENABLE_INSIGHTS_GENERATION: bool = True
    
    # OpenAI (for fallback if AI service is down)
    OPENAI_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()