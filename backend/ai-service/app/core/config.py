from typing import List, Optional, Union, Dict, Any
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "MindLyfe AI Service"
    
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
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Encryption
    ENCRYPTION_SALT: str = "mindlyfe-ai-service-salt"
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_ORGANIZATION: Optional[str] = None
    DEFAULT_MODEL: str = "gpt-4"
    
    # Compliance
    AUDIT_LOG_API_URL: Optional[str] = None
    PHI_DETECTION_ENABLED: bool = True
    CONSENT_CHECK_ENABLED: bool = True
    
    # A/B Testing
    AB_TESTING_ENABLED: bool = True
    
    # Custom Models
    CUSTOM_MODELS_DIR: str = "app/models"
    
    # Custom Model Paths
    CUSTOM_CHAT_MODEL_PATH: Optional[str] = None
    CUSTOM_JOURNAL_MODEL_PATH: Optional[str] = None
    CUSTOM_MOOD_MODEL_PATH: Optional[str] = None
    CUSTOM_RECOMMENDATION_MODEL_PATH: Optional[str] = None
    CUSTOM_PERSONALIZATION_MODEL_PATH: Optional[str] = None
    
    # Custom Model Rollout Percentages (0-100)
    CUSTOM_CHAT_MODEL_ROLLOUT_PERCENTAGE: int = 0
    CUSTOM_JOURNAL_MODEL_ROLLOUT_PERCENTAGE: int = 0
    CUSTOM_MOOD_MODEL_ROLLOUT_PERCENTAGE: int = 0
    CUSTOM_RECOMMENDATION_MODEL_ROLLOUT_PERCENTAGE: int = 0
    CUSTOM_PERSONALIZATION_MODEL_ROLLOUT_PERCENTAGE: int = 0
    
    # Model Training
    TRAINING_ENABLED: bool = True
    TRAINING_DATA_DIR: str = "app/data/training"
    EVALUATION_DATA_DIR: str = "app/data/evaluation"
    MODEL_REGISTRY_DIR: str = "app/models/registry"
    
    # Training Parameters
    TRAINING_BATCH_SIZE: int = 16
    TRAINING_EPOCHS: int = 10
    EVALUATION_INTERVAL: int = 1000
    
    # Service Communication - Core Services
    AUTH_SERVICE_URL: str = "http://auth-service:3001"
    NOTIFICATION_SERVICE_URL: str = "http://notification-service:3005"
    
    # Service Communication - AI Microservices
    JOURNAL_SERVICE_URL: str = "http://journal-service:8001"
    RECOMMENDER_SERVICE_URL: str = "http://recommender-service:8002"
    LYFBOT_SERVICE_URL: str = "http://lyfebot-service:8003"
    
    # Service Communication - Other
    API_GATEWAY_URL: Optional[str] = "http://api-gateway:3000"
    
    # Service Authentication
    SERVICE_TOKEN_ENABLED: bool = True
    SERVICE_TOKEN_EXPIRY_MINUTES: int = 60
    
    # AWS Services
    AWS_REGION: str = "us-east-1"
    AWS_SQS_QUEUE_URL: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    AWS_SECRETS_MANAGER_ENABLED: bool = False
    
    # Mental Health Specific Settings
    CRISIS_DETECTION_ENABLED: bool = True
    CRISIS_KEYWORDS: List[str] = [
        "suicide", "kill myself", "end my life", "want to die", 
        "harm myself", "self harm", "hurt myself"
    ]
    CRISIS_RESOURCES: Dict[str, Any] = {
        "us": {
            "suicide_prevention_lifeline": "1-800-273-8255",
            "crisis_text_line": "Text HOME to 741741"
        },
        "international": {
            "befrienders": "https://www.befrienders.org/"
        }
    }
    
    # Memory Settings
    MEMORY_RETENTION_DAYS: int = 30
    MAX_MEMORY_ITEMS: int = 100
    
    # Personalization
    DEFAULT_LYFBOT_NAME: str = "LyfeBot"
    DEFAULT_LYFBOT_TONE: str = "supportive"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()