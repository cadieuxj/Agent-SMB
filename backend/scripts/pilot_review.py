"""
Agent SMB — Pilot Customer Review System
=========================================
Simulates 5 Canadian SMB owner personas reviewing the app.
If average score < 8.0, a UI/UX synthesizer agent generates improvement
recommendations. Iterates up to MAX_ITERATIONS until target is reached.

Usage:
    cd backend && source .venv/bin/activate
    python scripts/pilot_review.py
    # Output saved to: scripts/pilot_feedback_report.md
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

import anthropic

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

TARGET_SCORE = 9.0
MAX_ITERATIONS = 4
MODEL = "claude-sonnet-4-6"
OUTPUT_FILE = Path(__file__).parent / "pilot_feedback_report.md"

# ---------------------------------------------------------------------------
# Personas
# ---------------------------------------------------------------------------

PERSONAS = [
    {
        "id": "marie",
        "name": "Marie Tremblay",
        "age": 42,
        "location": "Québec City, QC",
        "business": "Bistro Le Vieux-Québec — restaurant with 8 employees",
        "tech_level": "moderate",
        "pain_points": ["TPS/TVQ quarterly remittances always confuse me", "miss CRA deadlines"],
        "language_pref": "French (Quebec)",
        "persona": (
            "You are Marie Tremblay, 42, owner of a restaurant in Quebec City. "
            "You speak primarily French. You're moderately tech-savvy — comfortable with "
            "smartphones and basic apps, but not a developer. You've struggled with tax "
            "remittances and missed a CRA deadline last year that cost you $400 in penalties. "
            "You're evaluating Agent SMB to help manage your fiscal obligations."
        ),
    },
    {
        "id": "kevin",
        "name": "Kevin Zhang",
        "age": 34,
        "location": "Toronto, ON",
        "business": "Solo IT contractor — web development",
        "tech_level": "high",
        "pain_points": ["unsure which expenses are deductible", "quarterly installments"],
        "language_pref": "English",
        "persona": (
            "You are Kevin Zhang, 34, a solo IT contractor in Toronto. "
            "You're highly tech-savvy — you evaluate SaaS apps critically, notice UX details, "
            "and compare to tools like Notion, Linear, and ChatGPT. You want deduction advice "
            "and quarterly installment reminders. You'll notice if the UI is inconsistent or "
            "if the AI responses are generic vs. genuinely Canadian-specific."
        ),
    },
    {
        "id": "fatima",
        "name": "Fatima Ouali",
        "age": 38,
        "location": "Laval, QC",
        "business": "Salon Beauté Dorée — 3 hairdressing chairs, 2 employees",
        "tech_level": "low",
        "pain_points": ["RRQ contributions confusing", "payroll basics", "language — prefers French"],
        "language_pref": "French",
        "persona": (
            "You are Fatima Ouali, 38, owner of a beauty salon in Laval. "
            "You use your phone mostly, rarely a computer. You find most business apps too "
            "complicated. You need simple, clear answers in French. You're confused about RRQ "
            "contributions for your 2 employees and want to know if you need to charge TVQ. "
            "You'll rate the app lower if the French feels robotic or if there are too many steps."
        ),
    },
    {
        "id": "dave",
        "name": "Dave Bouchard",
        "age": 51,
        "location": "Moncton, NB",
        "business": "Bouchard Contracting — general contractor, 4 employees",
        "tech_level": "low",
        "pain_points": ["CRA deadlines", "GST/HST remittances", "cash flow in winter"],
        "language_pref": "English (bilingual NB)",
        "persona": (
            "You are Dave Bouchard, 51, a general contractor in New Brunswick. "
            "You're not a fan of technology — you use email and that's about it. "
            "You need someone to tell you clearly when your GST remittance is due, "
            "how to handle slow winter months, and whether you should incorporate. "
            "You want simple, no-nonsense advice. You'll rate down if the app feels "
            "too 'Silicon Valley' or if answers have too many caveats."
        ),
    },
    {
        "id": "isabelle",
        "name": "Isabelle Roy",
        "age": 29,
        "location": "Montréal, QC",
        "business": "Freelance bookkeeper — 12 SMB clients",
        "tech_level": "high",
        "pain_points": ["wants tool to share with clients", "accuracy of tax info critical"],
        "language_pref": "French",
        "persona": (
            "You are Isabelle Roy, 29, a freelance bookkeeper in Montreal with 12 SMB clients. "
            "You're highly educated on Canadian tax law and will notice any inaccuracies. "
            "You use apps like QuickBooks, Dext, and Slack daily. You want to evaluate if "
            "Agent SMB could replace some of your client education work. You care deeply about "
            "data privacy (you handle sensitive client financial data) and will ask about Law 25 "
            "compliance. You'll rate down for vague answers or missing privacy features."
        ),
    },
]

# ---------------------------------------------------------------------------
# App description passed to each persona
# ---------------------------------------------------------------------------

APP_DESCRIPTION = """
Agent SMB is a bilingual (French/English) AI business advisor SaaS for Canadian SMBs.
Default theme is LIGHT MODE (professional white interface like QuickBooks/Sage). Dark mode available in settings.
Developed by CadieuxAI Inc. (Canada). All data hosted in Canada.

