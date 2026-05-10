"""
APScheduler setup — background jobs that run while the FastAPI server is live.

Jobs:
  - daily_suggestions: 08:00 ET every day — generate proactive nudges for all users
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import logging

logger = logging.getLogger(__name__)

_scheduler: BackgroundScheduler | None = None


def _run_daily_suggestions() -> None:
    from services.suggestions import run_for_all_users
    logger.info("[scheduler] Running daily suggestions job")
    results = run_for_all_users()
    total = sum(results.values())
    logger.info(f"[scheduler] Suggestions done: {len(results)} users, {total} nudges generated")


def start() -> BackgroundScheduler:
    global _scheduler
    _scheduler = BackgroundScheduler(timezone="America/Toronto")

    # Daily at 08:00 ET
    _scheduler.add_job(
        _run_daily_suggestions,
        trigger=CronTrigger(hour=8, minute=0, timezone="America/Toronto"),
        id="daily_suggestions",
        replace_existing=True,
    )

    _scheduler.start()
    logger.info("[scheduler] Started — daily suggestions at 08:00 ET")
    return _scheduler


def stop() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("[scheduler] Stopped")
