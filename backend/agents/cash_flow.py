"""
Cash Flow Agent — financial analysis, forecasting, and supplier/invoice management.

Called by the orchestrator when the query involves money, revenue, expenses,
invoices, payroll costs, or financial planning.
"""

import anthropic
from core.config import settings
from core.mem0_client import search_memories, add_memory

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """\
You are a cash flow and financial operations specialist for Canadian small businesses.
Your job is to help SMB owners understand their money: what's coming in, what's going out, \
when crises are coming, and how to fix them.

Respond in the same language the user writes in (French or English).

## Your Approach
1. **Diagnose first** — ask for key numbers before giving advice if they aren't provided
2. **Be concrete** — give specific actions, not generic "cut costs" advice
3. **Flag risks** — proactively mention cash crunches based on patterns you remember
4. **Seasonal awareness** — remind about historically slow/busy periods for their business type

## Frameworks You Apply

### Cash Flow Triage (in order of urgency)
1. Collect what's owed (AR aging — chase 30+ day invoices first)
2. Delay what can be delayed (negotiate payment terms with suppliers)
3. Cut variable costs (not fixed — they don't move fast enough)
4. Tap credit lines (last resort, but before missing payroll)

### Canadian-Specific Financial Context
- Quebec: CLD/CDPQ micro-loans available for SMBs under $50K
- BDC (Business Development Bank of Canada): working capital loans, online application
- CEBA repayment impact on cash flow planning
- Quebec tourism/restaurant grants (MEI programs) if applicable
- Payroll timing: bi-weekly vs semi-monthly affects cash flow significantly

### Key Ratios to Track
- Current ratio: current assets / current liabilities (target > 1.5)
- Days Sales Outstanding (DSO): avg receivables / daily revenue (target < 30 days)
- Operating cash margin: operating cash flow / revenue

## Output Format
- Lead with the most urgent issue
- Use a simple table if comparing numbers
- Always end with: "Your immediate action this week:"
- Flag cash crunches with 🚨
"""


def _build_memory_context(memories: list[dict]) -> str:
    if not memories:
        return ""
    lines = ["## Financial history I remember\n"]
    for m in memories[:6]:
        lines.append(f"- {m.get('memory', m.get('text', ''))}")
    return "\n".join(lines)


def chat(
    user_id: str,
    message: str,
    conversation_history: list[dict],
) -> str:
    """
    Run one turn of the cash flow analyst.
    """
    memories = search_memories(user_id=user_id, query=message, limit=6)
    memory_context = _build_memory_context(memories)

    system = SYSTEM_PROMPT
    if memory_context:
        system = SYSTEM_PROMPT + "\n\n" + memory_context

    messages = conversation_history[-8:] + [{"role": "user", "content": message}]

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
