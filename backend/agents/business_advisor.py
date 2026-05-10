"""
Business Advisor Agent — primary memory-aware conversational agent.

Injects relevant Mem0 memories into the system prompt so the agent
can reference past decisions, recurring problems, and stated goals.
After every exchange, memories are persisted back to Mem0.
"""

import anthropic
from datetime import date
from core.config import settings
from core.mem0_client import add_memory, search_memories
from services.tax_calendar import get_upcoming_deadlines, format_for_prompt

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """\
You are a bilingual (French/English) AI business advisor for Canadian small and medium businesses.
You specialize in helping SMB owners in Quebec and across Canada manage their day-to-day business \
challenges: cash flow, staffing, suppliers, regulatory compliance, and growth planning.

Respond in the same language the user writes in (French or English).

Your personality: direct, practical, warm. Like a trusted accountant who also understands operations.
Never give generic advice — always tie guidance to the specific details you know about this business.

## Canadian Context You Must Apply
- CRA tax calendar: quarterly HST/GST reminders (Mar 31, Jun 30, Sep 30, Dec 31), T4 deadline Feb 28
- Quebec specifics: Quebec Consumer Protection Act, CCQ (Civil Code), Quebec payroll deductions (RQAP, CNESST)
- Federal payroll: CPP/QPP contributions, EI premiums, T4/RL-1 slips
- Provincial minimum wage differences (Quebec: $15.75/hr as of May 2024)

## How to Use Memories
At the start of your response, silently consider the memories provided. Reference them naturally:
"Last month you mentioned margins were tight — has the supplier situation improved?"
"You told me you were hiring a second employee — how did that go?"

Never say "According to my records" — speak as a partner who genuinely remembers.

## Format
- Keep responses concise: 3–5 short paragraphs max
- Use bullet points for action items
- Flag urgent compliance issues with ⚠️
- End with one concrete next step
"""


def _build_memory_context(memories: list[dict]) -> str:
    if not memories:
        return ""
    lines = ["## What I remember about your business\n"]
    for m in memories[:8]:
        lines.append(f"- {m.get('memory', m.get('text', ''))}")
    return "\n".join(lines)


def chat(
    user_id: str,
    message: str,
    conversation_history: list[dict],
    language: str = "fr",
    province: str = "QC",
) -> str:
    """
    Run one turn of the business advisor.

    Args:
        user_id: Supabase user UUID
        message: current user message
        conversation_history: prior messages [{role, content}]
        language: "fr" or "en" hint (agent auto-detects from message)

    Returns:
        Assistant reply string
    """
    memories = search_memories(user_id=user_id, query=message, limit=8)
    memory_context = _build_memory_context(memories)

    deadlines = get_upcoming_deadlines(today=date.today(), horizon_days=45, province=province)
    deadline_context = format_for_prompt(deadlines, language=language)

    system_with_memory = SYSTEM_PROMPT
    extras = "\n\n".join(filter(None, [memory_context, deadline_context]))
    if extras:
        system_with_memory = SYSTEM_PROMPT + "\n\n" + extras

    messages = conversation_history[-10:] + [{"role": "user", "content": message}]

    response = _client.messages.create(
        model=settings.claude_model,
        max_tokens=1024,
        system=[
            # Cache the static system prompt — saves tokens on repeated calls
            {"type": "text", "text": system_with_memory, "cache_control": {"type": "ephemeral"}},
        ],
        messages=messages,
    )

    return response.content[0].text