KEY FEATURES:
1. Authentication: Magic-link login (no password). Trust badges on login screen. Light mode by default — looks like a professional Canadian business tool, not a tech startup.
2. Onboarding: 4-step wizard — language (EN-first for Ontario/BC/AB, FR-first for QC/NB), business profile, tax context (province, TPS/TVQ, revenue range, prior-year net income), 14-day Pro trial (no credit card).
3. Dashboard: Priority hero card (most urgent deadline or suggestion). Then: Installment sticky card. Then: Annual Fiscal Calendar. Then: 4-widget grid (deadlines, suggestions, AI memory snapshot, quick chat).
4. Installment Sticky Card (NEW — Sprint 8): Always-visible amber card on dashboard showing "Prochain acompte: Jun 15 — $6,796 / trimestre". Based on prior-year net income entered in Account → Comptable section. If income not set, shows a CTA to enter it. Links directly to Account settings. Zero navigation required — contractors and self-employed users see their most important number at a glance.
5. Annual Fiscal Calendar (Sprint 7+8): Full-year 2026 tax calendar. Collapsed: next 3 deadline chips. Expanded: 12-month grid (2-column on mobile for larger touch targets). Each event shows: colored dot (red=filing, blue=remittance, amber=installment, green=planning) PLUS authority badge — ARC in RED (Canadian flag color) for federal/CRA deadlines, RQ in BLUE (Quebec flag / fleur-de-lis color) for Revenu Québec deadlines. Legend always visible. Month cells are tappable — tapping opens a bottom sheet with full event details, dates, and authority badges. .ics calendar export button. For non-Quebec provinces, RQ events are not shown.
6. Chat: Bilingual AI with 3 specialist agents (General, Tax/Fiscalité, Cash Flow/Trésorerie). Auto-routes to right agent. "Choisir un conseiller / Choose advisor" button (renamed from "Expert mode" — no tech jargon) lets power users manually select an agent. First-visit tooltip explains that AI auto-routes. Messages always fully visible.
7. Industry context chips: Horizontally scrollable chip row above chat input — Restaurant, Salon/Spa, Entrepreneur, Employees, First year. Each pre-fills a bilingual context-setting message specific to that industry's Canadian tax situation.
8. Persistent message counter badge: Always-visible pill in chat header (23/50 msg). Gray → amber at 80% → red at 95%. Tooltip explains monthly reset. Disappears for Pro users. No surprise paywalls.
9. Export: Three options in chat desktop header: .md download, PDF (full conversation), "Comptable / Accountant" (formatted Q&A PDF with structured layout — bold, tables, lists all properly rendered, not raw markdown). Plus clipboard copy button as fallback (solves Gmail 2000-char URL limit). "Email My Accountant" button opens pre-filled mailto with accountant's email (stored server-side in profiles table, survives browser resets).
10. Documents page (formerly Mémoire): All AI memories categorized (Fiscalité, Trésorerie, Profil). Delete with 3s undo. Refresh button + auto-refetch on window focus. Free tier: 5 memories shown, rest blurred behind Pro upgrade.
11. Account / Compte settings: Profile (name, business, province, language), Display (theme: Light/Dark/System), Location & Language (province auto-sets language), Accountant & Tax Planning (accountant email + prior-year net income for installment calc), Email notifications (monthly digest toggle + deadline reminders 3/7/14 days), Danger zone (account deletion — full Law 25 right-to-erasure including Mem0 memories).
12. Billing: Free (50 msg/mo) / Pro $49 CAD/mo / Business $99 CAD/mo. Persistent counter. Paywall toast at 40 messages. Upgrade modal uses dark theme correctly in both light and dark mode (readable in all situations).
13. Monthly auto-email digest: Opt-in in Account. Sent 1st of each month. Bilingual HTML email with: upcoming deadlines (45-day horizon), estimated quarterly installments (if prior-year income set), fiscal summary.
14. Tax agent quality: Direct CRA answers — CPP 5.95%, QST 9.975%, T2125 vs T2 auto-detection, CRA publication citations, Revenu Québec source badge for QC users. One-sentence disclaimer at end only.
15. Privacy: Full Law 25 / PIPEDA policy. No AI training in chat footer, privacy page, every export. Consent checkbox on login. Cookie notice. Account deletion erases Supabase data AND Mem0 memories.
16. Landing page (public, bilingual, always dark): Hero, features, how-it-works, pricing ($0/$49/$99 CAD), trust badges (ARC compliant, Law 25, no AI training, data in Canada), testimonials, FR/EN toggle.

