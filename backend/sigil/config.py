import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Sigil"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sigil.db")
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*").split(",")
        if origin.strip()
    ]
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

settings = Settings()
