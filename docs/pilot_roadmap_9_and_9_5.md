# Agent SMB — Pilot Roadmap: From 8.3 → 9.0 → 9.5
> Generated: 2026-05-20 · Pro plan at $49 CAD/month

---

## Current State: 8.3/10

| Persona | Onboard | Dashboard | Chat | UI/UX | Navigation | Language | **Overall** | Pay $49? |
|---------|---------|-----------|------|-------|------------|----------|-------------|----------|
| Marie Tremblay (restaurant, QC City) | 9 | 9 | 8 | 8 | 8 | 9 | **8.5** | ✅ |
| Kevin Zhang (IT contractor, Toronto) | 9 | 8 | 9 | 8 | 8 | 7 | **8.2** | ✅ (wants API) |
| Fatima Ouali (salon, Laval) | 8 | 8–9 | 9 | 8 | 8 | 8–9 | **8.2–8.5** | ⚠️ (50-msg concern) |
| Dave Bouchard (contractor, NB) | 8 | 9 | 8 | 8 | **7** | 8 | **8.0** | ✅ |
| Isabelle Roy (bookkeeper, MTL) | 8 | 9 | 9 | 8 | 8 | 9 | **8.5** | ❌ (no multi-client) |

**Would pay $49 CAD/mo: 4/5 personas.**

### What works — do not regress
- Priority deadline hero widget (9/9 across the board)
- Dual ARC/CRA + Revenu Québec source badges
- Email reminders (3/7/14 days before deadlines)
- Direct CRA answers with form numbers, real rates (CPP 5.95%, QST 9.975%)
- 14-day Pro trial, no credit card
- Business-type-specific starter prompts
- Markdown + PDF export
- Law 25 / "no AI training" commitment

---

## Roadmap to 9.0/10 — Low–Medium Effort, Best ROI

**Root cause:** Three converging friction points hold the score at 8.3: (1) navigation is the single
lowest-scored dimension (Dave 7/10), implicitly felt by Marie and Fatima who couldn't easily find
features; (2) missing lightweight utility features — message counter, email-to-accountant, fiscal
calendar — that are cheap to build but make the product feel incomplete for a real Canadian business
workflow; (3) a trust/transparency gap around message limits that makes Fatima hesitant to commit.
No architectural overhaul needed — targeted UI additions and one nav restructure.

**Projected score after: 9.0/10**

| # | Area | Change | Personas | Δ Score | Effort | Time est. |
|---|------|--------|----------|---------|--------|-----------|
| 1 | Navigation | Flatten sidebar to 4 items | Dave, Fatima, Marie | +0.25 | Medium | 2d |
| 2 | Chat | Persistent message counter in header | Fatima, Kevin | +0.20 | **Low** | 0.5d |
| 3 | Dashboard | Annual fiscal calendar (collapsible) | Marie, Dave, Fatima | +0.20 | Medium | 3d |
| 4 | Chat | "Email My Accountant" mailto button | Marie, Fatima | +0.15 | **Low** | 0.5d |
| 5 | Chat | Industry prompt packs (restaurant TVQ/tips, salon) | Marie, Fatima | +0.15 | **Low** | 1d |

**Total estimated effort: ~7 developer-days**

---

### #1 — Flatten Sidebar to 4 Items
**Area:** navigation · Effort: medium · Δ+0.25 · Affects: Dave, Fatima, Marie

Dave rated navigation 7/10 — the single lowest score in the entire pilot. Restructure the left sidebar to exactly 4 top-level items:

- **Accueil / Home** (was Dashboard)
- **Chat** (unchanged)
- **Documents** (was Memory/Mon Dossier — includes exports)
- **Compte** (Account & Billing & Settings merged)

Add a persistent breadcrumb line below the top nav on every screen. Rename all jargon: "Mon dossier" → "Mes documents", remove any compliance-label clutter from sidebar. On mobile, the bottom tab bar also reduces to 4 tabs (same 4). Test with Dave persona profile specifically.

---

### #2 — Persistent Message Counter Badge
**Area:** chat · Effort: low (0.5 day) · Δ+0.20 · Affects: Fatima, Kevin

Add a pill-shaped counter in the top-right of the Chat header always showing `47 / 50 ce mois / this month`. Color coding:
- Gray: 0–79%
- Amber: 80–94%
- Red: 95–100%

Tooltip on hover/tap: "Se réinitialise le 1er du mois. Passez à Pro pour illimité. / Resets the 1st of each month. Upgrade for unlimited."

This converts Fatima's "Would Pay: SOMETIMES" (fear of surprise paywall) to a confident yes. She can see she has room. The surprise-paywall experience is the primary barrier.

---

### #3 — Annual Fiscal Calendar Widget
**Area:** dashboard · Effort: medium (3 days) · Δ+0.20 · Affects: Marie, Dave, Fatima

Below the Priority Deadline Hero banner, add a collapsible `"Votre calendrier fiscal 2025–2026 / Your Tax Calendar 2025–2026"` section.