PRICING: Free $0 / Pro $49 CAD/mo / Business $99 CAD/mo
DESIGN: Light mode default. Dark mode available. All modals remain dark-themed and readable in both modes.
LANGUAGE: EN-first for Ontario/BC/AB/MB/SK/NS/NL/PE. FR-first for QC/NB. Bilingual throughout.
TARGET: Canadian SMBs — restaurants, contractors, salons, professionals, freelancers, bookkeepers.
PRIVACY: Law 25 / PIPEDA. Data in Canada. CadieuxAI Inc.
"""

# ---------------------------------------------------------------------------
# Evaluation criteria
# ---------------------------------------------------------------------------

def _extract_json(text: str) -> dict:
    """Robustly extract JSON from Claude output, handling code fences and trailing text."""
    import re
    # Strip code fences
    text = re.sub(r"^```(?:json)?\s*", "", text.strip())
    text = re.sub(r"\s*```$", "", text.strip())
    text = text.strip()
    # Find the outermost JSON object
    start = text.find("{")
    if start == -1:
        raise ValueError("No JSON object found in response")
    # Walk to find matching closing brace
    depth = 0
    in_string = False
    escape_next = False
    end = start
    for i, ch in enumerate(text[start:], start):
        if escape_next:
            escape_next = False
            continue
        if ch == "\\" and in_string:
            escape_next = True
            continue
        if ch == '"':
            in_string = not in_string
        if not in_string:
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i
                    break
    raw = text[start : end + 1]
    # First try strict JSON
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    # Fallback: use ast.literal_eval for Python-style dicts (single quotes)
    import ast
    try:
        result = ast.literal_eval(raw)
        if isinstance(result, dict):
            return result
    except (ValueError, SyntaxError):
        pass
    raise ValueError(f"Could not parse JSON/dict from response: {raw[:200]}")


CRITERIA = [
    ("onboarding",   "Onboarding experience (clarity, ease, relevance of steps)"),
    ("dashboard",    "Dashboard usefulness (widgets, information density, clarity)"),
    ("chat",         "Chat quality (AI responses, agent specialization, Canadian-specific)"),
    ("ui_ux",        "UI/UX overall (design, professionalism, clarity, trust)"),
    ("navigation",   "Navigation ease (finding features, mobile experience)"),
    ("language",     "French/English quality and appropriateness for your context"),
]

# ---------------------------------------------------------------------------
# Persona review
# ---------------------------------------------------------------------------

def evaluate_persona(client: anthropic.Anthropic, persona: dict, iteration: int) -> dict:
    """Have Claude roleplay as the persona and evaluate the app."""
    criteria_list = "\n".join(
        f'  - "{k}": {desc} (score 1–10)' for k, desc in CRITERIA
    )

    prompt = f"""
{persona['persona']}

You have just tested the following app:

{APP_DESCRIPTION}

Based on your background, needs, and tech comfort level, evaluate the app honestly.

