from fastapi import APIRouter
from pydantic import BaseModel

from core.supabase_client import get_supabase

router = APIRouter(prefix="/conversations", tags=["conversations"])


class ConversationItem(BaseModel):
    id: str
    title: str | None
    created_at: str


class MessageItem(BaseModel):
    id: str
    role: str
    content: str
    agent_used: str | None
    created_at: str


@router.get("/{user_id}", response_model=list[ConversationItem])
async def list_conversations(user_id: str, limit: int = 20):
    db = get_supabase()
    result = (
        db.table("conversations")
        .select("id, title, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return [
        ConversationItem(id=r["id"], title=r.get("title"), created_at=str(r["created_at"]))
        for r in result.data
    ]


@router.get("/{user_id}/{conversation_id}/messages", response_model=list[MessageItem])
async def get_messages(user_id: str, conversation_id: str):
    db = get_supabase()
    result = (
        db.table("messages")
        .select("id, role, content, agent_used, created_at")
        .eq("conversation_id", conversation_id)
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .execute()
    )
    return [
        MessageItem(
            id=r["id"],
            role=r["role"],
            content=r["content"],
            agent_used=r.get("agent_used"),
            created_at=str(r["created_at"]),
        )
        for r in result.data
    ]
