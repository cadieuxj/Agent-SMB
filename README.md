# Agent-SMB — Persistent Memory Business Advisor

AI business advisor for Canadian SMB owners with genuine long-term memory per user.
Bilingual FR/EN · CRA/HST/QST · Quebec payroll · $49 CAD/month SaaS

---

## What This Is

A FastAPI + Next.js SaaS where Canadian SMB owners chat with an AI advisor that
**remembers their business across every session** — decisions made, recurring problems,
financial concerns, seasonal patterns. Each session builds on the last. No more starting over.

**Differentiators:**
- Bilingual FR/EN per user (Quebec market moat — US tools don't do this well)
- Persistent memory via Mem0 — feels like a business partner, not a chatbot
- Canada-specific: CRA tax calendar, HST/GST reminders, Quebec payroll (RQAP, CNESST, RRQ)
- 4 specialized Claude agents routing to the right expertise automatically

---

## Architecture

```
Browser (Next.js 15)
     │
     │  POST /api/backend/chat
     ▼
FastAPI Backend (backend/)
     │
     ├─ Orchestrator Agent
     │    └─ classifies intent → tax | cash_flow | general
     │         │
     │    ┌────┴──────────────────────┐
     │    ▼                           ▼                   ▼
     │  Business Advisor        Tax & Compliance     Cash Flow
     │  Agent (default)         Agent                Agent
     │    │                     │                    │
     │    └──────────┬──────────┘                    │
     │               ▼                               │
     │         Mem0 Cloud                            │
     │         (per-user memory,                     │
     │          semantic search,                     │
     │          auto-extracted facts)                │
     │                                               │
     └─ Supabase ────────────────────────────────────┘
          ├── Auth (magic link)
          ├── profiles (business info, province, language)
          ├── conversations + messages (full history)
          ├── suggestions (proactive nudges queue)
          └── Row-Level Security (each user sees only their data)
```

---

## The 4 Claude Agents

| Agent | File | Triggered When |
|---|---|---|
| **Orchestrator** | `agents/orchestrator.py` | Every request — classifies intent via Claude tool use |
| **Business Advisor** | `agents/business_advisor.py` | General questions, strategy, hiring, operations |
| **Tax & Compliance** | `agents/tax_compliance.py` | HST/GST, CRA deadlines, Quebec payroll, RL-1 slips |
| **Cash Flow** | `agents/cash_flow.py` | Revenue, invoices, AR aging, suppliers, BDC loans |

All agents:
- Inject relevant Mem0 memories into their system prompt (semantic search per query)
- Inject upcoming CRA/RQ deadlines (next 45 days) for context
- Persist every exchange back to Mem0 automatically
- Use prompt caching on static system prompts (reduces token cost ~80%)

---

## File Structure

```
Agent-SMB/
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py       # Intent classifier + router
│   │   ├── business_advisor.py   # Main advisor (memory + tax calendar)
│   │   ├── tax_compliance.py     # CRA/RQ specialist
│   │   └── cash_flow.py          # Financial analyst
│   ├── api/
│   │   ├── chat.py               # POST /chat
│   │   ├── conversations.py      # GET /conversations, GET /conversations/{id}/messages
│   │   ├── memories.py           # GET /memories, DELETE /memories/{id}
│   │   ├── profiles.py           # GET /profiles, PATCH /profiles
│   │   └── suggestions.py        # GET /suggestions, POST /suggestions/generate
│   ├── core/
│   │   ├── config.py             # Pydantic settings from backend/.env
│   │   ├── mem0_client.py        # Mem0 add/search/get_all/delete
│   │   └── supabase_client.py    # Admin + user-scoped clients
│   ├── services/
│   │   ├── scheduler.py          # APScheduler — daily suggestions at 08:00 ET
│   │   ├── suggestions.py        # Claude reads memories → generates nudges
│   │   └── tax_calendar.py       # Rule-based CRA/RQ deadline engine
│   ├── scripts/
│   │   ├── test_mem0.py          # End-to-end Mem0 round-trip test
│   │   └── test_tax_calendar.py  # Print upcoming deadlines
│   ├── main.py                   # FastAPI app + lifespan scheduler
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Login page (magic link)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── auth/callback/
│   │   │   └── route.ts          # Supabase auth callback handler
│   │   └── chat/
│   │       └── page.tsx          # Protected chat page (server component)
│   ├── components/
│   │   ├── AuthForm.tsx          # Magic link email form
│   │   ├── ChatInterface.tsx     # Full chat UI (sidebar + messages + input)
│   │   ├── MemoryPanel.tsx       # Right panel: view + delete memories
│   │   ├── ProfileSetup.tsx      # First-login modal: business name/type/province
│   │   └── SuggestionsBanner.tsx # Proactive nudges banner on login
│   ├── lib/
│   │   ├── api.ts                # All backend API calls
│   │   └── supabase/
│   │       ├── client.ts         # Browser Supabase client
│   │       └── server.ts         # Server-side Supabase client (SSR)
│   ├── middleware.ts             # Auth guard: /chat requires login
│   ├── next.config.ts            # Rewrites /api/backend/* → FastAPI
│   ├── package.json
│   └── .env.local.example
├── supabase/
│   └── schema.sql                # Full DB schema with RLS + triggers
└── .env.example
```

---

## Progress

### Week 1 — Backend Core ✅
- [x] Supabase schema: `profiles`, `conversations`, `messages`, `memory_snapshots` (pgvector), `suggestions`
- [x] Row-Level Security — users only see their own data
- [x] FastAPI app with lifespan scheduler
- [x] Mem0 client with per-user + per-agent scoping (`user_id` + `agent_id="smb-advisor"`)
- [x] All 4 Claude agents with prompt caching

### Week 2 — Memory Loop ✅
- [x] CRA/Quebec tax calendar engine — all federal + provincial deadlines, urgency levels, bilingual prompt injection
- [x] Proactive suggestions service — Claude reads Mem0 memories + deadlines → 1–3 personalized nudges
- [x] APScheduler background job — runs `daily_suggestions` at 08:00 ET, starts/stops with FastAPI lifespan
- [x] Suggestions API: `GET /suggestions/{user_id}`, `POST /suggestions/{user_id}/generate`, `GET /suggestions/{user_id}/deadlines`
- [x] Tax deadlines injected into business advisor on every chat turn
- [x] Test scripts: `scripts/test_mem0.py`, `scripts/test_tax_calendar.py`

### Week 3 — Frontend ✅
- [x] Next.js 15 + Tailwind + TypeScript + Supabase SSR
- [x] Magic link auth — `AuthForm`, `/auth/callback`, middleware protection on `/chat`
- [x] Dark chat UI — left sidebar with conversation list + language toggle, message bubbles with agent labels
- [x] Conversation history — click past conversations in sidebar to reload messages
- [x] Profile setup modal — appears on first login, collects business name/type/province/language
- [x] Memory panel — shows all Mem0 memories, hover to delete, auto-refreshes after each message
- [x] Proactive suggestions banner — loads unshown nudges on login, marks them shown, dismissable

### Bugs Fixed (Weeks 1–3)
- [x] Relative imports → absolute imports (uvicorn subprocess spawning breaks relative imports)
- [x] `env_file=".env"` → `Path(__file__).parent.parent / ".env"` (CWD-independent config loading)
- [x] FK violation on first message → profile upsert before conversation insert
- [x] Profile created with placeholder email → `ChatRequest` now accepts real `email` from frontend
- [x] Mem0 response parsing → `_normalize()` handles both `list` and `{"results": [...]}` SDK formats
- [x] Supabase `handle_new_user()` trigger → auto-creates profile row on signup

### Week 4 — Launch (Next)
- [ ] Stripe billing — $49 CAD/month, payment wall before `/chat`
- [ ] Landing page — bilingual FR/EN, value prop, pricing, magic link CTA
- [ ] Onboard 3 beta clients
- [ ] Monitoring — Sentry (errors) + Plausible or Posthog (analytics)

---

## Setup from Scratch

### Prerequisites
- Python 3.12+
- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Mem0](https://mem0.ai) account (get API key)
- An [Anthropic](https://console.anthropic.com) API key

---

### 1. Supabase — Apply Schema

In your Supabase project → **SQL Editor**, paste and run the full contents of `supabase/schema.sql`.

This creates:
- `profiles`, `conversations`, `messages`, `memory_snapshots`, `suggestions` tables
- pgvector extension + IVFFlat index
- Row-Level Security policies
- `handle_new_user()` trigger (auto-creates profile on signup)
- `handle_updated_at()` triggers

---

### 2. Supabase — Auth Settings

**Authentication → Settings:**
- Enable **Email** provider
- Add redirect URL: `http://localhost:3000/auth/callback`
- For production, also add your prod domain callback URL

**To avoid free-tier email rate limits (3/hour), set up custom SMTP:**

Authentication → Settings → SMTP Settings:
| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | your [Resend](https://resend.com) API key |
| Sender email | `noreply@yourdomain.com` |
| Sender name | `Agent SMB` |

---

### 3. Backend Setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` (copy from `.env.example`):

```env
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
MEM0_API_KEY=m0-...
APP_ENV=development
APP_SECRET_KEY=change-me-in-production
CORS_ORIGINS=http://localhost:3000
```

Run:
```bash
# Always run from inside backend/
cd backend
source .venv/bin/activate
uvicorn main:app --reload
# API → http://localhost:8000
# Swagger UI → http://localhost:8000/docs
```

---

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (copy from `.env.local.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run:
```bash
npm run dev
# → http://localhost:3000
```

---

### 5. Run Both Together

Terminal 1 — backend:
```bash
cd backend && source .venv/bin/activate && uvicorn main:app --reload
```

Terminal 2 — frontend:
```bash
cd frontend && npm run dev
```

Open `http://localhost:3000` → enter email → check inbox → click magic link → profile setup → chat.

---

## API Reference

All endpoints available interactively at `http://localhost:8000/docs`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/chat` | Send message, get agent reply, persist to Supabase + Mem0 |
| GET | `/conversations/{user_id}` | List user's conversations |
| GET | `/conversations/{user_id}/{conv_id}/messages` | Load messages for a conversation |
| GET | `/memories/{user_id}` | List all Mem0 memories |
| GET | `/memories/{user_id}/search?q=...` | Semantic search over memories |
| DELETE | `/memories/{user_id}/{memory_id}` | Delete a specific memory |
| GET | `/profiles/{user_id}` | Get user profile |
| PATCH | `/profiles/{user_id}` | Update profile (business name, type, province, language) |
| GET | `/suggestions/{user_id}` | Get unshown nudges (marks them shown) |
| POST | `/suggestions/{user_id}/generate` | Manually trigger nudge generation |
| GET | `/suggestions/{user_id}/deadlines` | Upcoming CRA/RQ deadlines |

---

## Testing

```bash
cd backend
source .venv/bin/activate

# Mem0 round-trip (add → search → verify → delete)
python scripts/test_mem0.py

# Tax calendar — print next 90 days of deadlines
python scripts/test_tax_calendar.py

# Manual suggestions trigger
curl -X POST "http://localhost:8000/suggestions/{user_id}/generate?language=fr"

# Health
curl http://localhost:8000/health
```

---

## Key Technical Decisions

| Decision | Why |
|---|---|
| Absolute imports everywhere | Uvicorn subprocess spawning breaks relative imports when venv is inside `backend/` |
| `Path(__file__)` for `.env` path | CWD is not reliable in uvicorn subprocesses — anchor to source file location |
| Profile upsert before conversation insert | Supabase Auth creates `auth.users` but not `profiles` — FK would fail otherwise |
| `_normalize()` in mem0_client | Mem0 SDK returns `list` or `{"results": [...]}` depending on version |
| Prompt caching on system prompts | Saves ~80% tokens on repeated calls — system prompt is large (memories + deadlines) |
| APScheduler (not Celery) | Personal project — no need for Redis/worker infrastructure |
| Mem0 Cloud (not self-hosted) | No dataset needed — memories build per user through usage |

---

## Business Model

| Metric | Target |
|---|---|
| Price | $49 CAD/month |
| Target customer | Quebec/Canada SMB owners — restaurants, contractors, salons, retail |
| Break-even | 10 clients ($490 MRR) |
| Month 6 goal | 50 clients (~$2,450 MRR) |
| Moat | Bilingual FR/EN memory + Canada-specific compliance knowledge |
