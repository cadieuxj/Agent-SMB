from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from core.config import settings
from api.chat import router as chat_router
from api.memories import router as memories_router
from api.notifications import router as notifications_router
from api.suggestions import router as suggestions_router
from api.conversations import router as conversations_router
from api.profiles import router as profiles_router
from services.scheduler import start as start_scheduler, stop as stop_scheduler

_is_prod = settings.app_env == "production"

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


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
    # Disable interactive docs in production
    docs_url=None if _is_prod else "/docs",
    redoc_url=None if _is_prod else "/redoc",
    openapi_url=None if _is_prod else "/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(memories_router)
app.include_router(notifications_router)
app.include_router(suggestions_router)
app.include_router(conversations_router)
app.include_router(profiles_router)


@app.get("/health")
async def health():
    # Never leak env or version in production
    return {"status": "ok"}
