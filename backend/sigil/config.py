import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Sigil"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sigil.db")
    OPERATOR_KEY: str = os.getenv("OPERATOR_KEY", "")
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*").split(",")
        if origin.strip()
    ]
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

settings = Settings()

# Enforce no default OPERATOR_KEY in production or when running on hosted PostgreSQL.
# The backend strictly refuses to start without an explicit operator credential in production.
is_production = settings.ENVIRONMENT.lower() == "production" or (
    "postgres" in settings.DATABASE_URL.lower() and settings.ENVIRONMENT.lower() != "test"
)

if is_production and not settings.OPERATOR_KEY:
    raise RuntimeError(
        "FATAL CONFIG ERROR: OPERATOR_KEY environment variable is required in production / PostgreSQL mode. "
        "The backend refuses to start without an explicit operator credential."
    )
elif not settings.OPERATOR_KEY:
    # Development fallback only
    settings.OPERATOR_KEY = "sigil-operator-dev-key"

