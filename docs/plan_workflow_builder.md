# Plan: Agent Workflow Builder (ReactFlow)
> Agent SMB — Sprint 6 / Feature Planning
> Date: 2026-05-20

---

## 1. What We're Building

A visual automation builder inside Agent SMB that lets Canadian SMB owners create multi-step
agent workflows without writing code. Think "Zapier-lite" built on top of our existing
AI agent infrastructure, using ReactFlow as the canvas.

**Pilot agent use-case survey (simulated from our 5 personas):**

| Persona | Top requested workflow |
|---------|----------------------|
| Marie (restaurant) | "Every Monday, summarize my week's expenses and flag anything unusual" |
| Kevin (IT contractor) | "When I log a new client project, calculate estimated quarterly installments and add to my calendar" |
| Fatima (salon) | "Monthly: remind me 15 days before RRQ payroll submission, with the amounts pre-calculated" |
| Dave (contractor) | "When winter starts (Nov 1), alert me to set aside 20% more cash and prepare HST filing" |
| Isabelle (bookkeeper) | "After each client session, auto-generate a summary memo and email it to the client" |

**Top cross-persona use cases (ranked by frequency):**
1. Scheduled deadline reminders with pre-calculated amounts
2. Monthly cash flow summary reports
3. "When X happens → do Y" document/email generation
4. Seasonal business alerts (Quebec-specific: construction season, tourist season)
5. Client-facing document automation (for bookkeepers sharing with their SMB clients)

---

## 2. Architecture

### Frontend: ReactFlow Canvas

**Library:** `reactflow` (MIT license — ✅ legally usable in Quebec)

**Node types:**
```
TriggerNode     — WHEN this happens (schedule, manual, event)
AgentNode       — Run this agent (General / Tax / Cash Flow)
ConditionNode   — IF this condition (amount > X, province = QC, month = ...)
ActionNode      — DO this (send email, save to memory, generate PDF)
OutputNode      — END (display result, webhook, export)
```

**File:** `frontend/app/workflows/page.tsx`
**Component:** `frontend/components/workflow/WorkflowBuilder.tsx`

### Backend: Workflow Engine

**New file:** `backend/api/workflows.py`
**New file:** `backend/services/workflow_engine.py`

Workflow is stored as JSON in Supabase `workflows` table:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Monthly RRQ Reminder",
  "nodes": [...],
  "edges": [...],
  "schedule": "0 9 1 * *",
  "active": true
}
```

The scheduler (`backend/services/scheduler.py`) already runs APScheduler — extend it to
load and execute active workflows on their cron schedule.

### Execution model

```
WorkflowEngine.execute(workflow_id)
  → load workflow from Supabase
  → topological sort nodes
  → for each node in order:
      TriggerNode → validate trigger condition
      AgentNode   → call existing agent (business_advisor / tax / cash_flow)
      ActionNode  → send Resend email OR save to Mem0 OR generate PDF
      OutputNode  → store result in workflow_runs table
```

---

## 3. Quebec Law 25 Compliant Tool Stack

All external tools used by workflow actions must meet Law 25 / PIPEDA requirements.
Criteria: data stored in Canada OR data processing agreement available OR no PII transmitted.

| Tool | Use case | Law 25 status | Notes |
|------|----------|---------------|-------|
| **Resend** | Email delivery | ✅ PIPEDA-compliant | DPA available; no PII stored long-term |
| **Supabase (Canada region)** | Workflow storage | ✅ Data in Canada | ca-central-1 (Montreal) |
| **Mem0** | Context memory | ✅ SOC2 + DPA | No data sold/shared |
| **Anthropic** | Agent execution | ✅ DPA available | Zero Training Agreement signed |
| **cal.com (self-hosted)** | Calendar triggers | ✅ Self-hosted option | OSS, no third-party data |
| **n8n (self-hosted)** | Complex webhooks | ✅ Self-hosted option | EU GDPR/Law 25 friendly |

**Tools we explicitly avoid** (Law 25 concern):
- Zapier: stores PII in US servers, no DPA for Canadian Law 25
- Make.com (Integromat): EU-based, DPA available but complex for Quebec
- Google Sheets triggers: Google data residency unclear for Quebec SMBs
- Twilio SMS: TCPA/CASL compliance layer needed separately

**Recommended for Phase 1:** Use only internal tools (Resend + Supabase + Anthropic agents).
External webhooks in Phase 2 with explicit Law 25 disclosure in privacy policy.

---

## 4. Implementation Plan

### Phase 1 — MVP (2 sprints, ~3 weeks)
**Goal:** Scheduled text workflows, no visual builder yet

- [ ] `workflows` + `workflow_runs` Supabase tables
- [ ] Workflow CRUD API (`backend/api/workflows.py`)
- [ ] Scheduler integration — load active workflows, run on cron
- [ ] 3 built-in templates: Monthly RRQ reminder / Weekly cash summary / Deadline alert
- [ ] Simple list UI at `/workflows` — activate/deactivate templates

### Phase 2 — Visual Builder (2 sprints, ~3 weeks)
**Goal:** ReactFlow drag-and-drop canvas

- [ ] Install `reactflow` (MIT, no license issues)
- [ ] `WorkflowBuilder.tsx` with TriggerNode / AgentNode / ActionNode
- [ ] Node palette sidebar
- [ ] Save/load workflow JSON to Supabase
- [ ] Preview & test-run panel

### Phase 3 — Advanced (future)
- External webhooks (Shopify, QuickBooks Online) with Law 25 DPA gating
- Multi-user workflow sharing (Business plan feature)
- Workflow marketplace — community templates

---

## 5. ReactFlow Setup

```bash
cd frontend && npm install reactflow
```

```tsx
// frontend/components/workflow/WorkflowBuilder.tsx
import ReactFlow, { addEdge, Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeTypes = {
  trigger: TriggerNode,
  agent: AgentNode,
  condition: ConditionNode,
  action: ActionNode,
  output: OutputNode,
};
```

ReactFlow is MIT-licensed. No legal issues for commercial use in Quebec.

---

## 6. Supabase Migration

```sql
create table workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  nodes jsonb not null default '[]',
  edges jsonb not null default '[]',
  schedule text,           -- cron expression
  trigger_type text,       -- 'schedule' | 'manual' | 'event'
  active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references workflows(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null,    -- 'running' | 'completed' | 'failed'
  output jsonb,
  error text,
  started_at timestamptz default now(),
  completed_at timestamptz
);

alter table workflows enable row level security;
alter table workflow_runs enable row level security;
create policy "users see own workflows" on workflows for all using (auth.uid() = user_id);
create policy "users see own runs" on workflow_runs for all using (auth.uid() = user_id);
```

---

## 7. Effort Estimate

| Phase | Backend | Frontend | Total |
|-------|---------|----------|-------|
| Phase 1 (templates) | 3d | 2d | **5d** |
| Phase 2 (ReactFlow builder) | 2d | 5d | **7d** |
| Phase 3 (webhooks) | 4d | 3d | **7d** |

**Recommended start:** Phase 1 in Sprint 6, Phase 2 in Sprint 7.

---

## 8. Pricing Gate

- Free tier: 0 workflows
- Pro ($49 CAD/mo): up to 5 active workflows
- Business ($79 CAD/mo): unlimited workflows + sharing
