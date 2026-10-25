import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sigil.config import settings
from sigil.db import engine, Base, SessionLocal
from sigil.models import AgentModel
from sigil.registry import seed_registry
from sigil.api import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if not present
    Base.metadata.create_all(bind=engine)
    # Seed initial agents & tasks if database is brand new
    db = SessionLocal()
    try:
        count = db.query(AgentModel).count()
        if count == 0:
            seed_registry(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Context-Aware Identity Drift Detection and Response for Autonomous AI Agents",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if "*" not in settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

def start():
    uvicorn.run("sigil.main:app", host=settings.HOST, port=settings.PORT, reload=True)

if __name__ == "__main__":
    start()
