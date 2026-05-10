---
name: Agent-SMB Project Overview
description: Current UI state, tech stack, personas, and commercial readiness gaps for the Agent-SMB design system
type: project
---

# Agent-SMB — UX Design Project Context

**Product**: Bilingual (FR/EN) AI business advisor SaaS for Canadian SMBs. "Smart accountant + ops advisor in your pocket." Powered by Claude + Mem0 persistent memory.

## Tech Stack (Frontend)
- Next.js 15, React 19, Tailwind CSS 3
- Dark theme only: gray-950/900/800 palette
- No component library installed — pure Tailwind
- One custom Tailwind color token: `brand: { DEFAULT: "#2563eb", dark: "#1d4ed8" }` (blue-600 / blue-700)

## Existing Components (as of May 2026)
- `AuthForm.tsx` — magic link auth, email only, no password
- `ChatInterface.tsx` — main shell: left sidebar (260px) + chat area + optional right memory panel (288px)
- `MemoryPanel.tsx` — raw flat list of Mem0 memories, delete-on-hover
- `SuggestionsBanner.tsx` — top bar with dismissible proactive nudges
- `ProfileSetup.tsx` — modal overlay, 5 fields: full_name, business_name, business_type, province, language

## Data Models Available from API
- `Profile`: id, email, full_name, business_name, business_type, province, language
- `Memory`: id, memory (text), created_at
- `Suggestion`: id, content, source_type, created_at
- `Deadline`: date, title, title_fr, urgency, days_until, authority
- `Conversation`: id, title, created_at
- `Message`: id, role, content, agent_used, created_at

## Agent Types
- `general` — Business Advisor
- `tax` — Tax Compliance (CRA/HST/QST)
- `cash_flow` — Cash Flow

## Current Pain Points for Commercialization
- No onboarding flow beyond single profile modal (modal fires mid-app, not guided)
- No pricing/subscription awareness in the UI
- No dashboard or overview page — straight into chat on login
- Memory panel is a raw unsorted list, not categorized or contextual
- No mobile responsiveness (fixed sidebar widths, no breakpoints)
- No empty states with guidance for new users
- No navigation beyond sidebar links
- SuggestionsBanner is minimal — no priority, no action links
- No trust signals (security, privacy, CRA compliance)
- Language toggle buried in sidebar (should be globally prominent)

## Primary User Persona
**Target**: Canadian SMB owner — restaurant, retail, contractor, salon, professional services
- Non-technical; likely on mobile during the day
- French-dominant in QC; bilingual awareness important for all provinces
- Pain points: tax deadlines (CRA HST, QC TVQ, payroll remittances), cash flow, bookkeeping stress
- Trust is critical: they are sharing sensitive financial info with an AI

**Why:** Shapes every copy decision, every empty state, every trust signal placement.
**How to apply:** Write copy at a Grade 8 reading level. Never use jargon. Show CRA/ARC compliance signals prominently. Make the mobile experience a first-class concern.