**Default (collapsed):** A single row showing the next 3 deadline chips:
`Jun 15 — Acomptes · Jul 31 — TPS/TVQ · Oct 31 — T2`

**Expanded:** 12-month grid with colored dots per month:
- 🔴 Red = filing deadline
- 🟡 Amber = installment payment
- 🔵 Blue = remittance

Bottom-right: `"Add to Google Calendar / iCal"` export button.

Collapsed/expanded state saved to localStorage. Pre-populates from user's province + business type from onboarding profile.

---

### #4 — "Email My Accountant" Button
**Area:** chat · Effort: low (0.5 day) · Δ+0.15 · Affects: Marie, Fatima

After any chat session with a tax calculation, deduction summary, or T2125 breakdown, render two buttons in the chat footer:
- `Export Markdown` (existing)
- `Envoyer à mon comptable / Email My Accountant` (new — **mailto: link, zero backend required**)

On first click: modal prompts `"Adresse de votre comptable / Your accountant's email"` — saved to Account Settings under `"Votre comptable"`. Future clicks skip the modal.

The mailto: body auto-includes: subject `"Résumé fiscal — [Business Name] — [Date]"`, chat summary pasted in.

---

### #5 — Industry Prompt Packs
**Area:** chat · Effort: low (1 day) · Δ+0.15 · Affects: Marie, Fatima

Add a horizontally-scrollable chip row above the message input (below the agent selector):

`🍽️ Restaurant` · `💅 Salon/Spa` · `🔨 Entrepreneur` · `👥 Employés` · `🌱 Première année`

Selecting `🍽️ Restaurant` injects a system-context modifier enabling:
- TVQ sur repas avec vs. sans alcool
- Déclaration des pourboires (Loi sur les pourboires, RQ)
- Répartition dépenses alimentation / fournitures
- Tip obligation for employer (source deductions)

Selecting `💅 Salon/Spa` injects:
- Location de chaise vs. employé (classification critique)
- TVQ sur revente de produits
- Déductions fournitures esthéticiennes

Prompt-layer only — no model fine-tuning. Just system-prompt engineering + frontend chip UI.

---

## Roadmap to 9.5/10 — From 9.0 Baseline

**Root cause:** Reaching 9.5 requires solving two harder problems deferred by the 9.0 roadmap:
(1) Isabelle's firm-level multi-client workspace — an architectural feature, not a UI tweak, but it
unlocks the bookkeeper/accountant market segment that has 10–50 clients each and pays more.
(2) Kevin's power-user experience gap — dark mode system sync, slash commands, quarterly installment
automation — signals that technically sophisticated users find the app slightly condescending in its
simplicity. A 9.5 product must be enterprise-trustworthy to Isabelle AND power-user-native to Kevin,
without regressing simplicity for Dave and Marie.

**Projected score after: 9.5/10**

| # | Area | Change | Personas | Δ Score | Effort | Time est. |
|---|------|--------|----------|---------|--------|-----------|
| 1 | Workspace | Multi-client "Firm Mode" + per-client DPA | Isabelle | +0.20 | **High** | 8–10d |
| 2 | Chat | Expert Mode header toggle + slash commands | Kevin, Isabelle | +0.15 | Medium | 3d |
| 3 | Dashboard | Quarterly installment auto-setup card | Kevin, Marie, Dave | +0.15 | Medium | 3d |
| 4 | UI/UX | System dark mode + 3-state toggle | Kevin, Fatima | +0.10 | Medium | 2d |
| 5 | Integrations | Read-only REST API + Zapier triggers | Kevin | +0.10 | **High** | 5–7d |

**Total estimated effort: ~21–25 developer-days**

---

### #1 — Multi-Client Firm Mode (Bookkeeper/Accountant)
**Area:** workspace · Effort: high (8–10d) · Δ+0.20 · Affects: Isabelle

Isabelle is the only "Would Pay: NO" — not because of price, but because using one account for 12 businesses creates a Law 25 liability. This unlocks the entire accountant/bookkeeper segment.

**Implementation:**
- `"Firm Mode"` toggle in Account Settings (Pro plan only), labeled `"Je gère des clients / I manage clients"`
- Restructures dashboard into Client Workspace: left panel = client list, right panel = client's chat/deadlines/exports
- Each client: dedicated chat history, deadline calendar, memory namespace in Mem0
- `"Download DPA"` button per client: generates pre-filled PDF naming client's business + Anthropic as sub-processor (Law 25 §63.5 compliant)
- Default workspace = `"My Business"` so single-user experience is unchanged for Dave/Marie

Backend: `clients` table → foreign-key chat sessions, memories, deadlines to `client_id`.

**Pricing for this feature:** Create a "Firm" plan at $99–149 CAD/mo (up to 15 clients). Isabelle would pay.

---

### #2 — Expert Mode with Slash Commands
**Area:** chat · Effort: medium (3d) · Δ+0.15 · Affects: Kevin, Isabelle

Add persistent two-pill toggle in chat header bar: `Standard · Expert`

