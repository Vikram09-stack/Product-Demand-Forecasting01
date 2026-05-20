import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Lumina Forecast API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "lumina-forecast-super-secret-key-328912")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SQLite local DB fallback
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lumina.db")

    class Config:
        case_sensitive = True

settings = Settings()