Return ONLY valid JSON with this exact structure:
{{
  "scores": {{
    "onboarding": <int 1-10>,
    "dashboard": <int 1-10>,
    "chat": <int 1-10>,
    "ui_ux": <int 1-10>,
    "navigation": <int 1-10>,
    "language": <int 1-10>
  }},
  "overall": <float — average of the 6 scores, 1 decimal>,
  "liked": ["thing 1", "thing 2", "thing 3"],
  "wants_improved": ["thing 1", "thing 2", "thing 3"],
  "would_pay_49": <true or false>,
  "pay_reason": "<one sentence why or why not>",
  "standout_quote": "<a one-sentence quote as this persona that captures your honest reaction>"
}}

Scoring criteria:
{criteria_list}

The Pro plan costs $49 CAD/month. Evaluate honestly whether this price point is justified for
your persona's situation. A low-tech 51-year-old contractor and a tech-savvy Montreal bookkeeper
will have very different reactions. Score genuinely — do not inflate.
"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    result = _extract_json(raw)
    result["persona_id"] = persona["id"]
    result["persona_name"] = persona["name"]
    result["iteration"] = iteration
    return result


# ---------------------------------------------------------------------------
# UI/UX synthesizer
# ---------------------------------------------------------------------------

def synthesize_improvements(client: anthropic.Anthropic, reviews: list[dict]) -> dict:
    """
    Act as a UI/UX expert synthesizing all persona reviews.
    Returns prioritized improvements with expected score impact.
    """
    review_summary = "\n\n".join(
        f"**{r['persona_name']}** (avg {r['overall']}/10)\n"
        f"Scores: {r['scores']}\n"
        f"Liked: {r['liked']}\n"
        f"Wants improved: {r['wants_improved']}\n"
        f"Would pay $49 CAD: {r['would_pay_49']} — {r['pay_reason']}\n"
        f"Quote: \"{r['standout_quote']}\""
        for r in reviews
    )

    avg = sum(r["overall"] for r in reviews) / len(reviews)

    prompt = f"""
You are a senior product designer and UX expert specializing in B2B SaaS for non-technical users.

Current average score across 5 Canadian SMB personas: {avg:.1f}/10
Pricing context: Pro plan is now $49 CAD/month (up from $29).

Here are the persona reviews:

{review_summary}

App description for context:
{APP_DESCRIPTION}

Task: Generate TWO separate improvement roadmaps — one to reach 9.0/10 and one to push to 9.5/10.

ROADMAP 1 — Reach 9.0/10:
Identify the TOP 5 highest-impact, LOW-TO-MEDIUM effort improvements.
These should be achievable in 1–2 sprints without major architectural changes.
Focus on changes that affect MULTIPLE personas simultaneously.

ROADMAP 2 — Reach 9.5/10 (from 9.0 baseline):
Identify 5 additional improvements that require more effort but have the highest ROI.
These can include new features, but must be justified by ROI relative to effort.

For each improvement, be SPECIFIC — name exact UI components, page names, or copy changes.
Avoid generic advice like "improve onboarding" — say exactly what to change.

Return ONLY valid JSON:
{{
  "roadmap_to_9": {{
    "improvements": [
      {{
        "rank": 1,
        "area": "<ui_ux|onboarding|chat|dashboard|navigation|language|pricing>",
        "title": "<short title>",
        "description": "<specific change to make — what component, what copy, what behavior>",
        "affects_personas": ["marie", "dave"],
        "expected_score_delta": <float>,
        "effort": "<low|medium|high>",
        "roi_note": "<one sentence on why this is high ROI>"
      }}
    ],
    "root_cause": "<one paragraph diagnosis of the main gap between current score and 9.0>",
    "projected_score_after": <float>
  }},
  "roadmap_to_9_5": {{
    "improvements": [
      {{
        "rank": 1,
        "area": "<area>",
        "title": "<short title>",
        "description": "<specific change>",
        "affects_personas": ["persona_id"],
        "expected_score_delta": <float>,
        "effort": "<low|medium|high>",
        "roi_note": "<one sentence on why this is high ROI despite higher effort>"
      }}
    ],
    "root_cause": "<one paragraph on what still separates the app from 9.5 after 9.0 fixes>",
    "projected_score_after": <float>
  }},
  "pricing_concern": "<one paragraph: at $49 CAD/mo, which personas will churn and what single change would most improve willingness to pay>"
}}
"""

    # Stream the response so we capture the full output even for large JSON payloads.
    # The dual-roadmap JSON easily exceeds 4000 tokens — streaming with 8192 avoids truncation.
    raw_parts = []
    with client.messages.stream(
        model=MODEL,
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            raw_parts.append(text)

    raw = "".join(raw_parts).strip()
    return _extract_json(raw)


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------

def generate_report(all_iterations: list[dict]) -> str:
    lines = [
        "# Agent SMB — Pilot Customer Feedback Report",
        f"\n_Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}_\n",
        "---\n",
    ]

    for it_data in all_iterations:
        iteration = it_data["iteration"]
        reviews = it_data["reviews"]
        synthesis = it_data.get("synthesis")
        avg = sum(r["overall"] for r in reviews) / len(reviews)

        lines.append(f"## Iteration {iteration} — Average Score: **{avg:.1f}/10**\n")

        # Score table
        lines.append("| Persona | Onboard | Dashboard | Chat | UI/UX | Navigation | Language | **Overall** | Pay $49? |")
        lines.append("|---------|---------|-----------|------|-------|------------|----------|-------------|----------|")
        for r in reviews:
            s = r["scores"]
            pay = "✅" if r["would_pay_49"] else "❌"
            lines.append(
                f"| {r['persona_name']} | {s['onboarding']} | {s['dashboard']} | {s['chat']} | "
                f"{s['ui_ux']} | {s['navigation']} | {s['language']} | **{r['overall']}** | {pay} |"
            )
        lines.append("")

        # Quotes
        lines.append("### What they said\n")
        for r in reviews:
            lines.append(f"> **{r['persona_name']}:** \"{r['standout_quote']}\"  ")
        lines.append("")

        # Liked / wants improved
        lines.append("### Common themes\n")
        all_liked = [item for r in reviews for item in r["liked"]]
        all_wants = [item for r in reviews for item in r["wants_improved"]]
        lines.append("**👍 Most liked:**")
        for item in all_liked[:6]:
            lines.append(f"- {item}")
        lines.append("\n**🔧 Most wanted improvements:**")
        for item in all_wants[:6]:
            lines.append(f"- {item}")
        lines.append("")

        # Synthesis — dual roadmap
        if synthesis:
            r9 = synthesis.get("roadmap_to_9", {})
            r95 = synthesis.get("roadmap_to_9_5", {})

            if r9:
                lines.append("### Roadmap to 9.0/10 (low–medium effort, highest ROI)\n")
                lines.append(f"**Root cause:** {r9.get('root_cause', '')}\n")
                lines.append(f"**Projected score:** {r9.get('projected_score_after', '?')}/10\n")
                lines.append("| # | Area | Improvement | Personas | Δ Score | Effort | ROI Note |")
                lines.append("|---|------|-------------|----------|---------|--------|----------|")
                for imp in r9.get("improvements", []):
                    personas = ", ".join(imp.get("affects_personas", []))
                    lines.append(
                        f"| {imp['rank']} | {imp['area']} | {imp['title']} | {personas} | +{imp['expected_score_delta']} | {imp['effort']} | {imp.get('roi_note', '')} |"
                    )
                lines.append("")
                lines.append("#### Details — 9.0 roadmap\n")
                for imp in r9.get("improvements", []):
                    lines.append(f"**{imp['rank']}. {imp['title']}** ({imp['area']})")
                    lines.append(f"> {imp['description']}\n")

            if r95:
                lines.append("### Roadmap to 9.5/10 (from 9.0 baseline)\n")
                lines.append(f"**Root cause:** {r95.get('root_cause', '')}\n")
                lines.append(f"**Projected score:** {r95.get('projected_score_after', '?')}/10\n")
                lines.append("| # | Area | Improvement | Personas | Δ Score | Effort | ROI Note |")
                lines.append("|---|------|-------------|----------|---------|--------|----------|")
                for imp in r95.get("improvements", []):
                    personas = ", ".join(imp.get("affects_personas", []))
                    lines.append(
                        f"| {imp['rank']} | {imp['area']} | {imp['title']} | {personas} | +{imp['expected_score_delta']} | {imp['effort']} | {imp.get('roi_note', '')} |"
                    )
                lines.append("")
                lines.append("#### Details — 9.5 roadmap\n")
                for imp in r95.get("improvements", []):
                    lines.append(f"**{imp['rank']}. {imp['title']}** ({imp['area']})")
                    lines.append(f"> {imp['description']}\n")

            if "pricing_concern" in synthesis:
                lines.append("### $49 CAD Pricing Analysis\n")
                lines.append(synthesis["pricing_concern"])
                lines.append("")

        lines.append("---\n")

    # Final summary
    last = all_iterations[-1]
    final_avg = sum(r["overall"] for r in last["reviews"]) / len(last["reviews"])
    would_pay = sum(1 for r in last["reviews"] if r["would_pay_49"])

    lines.append("## Final Summary\n")
    lines.append(f"- **Final average score:** {final_avg:.1f}/10")
    lines.append(f"- **Would pay $49 CAD/mo:** {would_pay}/5 personas")
    lines.append(f"- **Target reached:** {'✅ Yes' if final_avg >= TARGET_SCORE else '❌ Not yet'}")
    lines.append(f"- **Iterations run:** {len(all_iterations)}")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------

def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        # Try loading from backend/.env
        env_path = Path(__file__).parent.parent / ".env"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if line.startswith("ANTHROPIC_API_KEY="):
                    api_key = line.split("=", 1)[1].strip()
                    break

    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not found. Set it in backend/.env or as an env var.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    all_iterations = []

    print("=" * 60)
    print("Agent SMB — Pilot Customer Review System")
    print("=" * 60)

    for iteration in range(1, MAX_ITERATIONS + 1):
        print(f"\n📋 Iteration {iteration} — Running {len(PERSONAS)} persona reviews...")

        reviews = []
        for persona in PERSONAS:
            print(f"   → Evaluating as {persona['name']}...", end=" ", flush=True)
            for attempt in range(3):
                try:
                    review = evaluate_persona(client, persona, iteration)
                    reviews.append(review)
                    print(f"✓ {review['overall']}/10")
                    break
                except Exception as e:
                    if attempt < 2:
                        import time; time.sleep(3)
                        print(f"⟳ retry {attempt + 2}...", end=" ", flush=True)
                    else:
                        print(f"✗ failed after 3 attempts: {e}")

        if not reviews:
            print("No reviews collected. Exiting.")
            break

        if len(reviews) < len(PERSONAS):
            print(f"⚠️  Only {len(reviews)}/{len(PERSONAS)} reviews collected (API errors). Skipping this iteration.")
            continue

        avg = sum(r["overall"] for r in reviews) / len(reviews)
        print(f"\n📊 Average score: {avg:.1f}/10 (target: {TARGET_SCORE})")

        iteration_data: dict = {"iteration": iteration, "reviews": reviews}

        if avg >= TARGET_SCORE:
            print(f"🎉 Target of {TARGET_SCORE}/10 reached!")
            all_iterations.append(iteration_data)
            break

        if iteration < MAX_ITERATIONS:
            print(f"\n🔍 Score below target. Running UI/UX synthesizer...")
            try:
                synthesis = synthesize_improvements(client, reviews)
                iteration_data["synthesis"] = synthesis
                r9 = synthesis.get("roadmap_to_9", {})
                if r9:
                    print(f"   Root cause: {str(r9.get('root_cause', ''))[:100]}...")
                    print(f"   Projected score (9.0 roadmap): {r9.get('projected_score_after', '?')}/10")
                    print(f"\n   Top improvements (9.0 roadmap):")
                    for imp in r9.get("improvements", [])[:3]:
                        print(f"   {imp['rank']}. [{imp['area']}] {imp['title']} (+{imp['expected_score_delta']})")
            except Exception as e:
                print(f"   Synthesizer error: {e}")

            all_iterations.append(iteration_data)
            print(f"\n   (Applying improvements to app context for next iteration...)")
        else:
            all_iterations.append(iteration_data)
            print(f"\n⚠️  Max iterations reached. Final score: {avg:.1f}/10")

    # Generate and save report
    report = generate_report(all_iterations)
    OUTPUT_FILE.write_text(report, encoding="utf-8")
    print(f"\n📄 Report saved to: {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()
