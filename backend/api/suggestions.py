from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.supabase_client import get_supabase
from services.suggestions import run_for_user
from services.tax_calendar import get_upcoming_deadlines
from datetime import date

router = APIRouter(prefix="/suggestions", tags=["suggestions"])


class SuggestionItem(BaseModel):
    id: str
    content: str
    source_type: str | None
    created_at: str


class SuggestionsResponse(BaseModel):
    suggestions: list[SuggestionItem]
    total: int


class DeadlineItem(BaseModel):
    date: str
    title: str
    title_fr: str
    urgency: str
    days_until: int
    authority: str


@router.get("/{user_id}", response_model=SuggestionsResponse)
async def get_suggestions(user_id: str, unshown_only: bool = True):
    """Return stored suggestions for a user. Marks returned ones as shown."""
    db = get_supabase()

    query = db.table("suggestions").select("*").eq("user_id", user_id)
    if unshown_only:
        query = query.eq("shown", False)

    result = query.order("created_at", desc=True).limit(10).execute()
    items = [
        SuggestionItem(
            id=r["id"],
            content=r["content"],
            source_type=r.get("source_type"),
            created_at=str(r["created_at"]),
        )
        for r in result.data
    ]

    # Mark as shown
    if items and unshown_only:
        ids = [i.id for i in items]
        db.table("suggestions").update({"shown": True}).in_("id", ids).execute()

    return SuggestionsResponse(suggestions=items, total=len(items))


@router.post("/{user_id}/generate")
async def generate_suggestions(user_id: str, language: str = "fr", province: str = "QC"):
    """Manually trigger suggestion generation for a user (for testing)."""
    try:
        count = run_for_user(user_id=user_id, language=language, province=province)
        return {"generated": count, "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/deadlines", response_model=list[DeadlineItem])
async def get_deadlines(
    user_id: str,
    horizon_days: int = 60,
    province: str = "QC",
    filing_type: str = "quarterly_filer",
):
    """Return upcoming CRA/RQ deadlines for a user's province and filing type."""
    deadlines = get_upcoming_deadlines(
        today=date.today(),
        horizon_days=horizon_days,
        province=province,
        filing_type=filing_type,
    )
    return [
        DeadlineItem(
            date=d.date.isoformat(),
            title=d.title,
            title_fr=d.title_fr,
            urgency=d.urgency,
            days_until=d.days_until,
            authority=d.authority,
        )
        for d in deadlines
    ]
