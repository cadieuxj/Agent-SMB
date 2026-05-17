"""
APScheduler — background jobs running while the FastAPI server is live.

Jobs:
  07:00 ET  deadline_reminders  — email users about upcoming CRA/RQ deadlines
  08:00 ET  daily_suggestions   — generate proactive nudges for all users
"""
import logging
from datetime import date

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)
_scheduler: BackgroundScheduler | None = None


def _run_daily_suggestions() -> None:
    from services.suggestions import run_for_all_users
    logger.info("[scheduler] Running daily suggestions job")
    results = run_for_all_users()
    total = sum(results.values())
    logger.info(f"[scheduler] Suggestions done: {len(results)} users, {total} nudges")


def _run_deadline_reminders() -> None:
    """
    For every user with deadline_email = true:
    1. Load their profile (province, language, email)
    2. Get upcoming deadlines within their reminder window
    3. Send a reminder email
    """
    from services.email import send_deadline_reminder, DeadlineInfo
    from services.tax_calendar import get_upcoming_deadlines
    from core.supabase_client import get_supabase

    db = get_supabase()
    prefs = (
        db.table("notification_preferences")
        .select("user_id, reminder_days_before")
        .eq("deadline_email", True)
        .execute()
    ).data or []

    if not prefs:
        return

    today = date.today()
    sent = 0

    for pref in prefs:
        user_id = pref["user_id"]
        window = pref["reminder_days_before"]

        profile = (
            db.table("profiles")
            .select("email, business_name, province, language")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        ).data
        if not profile or not profile.get("email"):
            continue

        deadlines = get_upcoming_deadlines(
            today=today,
            horizon_days=window + 1,
            province=profile.get("province", "QC"),
            filing_type="quarterly_filer",
        )
        to_remind = [d for d in deadlines if d.days_until <= window]
        if not to_remind:
            continue

        ok = send_deadline_reminder(
            to_email=profile["email"],
            business_name=profile.get("business_name") or "votre entreprise",
            deadlines=[
                DeadlineInfo(
                    title=d.title,
                    title_fr=d.title_fr,
                    days_until=d.days_until,
                    authority=d.authority,
                    deadline_date=d.date.strftime("%d %B %Y"),
                )
                for d in to_remind
            ],
            language=profile.get("language", "fr"),
        )
        if ok:
            sent += 1

    logger.info(f"[scheduler] Deadline reminders sent to {sent} users")


def start() -> BackgroundScheduler:
    global _scheduler
    _scheduler = BackgroundScheduler(timezone="America/Toronto")

    _scheduler.add_job(
        _run_deadline_reminders,
        trigger=CronTrigger(hour=7, minute=0, timezone="America/Toronto"),
        id="deadline_reminders",
        replace_existing=True,
    )
    _scheduler.add_job(
        _run_daily_suggestions,
        trigger=CronTrigger(hour=8, minute=0, timezone="America/Toronto"),
        id="daily_suggestions",
        replace_existing=True,
    )

    _scheduler.start()
    logger.info("[scheduler] Started — reminders @07:00 ET, suggestions @08:00 ET")
    return _scheduler


def stop() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("[scheduler] Stopped")
