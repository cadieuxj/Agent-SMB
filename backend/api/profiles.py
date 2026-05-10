from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.supabase_client import get_supabase

router = APIRouter(prefix="/profiles", tags=["profiles"])


class ProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str | None
    business_name: str | None
    business_type: str | None
    province: str
    language: str


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    business_name: str | None = None
    business_type: str | None = None
    province: str | None = None
    language: str | None = None


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(user_id: str):
    db = get_supabase()
    result = db.table("profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    r = result.data
    return ProfileResponse(
        id=r["id"],
        email=r.get("email", ""),
        full_name=r.get("full_name"),
        business_name=r.get("business_name"),
        business_type=r.get("business_type"),
        province=r.get("province", "QC"),
        language=r.get("language", "fr"),
    )


@router.patch("/{user_id}", response_model=ProfileResponse)
async def update_profile(user_id: str, body: ProfileUpdate):
    db = get_supabase()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = db.table("profiles").update(updates).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    r = result.data[0]
    return ProfileResponse(
        id=r["id"],
        email=r.get("email", ""),
        full_name=r.get("full_name"),
        business_name=r.get("business_name"),
        business_type=r.get("business_type"),
        province=r.get("province", "QC"),
        language=r.get("language", "fr"),
    )
