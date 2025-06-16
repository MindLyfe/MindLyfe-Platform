from typing import List, Optional, Union, Dict, Any
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "MindLyfe LyfBot Service"
    
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
    JWT_SECRET: str = "mindlyfe-lyfbot-secret-key-dev"
    JWT_ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@postgres:5432/mindlyfe_lyfbot"
    
    # Other services
    AI_SERVICE_URL: str = "http://ai-service:8000"
    AUTH_SERVICE_URL: str = "http://auth-service:3001"
    JOURNAL_SERVICE_URL: str = "http://journal-service:8001"
    RECOMMENDER_SERVICE_URL: str = "http://recommender-service:8002"
    NOTIFICATION_SERVICE_URL: str = "http://notification-service:3005"
    
    # LyfBot settings
    MAX_CONVERSATION_HISTORY: int = 20
    DEFAULT_SYSTEM_MESSAGE: str = "You are LyfBot, an empathetic AI assistant for mental health support."
    
    # Conversation Settings
    ENABLE_CONTEXT_AWARENESS: bool = True
    ENABLE_PERSONALIZATION: bool = True
    ENABLE_CRISIS_DETECTION: bool = True
    
    # Crisis detection thresholds
    CRISIS_KEYWORDS: List[str] = [
        "suicide", "kill myself", "end my life", "don't want to live",
        "self-harm", "hurt myself", "cutting myself"
    ]
    
    # Crisis response templates
    CRISIS_RESPONSE: Dict[str, Any] = {
        "suicide": {
            "message": "I'm concerned about what you've shared. If you're having thoughts of suicide, please know that help is available.",
            "resources": [
                {"name": "National Suicide Prevention Lifeline", "contact": "1-800-273-8255"},
                {"name": "Crisis Text Line", "contact": "Text HOME to 741741"}
            ],
            "notification_level": "urgent"
        },
        "self_harm": {
            "message": "I notice you're talking about harming yourself. I care about your wellbeing and want to make sure you get the support you need.",
            "resources": [
                {"name": "Crisis Text Line", "contact": "Text HOME to 741741"},
                {"name": "Self-Harm Crisis Helpline", "contact": "1-800-DONT-CUT"}
            ],
            "notification_level": "high"
        }
    }
    
    # Therapeutic techniques to use
    THERAPEUTIC_TECHNIQUES: List[str] = [
        "reflective_listening",
        "validation",
        "cognitive_reframing",
        "mindfulness_suggestion",
        "open_ended_questions",
        "summarizing",
        "empathetic_response"
    ]
    
    # OpenAI (for fallback if AI service is down)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()