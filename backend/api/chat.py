from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from uuid import UUID

from agents.orchestrator import route
from core.supabase_client import get_supabase

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    user_id: str
    email: str | None = None
    message: str
    conversation_id: str | None = None
    language: str = "fr"


class ChatResponse(BaseModel):
    reply: str
    agent: str
    intent: str
    conversation_id: str


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    db = get_supabase()

    # Ensure profile row exists with real email when available
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

    # Load recent conversation history (last 10 messages)
    history_result = (
        db.table("messages")
        .select("role, content")
        .eq("conversation_id", conv_id)
        .order("created_at", desc=False)
        .limit(10)
        .execute()
    )
    history = [{"role": r["role"], "content": r["content"]} for r in history_result.data]

    # Route to correct agent
    result = route(
        user_id=req.user_id,
        message=req.message,
        conversation_history=history,
        language=req.language,
    )

    # Persist both turns
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

    return ChatResponse(
        reply=result["reply"],
        agent=result["agent"],
        intent=result["intent"],
        conversation_id=conv_id,
    )
