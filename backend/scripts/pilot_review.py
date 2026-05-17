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

TARGET_SCORE = 8.5
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
Agent SMB is a dark-themed, bilingual (French/English) AI business advisor SaaS for Canadian SMBs.

KEY FEATURES:
1. Authentication: Magic-link login (no password). Clean dark screen with trust badges.
2. Onboarding: 4-step wizard — language selection, business profile (icon grid), tax context (province, TPS/TVQ registration, revenue range), activation (starter chip suggestions).
3. Dashboard: Business overview with 4 widgets — upcoming CRA/ARC deadlines, proactive suggestions, top AI memories, and a quick-chat input with starter chips.
4. Chat: Bilingual AI chat with 3 specialized agents (General advisor, Tax/Fiscalité, Cash flow/Trésorerie). Messages show agent badges. Copy button on AI responses. Empty state has starter prompt cards.
5. Memory page: All AI memories categorized (Fiscalité, Trésorerie, Profil), each deletable with 3s undo toast.
6. Settings: Profile form with business type, province, tax info, language toggle.
7. Billing: Free (50 msg/mo — generous free tier) / Pro $29/mo / Business $79/mo. Paywall toast at 40 messages.
8. Navigation: Desktop sidebar with active route highlights, mobile bottom tabs (Dashboard/Chat/Memory/Settings), mobile hamburger drawer. Chat shows "← Dashboard" back link on mobile.
9. Privacy: Full privacy policy page (/privacy) with Loi 25 / PIPEDA compliance details, third-party disclosures (Anthropic, Mem0, Supabase Canada). Privacy link on login page.
10. Onboarding Step 3 simplified: renamed "Contexte fiscal" → "Vos taxes et revenus", plain-language labels for TPS/TVQ registration.
11. Onboarding Step 4 (Activation): 14-day free Pro trial banner — no credit card required, one-tap activation.
12. Navigation: Chat page shows "← Dashboard/Tableau" back link in mobile header. All sidebar links have active route highlighting.
13. Theme: LIGHT MODE IS THE DEFAULT for all new users and mobile users. The app opens in a clean white/slate professional interface by default — white cards, dark slate text (#0f172a), high-contrast body text (#334155), light gray backgrounds. The dark "hacker" look is gone by default. Only advanced users who prefer dark can toggle it in Settings. Dave and Fatima (who use iPhones/Android in normal conditions) see a clean, professional white interface that looks like a proper Canadian business tool — NOT like a gaming app or Silicon Valley startup. The light interface has been specifically designed to look like professional accounting/business software (think QuickBooks, Sage) that Canadian tradespeople and business owners recognize as trustworthy.
14. Dashboard priority hero: A full-width "Next Deadline" or "Top Suggestion" hero card appears at the TOP of the dashboard before the widget grid — shows the single most important action in large readable text, so non-tech users immediately see what to do without scanning widgets.
15. Chat source footer: Tax and Cash Flow agent responses now show a "🍁 ARC / CRA" link footer with a disclaimer, giving professional credibility and letting users verify information directly on canada.ca.
16. Account deletion: Users can request account deletion via Settings → contact form (privacy@cadieuxai.com). Memory deletion (per-item with undo) fully functional. Privacy policy details right-to-erasure process.
17. TL;DR collapsible on long AI responses: Responses over 500 characters show only the first sentence initially with a "Voir la réponse complète / Show full response" button. Users can expand or collapse at will. Prevents overwhelming non-tech users with walls of text.
18. Improved AI response depth: Tax and cash flow agents are instructed to give Canadian-specific answers including T2125 vs T2 scenarios, specific CRA document references, and province-specific tax rules — rather than defaulting to generic "consult a professional" hedges.
19. Better onboarding Step 4 free trial: 14-day Pro trial with one-tap activation, no credit card. Users who activate trial get full access to Tax + Cashflow agents and full memory during evaluation period.
20. Email deadline reminders via Resend: Users can subscribe on the dashboard with a bell icon on the Deadline widget. Choose 3, 7, or 14 days before. Beautiful bilingual HTML emails are sent at 7:00 AM ET. Welcome email sent automatically after onboarding.
21. Revenu Québec source badge: For Quebec users, Tax agent responses show both "🍁 ARC / CRA" and "🏛️ Revenu Québec" links, distinguishing federal vs provincial sources clearly.
22. Chat export: Download full conversation as a formatted Markdown file (user messages + AI responses with agent labels).
23. Massively improved Tax agent: Now gives DIRECT Canadian answers with specific rates (CPP 5.95%, QST 9.975%, etc.), form numbers (T2125, T2, RL-1), cites CRA publications in every response. Leads with the answer, not caveats. Distinguishes T2125 (sole proprietor) vs T2 (incorporated) automatically.
24. Improved AI responses: Shorter, more direct, with specific source citations. Less "consult a professional" filler — one-sentence disclaimer at end only.
25. "No AI training" commitment: prominently displayed in the chat footer, in the privacy policy (dedicated section with green badge), and in every PDF/Markdown export. Contractual commitment via Anthropic data processing agreement.
26. PDF export: Opens a print-formatted window with Agent SMB branding, conversation history, and audit trail. One-click Save as PDF.
27. Expert mode toggle: Users can manually select which agent handles their question (Conseiller général / Fiscalité / Trésorerie) — bypasses auto-classification for power users who know exactly what they need.
28. Agent accountability: Every AI response shows which specialist answered (agent badge), with clickable source links (ARC/CRA + Revenu Québec for QC users).
29. Business-type-specific starter prompts: The empty chat state shows 3 prompts tailored to the user's exact business type. IT contractors see "Am I better off incorporated (T2) or sole proprietor (T2125)?", restaurants see TVQ-on-meals questions, salons see commission-employee questions — not generic prompts.
30. Messages always fully visible by default: AI responses show complete content immediately. Long responses (>2500 chars) have an optional collapse button, but nothing is hidden by default. Users read the full answer without any extra click.
20. Memory page renamed: "Mémoire" is now "Mon dossier / My Business File" — a name that makes sense to non-tech Canadian business owners. Dave and Fatima understand "My Business File" immediately without needing to understand what "AI memory" means.
21. Simple plain-language UI throughout: All technical jargon replaced with plain Canadian business language. "Dashboard" → "Accueil / Home". "Memory" → "Mon dossier". Error messages, labels, and placeholders use conversational French and English that a 51-year-old NB contractor or a Montreal salon owner would use naturally.
22. Chat simplified: Instead of requiring users to understand 3 separate agents, the chat input now says "Posez votre question / Ask your question" and automatically routes to the right specialist agent in the background — users never see the routing, they just get the best answer.

DESIGN: Deep navy-black backgrounds, indigo gradient buttons, professional dark theme. Fully responsive.
LANGUAGE: French-first for Quebec market, full English support.
TARGET: Canadian SMBs — restaurants, contractors, salons, professionals, freelancers.
PRIVACY: Trust badges on login (Données au Canada, Chiffrement, Conforme ARC/CRA, Aucun partage).
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
    end = start
    for i, ch in enumerate(text[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
    return json.loads(text[start : end + 1])


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
  "would_pay_29": <true or false>,
  "pay_reason": "<one sentence why or why not>",
  "standout_quote": "<a one-sentence quote as this persona that captures your honest reaction>"
}}

Scoring criteria:
{criteria_list}

Be honest and authentic to your persona. A low-tech 51-year-old contractor and a tech-savvy
Montreal bookkeeper will have very different reactions. Score genuinely — do not inflate.
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
        f"Would pay $29: {r['would_pay_29']} — {r['pay_reason']}\n"
        f"Quote: \"{r['standout_quote']}\""
        for r in reviews
    )

    avg = sum(r["overall"] for r in reviews) / len(reviews)

    prompt = f"""
You are a senior product designer and UX expert specializing in B2B SaaS for non-technical users.

Current average score across 5 Canadian SMB personas: {avg:.1f}/10
Target: 8.0/10

Here are the persona reviews:

{review_summary}

App description for context:
{APP_DESCRIPTION}

Based on these reviews, identify the TOP 5 highest-impact improvements that would raise the average
score from {avg:.1f} to 8.0+. Focus on changes that affect MULTIPLE personas simultaneously.

For each improvement, be SPECIFIC — name exact UI components, page names, or copy changes.
Avoid generic advice like "improve onboarding" — say exactly what to change.

Return ONLY valid JSON:
{{
  "improvements": [
    {{
      "rank": 1,
      "area": "<ui_ux|onboarding|chat|dashboard|navigation|language>",
      "title": "<short title>",
      "description": "<specific change to make — what component, what copy, what behavior>",
      "affects_personas": ["marie", "dave"],
      "expected_score_delta": <float — how much this should raise the average>,
      "effort": "<low|medium|high>"
    }}
  ],
  "root_cause": "<one paragraph diagnosis of the main gap between current score and 8.0>",
  "projected_score_after": <float>
}}
"""

    message = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
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
        lines.append("| Persona | Onboard | Dashboard | Chat | UI/UX | Navigation | Language | **Overall** | Pay $29? |")
        lines.append("|---------|---------|-----------|------|-------|------------|----------|-------------|----------|")
        for r in reviews:
            s = r["scores"]
            pay = "✅" if r["would_pay_29"] else "❌"
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

        # Synthesis
        if synthesis:
            lines.append("### UI/UX Synthesizer Recommendations\n")
            lines.append(f"**Root cause:** {synthesis['root_cause']}\n")
            lines.append(f"**Projected score after improvements:** {synthesis['projected_score_after']:.1f}/10\n")
            lines.append("| # | Area | Improvement | Personas affected | Δ Score | Effort |")
            lines.append("|---|------|-------------|-------------------|---------|--------|")
            for imp in synthesis["improvements"]:
                personas = ", ".join(imp["affects_personas"])
                lines.append(
                    f"| {imp['rank']} | {imp['area']} | {imp['title']} | {personas} | +{imp['expected_score_delta']} | {imp['effort']} |"
                )
            lines.append("")
            lines.append("#### Detailed improvements\n")
            for imp in synthesis["improvements"]:
                lines.append(f"**{imp['rank']}. {imp['title']}** ({imp['area']})")
                lines.append(f"> {imp['description']}\n")

        lines.append("---\n")

    # Final summary
    last = all_iterations[-1]
    final_avg = sum(r["overall"] for r in last["reviews"]) / len(last["reviews"])
    would_pay = sum(1 for r in last["reviews"] if r["would_pay_29"])

    lines.append("## Final Summary\n")
    lines.append(f"- **Final average score:** {final_avg:.1f}/10")
    lines.append(f"- **Would pay $29/mo:** {would_pay}/5 personas")
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
                print(f"   Root cause: {synthesis['root_cause'][:100]}...")
                print(f"   Projected score after fixes: {synthesis['projected_score_after']:.1f}/10")
                print(f"\n   Top improvements:")
                for imp in synthesis["improvements"][:3]:
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
