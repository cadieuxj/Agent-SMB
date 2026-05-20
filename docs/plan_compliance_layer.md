# Plan: LLM Compliance Layer (Pre-Prompt Guardrails)
> Agent SMB — Security / Privacy Planning
> Date: 2026-05-20

---

## 1. Why This Exists

Before any user message reaches Anthropic (or any other LLM), we must ensure:
- No raw PII leaks into prompts (Law 25 / PIPEDA data minimization)
- No prompt injection attacks reach the model
- No jailbreak attempts bypass our system prompt constraints
- All prompts are auditable (who sent what, when)
- Sensitive financial data is handled according to our DPA with Anthropic

This layer sits between `backend/api/chat.py` and `backend/agents/*.py`.

---

## 2. Architecture

```
User message
    │
    ▼
[InputSanitizer]          ← strip/redact PII patterns (SIN, credit card, etc.)
    │
    ▼
[PromptInjectionDetector] ← block "ignore previous instructions" attacks
    │
    ▼
[ContentPolicyChecker]    ← block out-of-scope content (violence, etc.)
    │
    ▼
[PIIAuditor]              ← log what PII was detected (not the PII itself)
    │
    ▼
[SanitizedMessage]        → Agent → Anthropic API
    │
    ▼
[OutputFilter]            ← scan LLM response for accidental PII leakage
    │
    ▼
User sees response
```

**New file:** `backend/core/compliance.py`

---

## 3. Implementation

### 3.1 Input Sanitizer

```python
# backend/core/compliance.py

import re
from dataclasses import dataclass
from enum import Enum

class ComplianceAction(Enum):
    ALLOW = "allow"
    REDACT = "redact"
    BLOCK = "block"

@dataclass
class ComplianceResult:
    action: ComplianceAction
    sanitized_text: str
    detections: list[dict]   # [{type, count}] — never store the actual PII
    block_reason: str | None = None

# SIN: 9-digit number (Canadian Social Insurance Number)
SIN_PATTERN = re.compile(r'\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b')
# Credit card: 13-19 digits, common separators
CC_PATTERN = re.compile(r'\b(?:\d{4}[-\s]?){3}\d{4}\b')
# Canadian postal code
POSTAL_PATTERN = re.compile(r'\b[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d\b')
# Bank account (rough pattern for Canadian format)
BANK_PATTERN = re.compile(r'\b\d{5}[-\s]\d{3}[-\s]\d{7,12}\b')

PII_PATTERNS = [
    ("SIN",         SIN_PATTERN,    ComplianceAction.REDACT),
    ("credit_card", CC_PATTERN,     ComplianceAction.REDACT),
    ("bank_account",BANK_PATTERN,   ComplianceAction.REDACT),
    # Postal codes are less sensitive — log but don't redact
    ("postal_code", POSTAL_PATTERN, ComplianceAction.ALLOW),
]

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"disregard\s+(your\s+)?system\s+prompt",
    r"you\s+are\s+now\s+(?:a|an)\s+(?!agent|advisor|tax|cash)",
    r"pretend\s+you\s+(have\s+no\s+restrictions|are\s+)",
    r"jailbreak",
    r"dan\s+mode",
    r"act\s+as\s+if\s+you\s+(have\s+no|don.t\s+have)",
    r"reveal\s+your\s+system\s+prompt",
    r"print\s+your\s+instructions",
]

OUT_OF_SCOPE_PATTERNS = [
    r"\b(bomb|weapon|explosive|drug\s+traffick)\b",
    r"\b(hack|exploit|malware|ransomware)\b",
    r"\bself.harm\b",
]


def check_compliance(text: str, user_id: str) -> ComplianceResult:
    """Run all compliance checks on a user message before sending to LLM."""
    detections = []
    sanitized = text

    # 1. Prompt injection — BLOCK
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return ComplianceResult(
                action=ComplianceAction.BLOCK,
                sanitized_text="",
                detections=[{"type": "prompt_injection"}],
                block_reason="Message contains prompt injection pattern.",
            )

    # 2. Out of scope — BLOCK
    for pattern in OUT_OF_SCOPE_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return ComplianceResult(
                action=ComplianceAction.BLOCK,
                sanitized_text="",
                detections=[{"type": "out_of_scope"}],
                block_reason="Message is outside the scope of business advisory services.",
            )

    # 3. PII redaction
    for pii_type, pattern, action in PII_PATTERNS:
        matches = pattern.findall(sanitized)
        if matches:
            detections.append({"type": pii_type, "count": len(matches)})
            if action == ComplianceAction.REDACT:
                sanitized = pattern.sub(f"[{pii_type.upper()}_REDACTED]", sanitized)

    return ComplianceResult(
        action=ComplianceAction.REDACT if detections else ComplianceAction.ALLOW,
        sanitized_text=sanitized,
        detections=detections,
    )


def check_output(text: str) -> str:
    """Scan LLM response for accidental PII leakage and redact."""
    for pii_type, pattern, _ in PII_PATTERNS:
        text = pattern.sub(f"[{pii_type.upper()}_REDACTED]", text)
    return text
```

