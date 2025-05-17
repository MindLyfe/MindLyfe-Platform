from typing import List, Optional, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "MindLyf AI Service"
    
    # CORS
    CORS_ORIGINS: List[AnyHttpUrl] = []
    
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
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_ORGANIZATION: Optional[str] = None
    DEFAULT_MODEL: str = "gpt-4"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 