from typing import List, Optional, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "MindLyfe Recommendation Service"
    
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
    JWT_SECRET: str = "mindlyfe-recommender-secret-key-dev"
    JWT_ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@postgres:5432/mindlyfe_recommender"
    
    # AI Service
    AI_SERVICE_URL: str = "http://ai-service:8000"
    
    # Auth Service
    AUTH_SERVICE_URL: str = "http://auth-service:3001"
    
    # Journal Service
    JOURNAL_SERVICE_URL: str = "http://journal-service:8001"
    
    # Notification Service
    NOTIFICATION_SERVICE_URL: str = "http://notification-service:3005"
    
    # Recommendation settings
    MAX_RECOMMENDATIONS: int = 10
    DEFAULT_RECOMMENDATION_COUNT: int = 5
    
    # Personalization
    ENABLE_PERSONALIZATION: bool = True
    
    # A/B Testing
    ENABLE_AB_TESTING: bool = True
    
    # Feedback Collection
    ENABLE_FEEDBACK_COLLECTION: bool = True
    
    # Recommendation Categories
    RECOMMENDATION_CATEGORIES: List[str] = [
        "meditation",
        "exercise",
        "journaling",
        "social",
        "mindfulness",
        "creative",
        "nature",
        "learning",
        "self_care",
        "gratitude"
    ]
    
    # Difficulty Levels
    DIFFICULTY_LEVELS: List[str] = [
        "beginner",
        "easy",
        "medium",
        "advanced",
        "expert"
    ]
    
    # Time Commitments
    TIME_COMMITMENTS: List[str] = [
        "under_5_min",
        "5_15_min",
        "15_30_min",
        "30_60_min",
        "over_60_min"
    ]
    
    # OpenAI (for fallback if AI service is down)
    OPENAI_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()