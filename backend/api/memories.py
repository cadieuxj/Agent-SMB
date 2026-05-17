import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from core.auth import get_current_user_id, require_own_user
from core.mem0_client import get_all_memories, delete_memory, search_memories

router = APIRouter(prefix="/memories", tags=["memories"])

_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="mem0-worker")


class MemoryItem(BaseModel):
    id: str
    memory: str
    created_at: str | None = None
    updated_at: str | None = None


class MemoriesResponse(BaseModel):
    memories: list[MemoryItem]
    total: int


@router.get("/{user_id}", response_model=MemoriesResponse)
async def list_memories(user_id: str, token_user_id: str = Depends(get_current_user_id)):
    require_own_user(user_id, token_user_id)
    loop = asyncio.get_event_loop()
    memories = await loop.run_in_executor(_executor, lambda: get_all_memories(user_id=user_id))
    items = [
        MemoryItem(
            id=m.get("id", ""),
            memory=m.get("memory", m.get("text", "")),
            created_at=str(m.get("created_at", "")),
            updated_at=str(m.get("updated_at", "")),
        )
        for m in memories
    ]
    return MemoriesResponse(memories=items, total=len(items))


@router.get("/{user_id}/search", response_model=MemoriesResponse)
async def search(user_id: str, q: str, limit: int = Query(default=10, le=100), token_user_id: str = Depends(get_current_user_id)):
    require_own_user(user_id, token_user_id)
    loop = asyncio.get_event_loop()
    memories = await loop.run_in_executor(
        _executor, lambda: search_memories(user_id=user_id, query=q, limit=min(limit, 100))
    )
    items = [
        MemoryItem(
            id=m.get("id", ""),
            memory=m.get("memory", m.get("text", "")),
            created_at=str(m.get("created_at", "")),
        )
        for m in memories
    ]
    return MemoriesResponse(memories=items, total=len(items))


@router.delete("/{user_id}/{memory_id}")
async def remove_memory(user_id: str, memory_id: str, token_user_id: str = Depends(get_current_user_id)):
    require_own_user(user_id, token_user_id)
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(_executor, lambda: delete_memory(memory_id))
        return {"deleted": memory_id}
    except Exception:
        raise HTTPException(status_code=404, detail="Memory not found")
