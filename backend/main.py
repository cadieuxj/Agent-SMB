from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from api.chat import router as chat_router
from api.memories import router as memories_router
from api.suggestions import router as suggestions_router
from api.conversations import router as conversations_router
from api.profiles import router as profiles_router
from services.scheduler import start as start_scheduler, stop as stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title="Agent-SMB",
    description="Persistent Memory Business Advisor for Canadian SMBs",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(memories_router)
app.include_router(suggestions_router)
app.include_router(conversations_router)
app.include_router(profiles_router)


@app.get("/health")
async def health():
    return {"status": "ok", "env": settings.app_env, "version": "0.2.0"}