**Expert mode activates:**
- `/` keypress opens command palette: `/t2125`, `/installments`, `/gst-hst-calc`, `/export-markdown`, `/cite-source`, `/quebec-only`, `/incorporate`
- CRA citation footnotes on every response by default (currently only on-request)
- Verbose responses with full line-item breakdowns

**Standard mode:** identical to current pilot UX. Toggle defaults to Standard. Saved to `user.preferences`.

Slash commands = router functions injecting structured system prompts. No new model needed.

---

### #3 — Quarterly Installment Auto-Setup Card
**Area:** dashboard · Effort: medium (3d) · Δ+0.15 · Affects: Kevin, Marie, Dave

New dashboard card below Fiscal Calendar: `"Acomptes trimestriels / Quarterly Installments"`.

Auto-populates from onboarding profile (self-employed or corp):
- Mar 15 · Jun 15 · Sep 15 · Dec 15 (CRA — IT-533)
- Quebec users: parallel Revenu Québec dates

Each date row: `[Add to Calendar]` · `[Set Reminder]` · `[Mark Paid]`

Estimated amounts pre-filled from prior-year income (entered at onboarding, manually overridable).
`"How calculated?"` link → inline explainer citing CRA IT-533.

---

### #4 — System Dark Mode + 3-State Toggle
**Area:** ui_ux · Effort: medium (2d) · Δ+0.10 · Affects: Kevin, Fatima

- Default first-load behavior: read `prefers-color-scheme` — if OS = dark, render dark
- 3-state toggle in Account Settings → Appearance: `Light · Dark · Système (défaut)`
- Also: sun/moon icon button in top-right nav bar on every screen (one-click)
- Store preference in `user.preferences` (not just localStorage) so it follows the user across devices
- WCAG AA verification required for: ARC/RQ badge colors, amber message counter, deadline hero in both modes

---

### #5 — Read-Only REST API + Zapier
**Area:** integrations · Effort: high (5–7d) · Δ+0.10 · Affects: Kevin

Kevin conditioned `$49/mo` on API access. Developer users who integrate into their stack have dramatically lower churn.

**Scope: read-only v1** (minimizes security surface area):
- `GET /api/v1/summaries` — last 30 chat summaries `{date, topic, key_figures}`
- `GET /api/v1/deadlines` — upcoming deadline calendar as JSON
- API keys generated in Account → `"Developer"` tab (Pro plan only)
- Rate limit: 100 req/day on Pro
- Zapier integration: 2 triggers — `"New Tax Summary"` + `"Deadline Reminder Due"`
- Pre-built Zap templates for Notion and Gmail
- `/api-docs` — static Markdown-rendered docs page

---

## $49 CAD Pricing Analysis

**Fatima Ouali is the highest churn risk:** Her "Would Pay: SOMETIMES" reflects a usage-pattern mismatch — a solo salon owner has variable monthly tax questions; the 50-message cap feels punitive in low-activity months while $49 feels expensive relative to perceived value. This is fixable without changing the price.

**Isabelle Roy is not a price issue:** She would pay $79–99 for a Firm tier once multi-client workspace ships. Her "NO" at $49 is structural, not financial.

**Kevin Zhang is a conditional yes:** He accepted $49 contingent on API access.

### Single highest-ROI pricing move
Introduce a **$29 CAD/month Starter plan** (150 messages, full Quebec French, all deadline reminders, fiscal calendar — excluding API, Expert mode, and multi-client):
- Converts Fatima from "SOMETIMES" → "YES"
- Removes 50-message anxiety that suppresses her overall score
- Creates natural upgrade path to Pro as her business grows
- Does NOT cannibalize Kevin or Marie (already committed to $49)
- Does NOT unlock the Isabelle segment (she needs Firm, not Starter)

**Revised tier structure recommendation:**
| Plan | Price | Key limit |
|------|-------|-----------|
| Free | $0 | 50 msg/mo, general agent only |
| **Starter** *(new)* | $29 CAD | 150 msg/mo, all agents, fiscal calendar, reminders |
| **Pro** | $49 CAD | Unlimited msg, API, Expert mode, export |
| **Firm** *(new)* | $99 CAD | Everything Pro + multi-client workspace, per-client DPA |

---

## Summary

| Target | # Changes | Dev effort | Key unlock |
|--------|-----------|------------|-----------|
| 8.3 → **9.0** | 5 changes | ~7 days | Navigation, message transparency, fiscal calendar |
| 9.0 → **9.5** | 5 changes | ~21–25 days | Firm mode, Expert slash commands, API |

**Recommended Sprint 7 (9.0 roadmap, ~7 days total):**
1. Message counter badge — 0.5d
2. Email-to-accountant mailto button — 0.5d
3. Industry prompt packs — 1d
4. Annual fiscal calendar widget — 3d
5. Sidebar flatten to 4 items — 2d

**Sprint 8+ (9.5 roadmap, spread over 2–3 sprints):**
1. Expert mode + slash commands — 3d
2. Quarterly installment card — 3d
3. System dark mode — 2d
4. Firm mode (multi-client) — 8–10d
5. REST API + Zapier — 5–7d
