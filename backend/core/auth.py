"""
JWT authentication dependency for FastAPI routes.
Verifies the Supabase user JWT from the Authorization header,
then ensures the caller can only access their own data.
"""
import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.config import settings

_bearer = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    jwt = credentials.credentials
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{settings.supabase_url}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {jwt}",
                    "apikey": settings.supabase_anon_key,
                },
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return resp.json()["id"]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_own_user(user_id: str, token_user_id: str) -> None:
    """Raise 403 if the token user is trying to access another user's data."""
    if user_id != token_user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
