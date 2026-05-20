import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, BackgroundTasks, Depends, Request
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

from agents.orchestrator import route
from core.auth import get_current_user_id, require_own_user
from core.mem0_client import add_memory
from core.supabase_client import get_supabase

logger = logging.getLogger("agentsmb.chat")

router = APIRouter(prefix="/chat", tags=["chat"])

# Shared thread pool for all blocking Mem0 + Anthropic calls
_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="chat-worker")


class ChatRequest(BaseModel):
    user_id: str
    email: str | None = None
    message: str
    conversation_id: str | None = None
    language: str = "fr"
    forced_agent: str | None = None  # expert mode: "tax" | "cash_flow" | "general"


class ChatResponse(BaseModel):
    reply: str
    agent: str
    intent: str
    conversation_id: str


def _save_memory(user_id: str, user_msg: str, assistant_reply: str) -> None:
    """Persist the exchange to Mem0 (runs in a background thread via BackgroundTasks)."""
    try:
        add_memory(
            user_id=user_id,
            messages=[
                {"role": "user", "content": user_msg},
                {"role": "assistant", "content": assistant_reply},
            ],
        )
        logger.info("_save_memory ok user=%s", user_id[:8])
    except Exception as exc:
        logger.error("_save_memory FAILED user=%s: %s", user_id[:8], exc, exc_info=True)


@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(
    request: Request,
    req: ChatRequest,
    background_tasks: BackgroundTasks,
    token_user_id: str = Depends(get_current_user_id),
):
    require_own_user(req.user_id, token_user_id)
    db = get_supabase()

    # Ensure profile row exists
    profile_data: dict = {"id": req.user_id}
    if req.email:
        profile_data["email"] = req.email
    db.table("profiles").upsert(profile_data, on_conflict="id").execute()

    # Resolve or create conversation
    conv_id = req.conversation_id
    if not conv_id:
        result = (
            db.table("conversations")
            .insert({"user_id": req.user_id, "title": req.message[:60]})
            .execute()
        )
        conv_id = result.data[0]["id"]

    # Load recent conversation history
    history_result = (
        db.table("messages")
        .select("role, content")
        .eq("conversation_id", conv_id)
        .order("created_at", desc=False)
        .limit(10)
        .execute()
    )
    history = [{"role": r["role"], "content": r["content"]} for r in history_result.data]

    # Run the blocking classify + Mem0 search + Anthropic call in a thread
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(
        _executor,
        lambda: route(
            user_id=req.user_id,
            message=req.message,
            conversation_history=history,
            language=req.language,
            forced_agent=req.forced_agent,
        ),
    )

    # Persist both turns to Supabase (fast, ~100ms)
    db.table("messages").insert([
        {
            "conversation_id": conv_id,
            "user_id": req.user_id,
            "role": "user",
            "content": req.message,
            "agent_used": result["agent"],
        },
        {
            "conversation_id": conv_id,
            "user_id": req.user_id,
            "role": "assistant",
            "content": result["reply"],
            "agent_used": result["agent"],
        },
    ]).execute()

    # Save to Mem0 after responding — user doesn't wait for this
    background_tasks.add_task(_save_memory, req.user_id, req.message, result["reply"])

    return ChatResponse(
        reply=result["reply"],
        agent=result["agent"],
        intent=result["intent"],
        conversation_id=conv_id,
    )
