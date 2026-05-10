from mem0 import MemoryClient
from core.config import settings

_mem0: MemoryClient | None = None


def get_mem0() -> MemoryClient:
    global _mem0
    if _mem0 is None:
        _mem0 = MemoryClient(api_key=settings.mem0_api_key)
    return _mem0


def _normalize(result) -> list[dict]:
    """Mem0 SDK returns either a list or {"results": [...]} depending on version."""
    if isinstance(result, list):
        return result
    if isinstance(result, dict):
        return result.get("results", result.get("memories", []))
    return []


def add_memory(user_id: str, messages: list[dict]) -> list[dict]:
    """
    Persist messages to Mem0, scoped to this user.
    messages: [{"role": "user"|"assistant", "content": "..."}]
    """
    return _normalize(get_mem0().add(messages, user_id=user_id))


def search_memories(user_id: str, query: str, limit: int = 10) -> list[dict]:
    """Semantic search over a user's memories."""
    return _normalize(get_mem0().search(query, user_id=user_id, limit=limit))


def get_all_memories(user_id: str) -> list[dict]:
    """Retrieve all memories for a user — used for proactive suggestions."""
    return _normalize(get_mem0().get_all(user_id=user_id))


def delete_memory(memory_id: str) -> None:
    get_mem0().delete(memory_id)
