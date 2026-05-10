"""
Orchestrator Agent — classifies intent and routes to the right specialist.

Uses a lightweight Claude call with a structured tool to classify the message,
then delegates to: business_advisor | tax_compliance | cash_flow.

Intent routing:
  - "tax"          → tax_compliance agent
  - "cash_flow"    → cash_flow agent
  - "general"      → business_advisor agent (default)
"""

import json
import anthropic
from core.config import settings
from agents import business_advisor, tax_compliance, cash_flow

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

_CLASSIFY_TOOL = {
    "name": "classify_intent",
    "description": "Classify the user's message into one of the defined intents.",
    "input_schema": {
        "type": "object",
        "properties": {
            "intent": {
                "type": "string",
                "enum": ["tax", "cash_flow", "general"],
                "description": (
                    "tax: HST/GST, payroll deductions, CRA deadlines, Quebec tax rules. "
                    "cash_flow: invoices, revenue, expenses, suppliers, payroll costs, loans. "
                    "general: everything else — strategy, hiring, operations, suppliers (non-payment), growth."
                ),
            },
            "confidence": {
                "type": "number",
                "description": "0.0–1.0 confidence in the classification",
            },
        },
        "required": ["intent", "confidence"],
    },
}

_CLASSIFY_SYSTEM = (
    "You classify SMB owner messages into one of three intents: tax, cash_flow, or general. "
    "Always call the classify_intent tool. Never respond in text."
)


def _classify(message: str) -> str:
    """Returns 'tax' | 'cash_flow' | 'general'."""
    try:
        response = _client.messages.create(
            model=settings.claude_haiku_model,
            max_tokens=64,
            system=_CLASSIFY_SYSTEM,
            tools=[_CLASSIFY_TOOL],
            tool_choice={"type": "any"},
            messages=[{"role": "user", "content": message}],
        )
        for block in response.content:
            if block.type == "tool_use" and block.name == "classify_intent":
                return block.input.get("intent", "general")
    except Exception:
        pass
    return "general"


def route(
    user_id: str,
    message: str,
    conversation_history: list[dict],
    language: str = "fr",
) -> dict:
    """
    Classify the user message and route to the appropriate agent.

    Returns:
        {
            "reply": str,
            "agent": str,   # which agent handled it
            "intent": str,  # classified intent
        }
    """
    intent = _classify(message)

    if intent == "tax":
        reply = tax_compliance.chat(
            user_id=user_id,
            message=message,
            conversation_history=conversation_history,
        )
    elif intent == "cash_flow":
        reply = cash_flow.chat(
            user_id=user_id,
            message=message,
            conversation_history=conversation_history,
        )
    else:
        reply = business_advisor.chat(
            user_id=user_id,
            message=message,
            conversation_history=conversation_history,
            language=language,
        )

    return {"reply": reply, "agent": intent, "intent": intent}
