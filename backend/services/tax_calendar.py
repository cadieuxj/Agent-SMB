"""
CRA Tax Calendar Engine — rule-based deadline checker for Canadian SMBs.

Returns upcoming federal (CRA) and Quebec (Revenu Québec) deadlines
based on today's date, with urgency classification.
"""

from datetime import date, timedelta
from dataclasses import dataclass


@dataclass
class Deadline:
    date: date
    title: str
    title_fr: str
    description: str
    description_fr: str
    urgency: str          # "overdue" | "urgent" | "upcoming" | "future"
    days_until: int
    authority: str        # "CRA" | "Revenu Québec" | "Both"
    applies_to: list[str] # ["all"] | ["incorporated"] | ["quarterly_filer"] etc.


# Static annual deadline definitions — (month, day, label, label_fr, desc, desc_fr, authority, applies_to)
_ANNUAL_DEADLINES = [
    (2, 28, "T4/RL-1 Slips Due", "Feuillets T4/RL-1 dus",
     "File T4 slips with CRA and RL-1 slips with Revenu Québec. Distribute copies to employees.",
     "Produire les feuillets T4 auprès de l'ARC et les RL-1 auprès de Revenu Québec.",
     "Both", ["employer"]),

    (3, 31, "Q4 HST/GST Remittance (Annual Filers)", "Remise TPS/TVH T4 (déclarants annuels)",
     "Annual HST/GST filers must remit Q4 balance. Also T3 trust returns due.",
     "Les déclarants annuels de TPS/TVH remettent le solde du T4.",
     "CRA", ["annual_filer"]),

    (3, 31, "Q4 QST Remittance (Annual Filers)", "Remise TVQ T4 (déclarants annuels)",
     "Annual QST filers must remit Q4 balance to Revenu Québec.",
     "Les déclarants annuels de TVQ remettent le solde du T4 à Revenu Québec.",
     "Revenu Québec", ["annual_filer", "quebec"]),

    (4, 30, "Personal Tax Filing & Payment", "Production et paiement impôt personnel",
     "T1 personal return and any balance owing due. Corporate tax balance also due (if Dec 31 year-end).",
     "Production de la déclaration T1 et paiement du solde dû.",
     "CRA", ["all"]),

    (4, 30, "Quebec Personal Tax Filing", "Production impôt personnel Québec",
     "Quebec TP-1 personal return and balance owing due to Revenu Québec.",
     "Production de la déclaration TP-1 et paiement du solde à Revenu Québec.",
     "Revenu Québec", ["all", "quebec"]),

    (6, 15, "Self-Employed T1 Filing Deadline", "Date limite T1 travailleur autonome",
     "Extended filing deadline for self-employed individuals. Balance owing was still due April 30.",
     "Date limite prolongée pour les travailleurs autonomes. Le solde dû restait le 30 avril.",
     "CRA", ["self_employed"]),

    (6, 30, "Q2 HST/GST Remittance (Quarterly)", "Remise TPS/TVH T2 (trimestriel)",
     "Quarterly HST/GST filers: remit Q2 (April–June) by June 30.",
     "Déclarants trimestriels: remettre la TPS/TVH du T2 (avril–juin) avant le 30 juin.",
     "CRA", ["quarterly_filer"]),

    (6, 30, "Q2 QST Remittance (Quarterly)", "Remise TVQ T2 (trimestriel)",
     "Quarterly QST filers: remit Q2 balance to Revenu Québec.",
     "Déclarants trimestriels TVQ: remettre le T2 à Revenu Québec.",
     "Revenu Québec", ["quarterly_filer", "quebec"]),

    (9, 30, "Q3 HST/GST Remittance (Quarterly)", "Remise TPS/TVH T3 (trimestriel)",
     "Quarterly HST/GST filers: remit Q3 (July–September) by September 30.",
     "Déclarants trimestriels: remettre la TPS/TVH du T3 avant le 30 septembre.",
     "CRA", ["quarterly_filer"]),

    (9, 30, "Q3 QST Remittance (Quarterly)", "Remise TVQ T3 (trimestriel)",
     "Quarterly QST filers: remit Q3 balance to Revenu Québec.",
     "Déclarants trimestriels TVQ: remettre le T3 à Revenu Québec.",
     "Revenu Québec", ["quarterly_filer", "quebec"]),

    (12, 31, "Q4 HST/GST Remittance (Quarterly)", "Remise TPS/TVH T4 (trimestriel)",
     "Quarterly HST/GST filers: remit Q4 (October–December) by December 31.",
     "Déclarants trimestriels: remettre la TPS/TVH du T4 avant le 31 décembre.",
     "CRA", ["quarterly_filer"]),

    (12, 31, "Q4 QST Remittance (Quarterly)", "Remise TVQ T4 (trimestriel)",
     "Quarterly QST filers: remit Q4 balance. Year-end tax planning deadline.",
     "Déclarants trimestriels TVQ: remettre le T4. Date limite planification fiscale de fin d'année.",
     "Revenu Québec", ["quarterly_filer", "quebec"]),

    (12, 31, "Year-End Tax Planning Deadline", "Date limite planification fiscale",
     "Last day to make RRSP contributions for the business owner, maximize deductions, and bonus declarations.",
     "Dernier jour pour les cotisations REER, maximiser les déductions et déclarer les bonis.",
     "CRA", ["incorporated"]),
]

