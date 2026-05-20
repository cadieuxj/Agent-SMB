import logging
import time
from mem0 import MemoryClient
from core.config import settings

logger = logging.getLogger("agentsmb.mem0")

_mem0: MemoryClient | None = None
_init_failed: bool = False


def get_mem0() -> MemoryClient:
    """Return shared MemoryClient, initializing on first call."""
    global _mem0, _init_failed
    if _mem0 is None:
        try:
            _mem0 = MemoryClient(api_key=settings.mem0_api_key)
            _init_failed = False
            logger.info("Mem0 client initialized")
        except Exception as exc:
            _init_failed = True
            logger.error("Mem0 client init failed: %s", exc, exc_info=True)
            raise
    return _mem0


def _normalize(result) -> list[dict]:
    """Mem0 SDK returns list, {'results': [...]}, or {'memories': [...]}, depending on version."""
    if isinstance(result, list):
        return result
    if isinstance(result, dict):
        return result.get("results", result.get("memories", []))
    return []


def add_memory(user_id: str, messages: list[dict]) -> list[dict]:
    """
    Persist a conversation exchange to Mem0, scoped to this user.
    messages: [{"role": "user"|"assistant", "content": "..."}]
    Returns the queued/processed memory list (may be PENDING status).
    Raises on failure so callers can log and handle.
    """
    client = get_mem0()
    result = client.add(messages, user_id=user_id)
    normalized = _normalize(result)
    logger.debug("add_memory user=%s queued %d items", user_id[:8], len(normalized))
    return normalized


def search_memories(user_id: str, query: str, limit: int = 10) -> list[dict]:
    """Semantic search over a user's memories. Returns [] on any failure."""
    try:
        client = get_mem0()
        result = client.search(query, user_id=user_id, limit=limit)
        return _normalize(result)
    except Exception as exc:
        logger.warning("search_memories failed user=%s: %s", user_id[:8], exc)
        return []


def get_all_memories(user_id: str) -> list[dict]:
    """Retrieve all memories for a user. Returns [] on any failure."""
    try:
        client = get_mem0()
        result = client.get_all(user_id=user_id)
        return _normalize(result)
    except Exception as exc:
        logger.warning("get_all_memories failed user=%s: %s", user_id[:8], exc)
        return []


def delete_memory(memory_id: str) -> None:
    """Delete a single memory by ID."""
    get_mem0().delete(memory_id)
