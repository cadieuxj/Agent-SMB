from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError
from pydantic import BaseModel, Field

from core.auth import get_current_user_id, require_own_user
from core.supabase_client import get_supabase

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationPreferences(BaseModel):
    deadline_email: bool = False
    reminder_days_before: int = Field(default=7, ge=1, le=30)
    monthly_digest_email: bool = False


@router.get("/{user_id}/preferences", response_model=NotificationPreferences)
async def get_preferences(
    user_id: str,
    token_user_id: str = Depends(get_current_user_id),
):
    require_own_user(user_id, token_user_id)
    db = get_supabase()
    try:
        result = (
            db.table("notification_preferences")
            .select("deadline_email, reminder_days_before, monthly_digest_email")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        # SDK returns None (not an object) when no row exists in some versions
        if result is None or not result.data:
            return NotificationPreferences()
        return NotificationPreferences(**result.data)
    except APIError as exc:
        if str(exc.code) == "204":
            return NotificationPreferences()
        raise HTTPException(status_code=500, detail="Failed to load notification preferences")


@router.post("/{user_id}/preferences", response_model=NotificationPreferences)
async def save_preferences(
    user_id: str,
    body: NotificationPreferences,
    token_user_id: str = Depends(get_current_user_id),
):
    require_own_user(user_id, token_user_id)
    db = get_supabase()
    db.table("notification_preferences").upsert(
        {
            "user_id": user_id,
            "deadline_email": body.deadline_email,
            "reminder_days_before": body.reminder_days_before,
            "monthly_digest_email": body.monthly_digest_email,
        },
        on_conflict="user_id",
    ).execute()
    return body
