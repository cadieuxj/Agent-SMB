import asyncio
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from postgrest.exceptions import APIError
from pydantic import BaseModel

from core.auth import get_current_user_id, require_own_user
from core.supabase_client import get_supabase

_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="profile-worker")

router = APIRouter(prefix="/profiles", tags=["profiles"])


class ProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str | None
    business_name: str | None
    business_type: str | None
    province: str
    language: str
    sales_tax_registered: bool | None
    revenue_range: str | None
    accountant_email: str | None = None
    prior_year_net_income: float | None = None


class ProfileUpdate(BaseModel):
    email: str | None = None
    full_name: str | None = None
    business_name: str | None = None
    business_type: str | None = None
    province: str | None = None
    language: str | None = None
    sales_tax_registered: bool | None = None
    revenue_range: str | None = None
    accountant_email: str | None = None
    prior_year_net_income: float | None = None


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(user_id: str, token_user_id: str = Depends(get_current_user_id)):
    require_own_user(user_id, token_user_id)
    db = get_supabase()
    try:
        result = db.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
        if result is None or not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
    except APIError as exc:
        if str(exc.code) == "204":
            raise HTTPException(status_code=404, detail="Profile not found")
        raise HTTPException(status_code=500, detail="Failed to load profile")
    r = result.data
    return ProfileResponse(
        id=r["id"],
        email=r.get("email", ""),
        full_name=r.get("full_name"),
        business_name=r.get("business_name"),
        business_type=r.get("business_type"),
        province=r.get("province", "QC"),
        language=r.get("language", "fr"),
        sales_tax_registered=r.get("sales_tax_registered"),
        revenue_range=r.get("revenue_range"),
        accountant_email=r.get("accountant_email"),
        prior_year_net_income=r.get("prior_year_net_income"),
    )


@router.patch("/{user_id}", response_model=ProfileResponse)
async def update_profile(
    user_id: str,
    body: ProfileUpdate,
    background_tasks: BackgroundTasks,
    token_user_id: str = Depends(get_current_user_id),
):
    require_own_user(user_id, token_user_id)
    db = get_supabase()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Upsert so users who registered before the DB trigger still get a row created
    result = db.table("profiles").upsert(
        {"id": user_id, **updates},
        on_conflict="id",
    ).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save profile")
    r = result.data[0]

    # Send welcome email when business_name is set for the first time
    if body.business_name and body.email:
        def _maybe_welcome():
            from services.email import send_welcome_email
            send_welcome_email(
                to_email=body.email,
                business_name=body.business_name,
                business_type=body.business_type or "",
                province=body.province or "QC",
                language=body.language or "fr",
            )
        background_tasks.add_task(_maybe_welcome)

    return ProfileResponse(
        id=r["id"],
        email=r.get("email", ""),
        full_name=r.get("full_name"),
        business_name=r.get("business_name"),
        business_type=r.get("business_type"),
        province=r.get("province", "QC"),
        language=r.get("language", "fr"),
        sales_tax_registered=r.get("sales_tax_registered"),
        revenue_range=r.get("revenue_range"),
        accountant_email=r.get("accountant_email"),
        prior_year_net_income=r.get("prior_year_net_income"),
    )


@router.delete("/{user_id}")
async def delete_account(user_id: str, token_user_id: str = Depends(get_current_user_id)):
    """Right to erasure — Law 25 / PIPEDA §28."""
    require_own_user(user_id, token_user_id)
    db = get_supabase()
    # Cascade FK on messages/conversations; delete non-cascading tables explicitly
    for table in ("suggestions", "notification_preferences", "conversations", "profiles"):
        db.table(table).delete().eq("user_id" if table != "profiles" else "id", user_id).execute()
    # Delete all Mem0 memories (Law 25 §28 right to erasure)
    try:
        from core.mem0_client import get_mem0
        get_mem0().delete_all(user_id=user_id)
    except Exception:
        pass
    try:
        db.auth.admin.delete_user(user_id)
    except Exception:
        pass
    return {"deleted": user_id}
