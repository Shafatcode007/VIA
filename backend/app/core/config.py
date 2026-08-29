# NECESSITY: Central configuration for the FastAPI application
# LOGIC: Uses pydantic-settings to load from environment variables with validation
# EDGE-CASE: DATABASE_URL defaults to SQLite for local dev if PostgreSQL not available

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    NECESSITY: Centralizes all configuration in one place
    LOGIC: pydantic-settings validates types and provides defaults
    EDGE-CASE: Falls back to SQLite if DATABASE_URL not set
    """
    
    # Application
    APP_NAME: str = "VIA - Multi-Service Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/via_db"
    
    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached application settings.
    
    NECESSITY: Avoids re-reading .env on every request
    LOGIC: lru_cache ensures single instance
    EDGE-CASE: None - settings are validated on first access
    """
    return Settings()


settings = get_settings()