# Monthly payroll remittance (15th of each month for regular remitters)
_MONTHLY_PAYROLL_DAY = 15


def _urgency(days: int) -> str:
    if days < 0:
        return "overdue"
    if days <= 7:
        return "urgent"
    if days <= 30:
        return "upcoming"
    return "future"


def get_upcoming_deadlines(
    today: date | None = None,
    horizon_days: int = 60,
    province: str = "QC",
    filing_type: str = "quarterly_filer",
) -> list[Deadline]:
    """
    Return all deadlines within the next `horizon_days` days (plus any overdue ones).

    Args:
        today: reference date (defaults to today)
        horizon_days: how far ahead to look
        province: "QC" includes Revenu Québec deadlines, others skip them
        filing_type: "quarterly_filer" | "annual_filer" | "monthly_filer"
    """
    if today is None:
        today = date.today()

    cutoff = today + timedelta(days=horizon_days)
    year = today.year
    results: list[Deadline] = []

    for month, day, title, title_fr, desc, desc_fr, authority, applies_to in _ANNUAL_DEADLINES:
        # Check this year and next year's occurrence
        for y in (year, year + 1):
            try:
                dl = date(y, month, day)
            except ValueError:
                continue

            days_until = (dl - today).days

            # Skip far-future deadlines beyond horizon
            if days_until > horizon_days:
                continue
            # Only include overdue deadlines from this year
            if days_until < -30:
                continue

            # Province filter
            if province != "QC" and "quebec" in applies_to:
                continue
            if authority == "Revenu Québec" and province != "QC":
                continue

            # Filing type filter — "all" always applies
            relevant = (
                "all" in applies_to
                or filing_type in applies_to
                or any(t in applies_to for t in ["employer", "self_employed", "incorporated"])
            )
            if not relevant:
                continue

            results.append(Deadline(
                date=dl,
                title=title,
                title_fr=title_fr,
                description=desc,
                description_fr=desc_fr,
                urgency=_urgency(days_until),
                days_until=days_until,
                authority=authority,
                applies_to=applies_to,
            ))

    # Add monthly payroll remittance deadlines (next 2 months)
    for offset in range(3):
        month = (today.month + offset - 1) % 12 + 1
        year_adj = year + (today.month + offset - 1) // 12
        dl = date(year_adj, month, _MONTHLY_PAYROLL_DAY)
        days_until = (dl - today).days
        if -30 <= days_until <= horizon_days:
            results.append(Deadline(
                date=dl,
                title="Monthly Payroll Remittance",
                title_fr="Remise mensuelle de la paie",
                description="Remit CPP/QPP, EI, and income tax deductions to CRA by the 15th.",
                description_fr="Remettre les cotisations RPC/RRQ, AE et retenues d'impôt à l'ARC avant le 15.",
                urgency=_urgency(days_until),
                days_until=days_until,
                authority="Both",
                applies_to=["employer"],
            ))

    results.sort(key=lambda d: d.date)
    return results


def format_for_prompt(deadlines: list[Deadline], language: str = "fr") -> str:
    """Format deadlines as a compact string for injection into agent system prompts."""
    if not deadlines:
        return ""

    lines = ["## Upcoming Tax Deadlines\n" if language == "en" else "## Échéances fiscales à venir\n"]
    for d in deadlines[:8]:
        urgency_icon = {"overdue": "🚨", "urgent": "⚠️", "upcoming": "📅", "future": "🗓️"}.get(d.urgency, "📅")
        title = d.title if language == "en" else d.title_fr
        days_label = f"{d.days_until}d" if d.days_until >= 0 else f"OVERDUE {abs(d.days_until)}d"
        lines.append(f"{urgency_icon} {d.date.strftime('%b %d')} ({days_label}) — {title} [{d.authority}]")

    return "\n".join(lines)