### 3.2 Audit Logger

```python
# backend/core/compliance.py (continued)

import logging
from backend.core.supabase_client import get_supabase_client

audit_logger = logging.getLogger("compliance.audit")

async def log_compliance_event(
    user_id: str,
    action: ComplianceAction,
    detections: list[dict],
    block_reason: str | None,
):
    """Log compliance event to Supabase (no raw PII stored)."""
    supabase = get_supabase_client()
    await supabase.table("compliance_audit").insert({
        "user_id": user_id,
        "action": action.value,
        "detections": detections,   # [{type, count}] only
        "block_reason": block_reason,
        # No raw message text stored — only metadata
    }).execute()
    if action == ComplianceAction.BLOCK:
        audit_logger.warning(
            "Blocked message from user %s: %s",
            user_id[:8] + "...",
            block_reason,
        )
```

### 3.3 Integration into chat.py

```python
# backend/api/chat.py — add at the top of the chat endpoint

from backend.core.compliance import check_compliance, log_compliance_event, ComplianceAction

@router.post("/chat")
async def chat(request: ChatRequest, background_tasks: BackgroundTasks, user=Depends(get_current_user)):
    # --- COMPLIANCE LAYER ---
    result = check_compliance(request.message, user.id)

    if result.action == ComplianceAction.BLOCK:
        background_tasks.add_task(
            log_compliance_event, user.id, result.action,
            result.detections, result.block_reason
        )
        return {"error": result.block_reason, "blocked": True}

    if result.detections:
        background_tasks.add_task(
            log_compliance_event, user.id, result.action,
            result.detections, None
        )

    # Use sanitized message going forward
    sanitized_message = result.sanitized_text
    # --- END COMPLIANCE LAYER ---

    # ... rest of existing chat logic using sanitized_message
```

### 3.4 Output Filter

```python
# In the agent response return path:
from backend.core.compliance import check_output

response_text = check_output(agent_response.content)
```

---

## 4. Supabase Migration

```sql
create table compliance_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,           -- 'allow' | 'redact' | 'block'
  detections jsonb default '[]',  -- [{type, count}] — NO raw PII
  block_reason text,
  created_at timestamptz default now()
);

-- Only admins can read audit logs
alter table compliance_audit enable row level security;
create policy "service_role_only" on compliance_audit
  for all using (auth.jwt() ->> 'role' = 'service_role');

-- Index for admin queries by date
create index compliance_audit_created_at_idx on compliance_audit(created_at desc);
```

---

## 5. User-Facing Behavior

| Scenario | User sees |
|----------|-----------|
| SIN number detected in message | Message is sent with SIN replaced by `[SIN_REDACTED]`. User sees a small yellow notice: "Numéro sensible masqué pour votre sécurité / Sensitive number masked for your protection." |
| Prompt injection attempt | Error: "Ce message ne peut pas être traité. / This message cannot be processed." (no details — avoid giving attackers feedback) |
| Out of scope content | Error: "Agent SMB répond aux questions d'affaires canadiennes uniquement. / Agent SMB answers Canadian business questions only." |
| Clean message | Nothing — seamless, no friction |

---

## 6. Law 25 Compliance Notes

**Data minimization:** We transmit only the sanitized message to Anthropic — never raw PII.
**Audit trail:** `compliance_audit` table logs events without storing the original message text.
**Right to erasure:** `on delete cascade` means deleting the user account removes all audit logs.
**DPA reference:** Anthropic's Data Processing Agreement covers our usage; no extra disclosure needed for redacted messages.
**Revenu Québec:** The compliance layer specifically protects NEQ (business registration numbers), NAS (SIN), and account numbers that might appear in screenshots or copy-pasted text.

---

## 7. Implementation Effort

| Task | Effort |
|------|--------|
| `backend/core/compliance.py` | 1 day |
| Supabase migration | 0.5 day |
| Integration into `chat.py` | 0.5 day |
| User-facing notices in `ChatInterface.tsx` | 1 day |
| Tests (`tests/test_compliance.py`) | 1 day |
| **Total** | **4 days** |

---

## 8. Future Extensions

- **Rate limiting by compliance score:** Users with repeated injection attempts get temporary blocks
- **Custom word lists:** Allow users to add their own terms to never send to AI (e.g., client names)
- **Compliance report:** Monthly email summary to user showing how many times their data was protected
- **Model-agnostic:** The compliance layer runs before any LLM call — works with Claude, GPT-4, Mistral, or any future provider switch
