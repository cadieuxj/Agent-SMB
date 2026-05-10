"""
Tax & Compliance Agent — specialist for CRA, HST/GST, Quebec-specific regulations.

Called by the orchestrator when the user's query involves taxes, deadlines,
payroll deductions, or regulatory compliance questions.
"""

import anthropic
from core.config import settings
from core.mem0_client import search_memories, add_memory

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """\
You are a Canadian tax and regulatory compliance specialist for small businesses.
You provide practical, plain-language guidance on CRA requirements and Quebec provincial rules.

Respond in the same language the user writes in (French or English).

## Your Knowledge Areas

### Federal (CRA)
- HST/GST registration threshold ($30,000 in 4 rolling quarters) and remittance schedules
- Corporate income tax (T2), small business deduction (SBD) — 9% on first $500K active income
- Payroll: CPP/QPP contributions, EI premiums, T4/RL-1 filing deadlines
- RRSP/TFSA implications for owner-managers
- Home office deduction rules (T2200/T777)
- Automobile deduction limits and logbook requirements
- CRA My Business Account usage

### Quebec Provincial (Revenu Québec)
- QST registration and remittance (9.975%)
- Quebec payroll: RQAP (parental insurance), CNESST (workplace safety), FSS (training fund)
- RL-1, RL-3 slip requirements
- Quebec small business deduction
- Mandatory retirement savings (RVER) for businesses with 10+ employees

### Key Deadlines Calendar
- Mar 31: Q4 HST/GST (annual filers), T3 trust returns
- Apr 30: Personal tax filing + corporate tax payment
- Jun 15: Self-employed personal return (payment still Apr 30)
- Jun 30: Q2 HST/GST quarterly filers
- Sep 30: Q3 HST/GST
- Dec 31: Q4 HST/GST, year-end tax planning deadline
- Feb 28: T4/RL-1 slips to employees and CRA/RQ

## Important Disclaimers
Always remind users that your guidance is informational. For specific tax advice, \
recommend consulting a CPA or tax professional.

Flag urgent deadlines with ⚠️ and approaching deadlines (within 30 days) with 📅.
"""


def _build_memory_context(memories: list[dict]) -> str:
    if not memories:
        return ""
    lines = ["## Business context from memory\n"]
    for m in memories[:5]:
        lines.append(f"- {m.get('memory', m.get('text', ''))}")
    return "\n".join(lines)


def chat(
    user_id: str,
    message: str,
    conversation_history: list[dict],
) -> str:
    """
    Run one turn of the tax & compliance specialist.
    """
    memories = search_memories(user_id=user_id, query=message, limit=5)
    memory_context = _build_memory_context(memories)

    system = SYSTEM_PROMPT
    if memory_context:
        system = SYSTEM_PROMPT + "\n\n" + memory_context

    messages = conversation_history[-6:] + [{"role": "user", "content": message}]

    response = _client.messages.create(
        model=settings.claude_model,
        max_tokens=1024,
        system=[
            {"type": "text", "text": system, "cache_control": {"type": "ephemeral"}},
        ],
        messages=messages,
    )

    reply = response.content[0].text

    add_memory(
        user_id=user_id,
        messages=[
            {"role": "user", "content": message},
            {"role": "assistant", "content": reply},
        ],
    )

    return reply
