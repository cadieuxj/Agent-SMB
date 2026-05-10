"""
Proactive Suggestions Service.

Reads a user's Mem0 memories + upcoming tax deadlines, then uses Claude
to generate 1–3 personalized nudges. Stores them in Supabase `suggestions`
table so the frontend can surface them on the user's next login.

Designed to run on a daily schedule via the scheduler.
"""

import anthropic
from datetime import date

from core.config import settings
from core.mem0_client import get_all_memories
from core.supabase_client import get_supabase
from services.tax_calendar import get_upcoming_deadlines, format_for_prompt

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

_SYSTEM = """\
You are generating proactive business nudges for a Canadian SMB owner.
You have access to their memory history and upcoming tax deadlines.

Your job: produce 1 to 3 short, specific, actionable nudges that would genuinely help them
this week. Each nudge should feel like a message from a business partner who remembered something
important — not a generic reminder.

Rules:
- Each nudge is ONE sentence, max 20 words
- Be specific: reference actual details from their memory when possible
- Mix sources: at least one nudge from memory, one from tax calendar if anything is urgent/upcoming
- Output as a JSON array of strings, nothing else

Example output:
["You mentioned margins were tight last month — supplier invoice season starts next week, worth reviewing costs now.",
 "⚠️ HST/GST remittance is due in 8 days — have you set aside the Q2 balance?"]
"""


def _build_memory_summary(memories: list[dict]) -> str:
    if not memories:
        return "No memories yet for this user."
    lines = []
    for m in memories[:15]:
        text = m.get("memory", m.get("text", ""))
        if text:
            lines.append(f"- {text}")
    return "\n".join(lines) if lines else "No memories yet."


def generate_for_user(
    user_id: str,
    language: str = "fr",
    province: str = "QC",
    filing_type: str = "quarterly_filer",
) -> list[str]:
    """
    Generate proactive nudges for a single user.
    Returns a list of nudge strings (1–3).
    """
    memories = get_all_memories(user_id=user_id)
    memory_summary = _build_memory_summary(memories)

    deadlines = get_upcoming_deadlines(
        today=date.today(),
        horizon_days=45,
        province=province,
        filing_type=filing_type,
    )
    deadline_block = format_for_prompt(deadlines, language=language)

    prompt = f"""## User's Business Memory
{memory_summary}

{deadline_block}

Generate 1–3 proactive nudges for this SMB owner. Respond in {"French" if language == "fr" else "English"}.
Output JSON array only."""

    response = _client.messages.create(
        model=settings.claude_model,
        max_tokens=256,
        system=[{"type": "text", "text": _SYSTEM, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()

    # Parse JSON array — strip markdown fences if present
    import json, re
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)
    try:
        nudges = json.loads(raw)
        if isinstance(nudges, list):
            return [str(n) for n in nudges[:3]]
    except (json.JSONDecodeError, ValueError):
        pass

    # Fallback: return as single nudge
    return [raw[:200]] if raw else []


def save_suggestions(user_id: str, nudges: list[str], source_type: str = "memory_recall") -> None:
    """Persist generated nudges to Supabase suggestions table."""
    if not nudges:
        return
    db = get_supabase()
    rows = [
        {"user_id": user_id, "content": nudge, "source_type": source_type, "shown": False}
        for nudge in nudges
    ]
    db.table("suggestions").insert(rows).execute()


def run_for_user(user_id: str, language: str = "fr", province: str = "QC") -> int:
    """Full pipeline: generate nudges and persist them. Returns count saved."""
    nudges = generate_for_user(user_id=user_id, language=language, province=province)
    save_suggestions(user_id=user_id, nudges=nudges)
    return len(nudges)


def run_for_all_users() -> dict[str, int]:
    """
    Run the suggestion pipeline for all users.
    Called by the scheduler daily.
    Returns {user_id: nudge_count}.
    """
    db = get_supabase()
    profiles = db.table("profiles").select("id, language, province").execute()
    results = {}
    for profile in profiles.data:
        uid = profile["id"]
        lang = profile.get("language", "fr")
        province = profile.get("province", "QC")
        try:
            count = run_for_user(user_id=uid, language=lang, province=province)
            results[uid] = count
        except Exception as e:
            results[uid] = 0
            print(f"[suggestions] failed for {uid}: {e}")
    return results
