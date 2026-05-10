---
name: Agent-SMB UI Architecture Decisions
description: Page map, navigation structure, routing decisions, and component hierarchy for commercial readiness
type: project
---

# Agent-SMB UI Architecture

## Route Map (Next.js App Router)
```
/ (app/page.tsx)                  → Auth / Landing page
/auth/callback (route.ts)         → Supabase magic link handler
/onboarding (new)                 → 4-step guided wizard (post-first-login)
/dashboard (new)                  → Overview: health, deadlines, suggestions, quick chat
/chat (app/chat/page.tsx)         → Full chat interface (current, improved)
/chat/[id] (new)                  → Deep link to specific conversation
/memory (new)                     → Full memory & insights page
/settings (new)                   → Profile + preferences (replaces modal)
/settings/billing (new)           → Subscription management
```

## Navigation Structure
Shell layout introduced at /dashboard, /chat, /memory, /settings:
- Left sidebar (persistent on desktop, drawer on mobile)
- No top navbar (sidebar is primary nav)
- Mobile: bottom tab bar (4 tabs: Dashboard, Chat, Memory, Settings)

## Key Architectural Decision: Dashboard-First
On login, users land on /dashboard not /chat. Dashboard shows:
- Business health snapshot (from memories + deadlines API)
- Next tax deadline countdown
- Top suggestions (1-2, not a full list)
- Quick-start chat prompt
This builds perceived value immediately and reduces "blank chat" confusion for new users.

## Onboarding Flow (4 steps, /onboarding)
Step 1: Welcome + language choice
Step 2: Business profile (replaces ProfileSetup modal — same fields)
Step 3: Province + tax context (GST/HST vs GST+QST)
Step 4: First question prompt (guided into first chat, not blank)

## Subscription Tiers (to design for)
- Free: 20 messages/month, 1 agent (general only)
- Pro ($29/mo): unlimited messages, all 3 agents, memory panel
- Business ($79/mo): multi-user, priority support, export reports

**Why:** Shapes where upgrade prompts appear and what gets paywalled.
**How to apply:** Design paywall gates at: agent switching (free → pro), memory page (free → pro), export features (pro → business).
