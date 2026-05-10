from supabase import create_client, Client
from core.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client


def get_supabase_user_client(jwt: str) -> Client:
    """Client scoped to a specific user JWT — respects RLS policies."""
    client = create_client(settings.supabase_url, settings.supabase_anon_key)
    client.auth.set_session(jwt, "")
    return client
