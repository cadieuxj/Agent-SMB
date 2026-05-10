"""
Tax calendar test — prints upcoming deadlines from today.

Usage (from backend/):
    python scripts/test_tax_calendar.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import date
from services.tax_calendar import get_upcoming_deadlines, format_for_prompt

def run():
    print("=" * 55)
    print(f"Tax Calendar — deadlines from {date.today()} (next 90 days)")
    print("=" * 55)

    deadlines = get_upcoming_deadlines(horizon_days=90, province="QC", filing_type="quarterly_filer")

    for d in deadlines:
        icon = {"overdue": "🚨", "urgent": "⚠️", "upcoming": "📅", "future": "🗓️"}.get(d.urgency, "📅")
        print(f"\n{icon} {d.date}  [{d.urgency.upper()}]  ({d.days_until}d)")
        print(f"   {d.title}")
        print(f"   {d.title_fr}")
        print(f"   Authority: {d.authority}")

    print("\n--- Prompt injection (FR) ---")
    print(format_for_prompt(deadlines, language="fr"))

    print("\n--- Prompt injection (EN) ---")
    print(format_for_prompt(deadlines, language="en"))


if __name__ == "__main__":
    run()
