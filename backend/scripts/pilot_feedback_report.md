# Agent SMB — Pilot Customer Feedback Report

_Generated: 2026-05-20 11:17_

---

## Iteration 1 — Average Score: **8.4/10**

| Persona | Onboard | Dashboard | Chat | UI/UX | Navigation | Language | **Overall** | Pay $49? |
|---------|---------|-----------|------|-------|------------|----------|-------------|----------|
| Marie Tremblay | 9 | 9 | 8 | 9 | 8 | 10 | **8.8** | ✅ |
| Kevin Zhang | 9 | 9 | 8 | 8 | 8 | 7 | **8.2** | ✅ |
| Fatima Ouali | 8 | 9 | 9 | 8 | 8 | 7 | **8.2** | ✅ |
| Dave Bouchard | 8 | 9 | 8 | 8 | 7 | 9 | **8.2** | ✅ |
| Isabelle Roy | 9 | 8 | 8 | 9 | 8 | 9 | **8.5** | ❌ |

### What they said

> **Marie Tremblay:** "C'est la première fois qu'une application me parle vraiment comme une propriétaire de restaurant au Québec et pas comme une entreprise en Ontario — le français est impeccable, les références à RQ et à la TVQ sont correctes, et cette carte orange avec mon prochain acompte, j'aurais donné n'importe quoi pour avoir ça l'année passée."  
> **Kevin Zhang:** "I've tried wrapping ChatGPT with CRA prompts myself and it's a mess — this thing actually knows what a T2125 is and why June 15 matters to me specifically, which is worth more than another generic 'AI assistant' that confidently tells me the wrong installment rate."  
> **Fatima Ouali:** "C'est la première application d'affaires où j'ai eu ma réponse sur la TVQ sans avoir à appeler personne — ça, c'est rare."  
> **Dave Bouchard:** "It's not perfect but it's the first piece of software in twenty years that felt like it was built for someone like me and not for some kid in a hoodie in Toronto."  
> **Isabelle Roy:** "The Law 25 implementation is legitimately impressive and the Quebec tax context is accurate, but without a bookkeeper or accountant portal that lets me manage multiple clients under one login, this is a great tool for my clients, not a tool for me."  

### Common themes

**👍 Most liked:**
- La carte d'acompte provisionnel toujours visible — l'an passé j'ai manqué une échéance et ça m'a coûté 400$ en pénalités, alors voir mon prochain montant dû en amber sur le tableau de bord dès que j'ouvre l'appli, c'est exactement ce qu'il me fallait
- Le calendrier fiscal avec les badges ARC en rouge et RQ en bleu — je sais immédiatement si c'est une obligation fédérale ou provinciale, plus besoin de fouiller sur deux sites gouvernementaux différents
- Le bouton 'Envoyer à mon comptable' avec le courriel pré-rempli — mon comptable est à Québec et on se parle surtout par courriel, pouvoir lui envoyer un PDF formaté proprement sans copier-coller du markdown, c'est une vraie valeur ajoutée
- The installment sticky card showing '$6,796 / trimestre' with zero navigation required — that's exactly the number I need every March, June, September, December, and it's just *there* on the dashboard without me having to dig through a settings menu or ask the AI
- Tax agent quality with actual CRA citations, CPP at 5.95%, T2125 auto-detection — this reads like it was built by someone who actually filed a Schedule 8 before, not a generic GPT wrapper with 'consult a professional' slapped on every answer
- Magic-link login, no-credit-card trial, persistent message counter with color-coded warnings — the transparency here is genuinely refreshing compared to tools that hide paywalls until you're already invested

**🔧 Most wanted improvements:**
- Je voudrais pouvoir entrer mes revenus mensuels directement depuis le tableau de bord sans passer par les paramètres du compte — en période de rush au restaurant je n'ai pas le temps de naviguer dans les menus, un bouton rapide 'Mettre à jour mes revenus' sur la carte d'acompte suffirait
- Le chip 'Restaurant' dans le chat est bien, mais j'aimerais qu'il reconnaisse automatiquement les spécificités du secteur HRI au Québec — les pourboires déclarés, les crédits de taxe sur les repas du personnel, pas seulement les généralités fiscales
- Les notifications par courriel sont bien, mais j'aurais aimé une option de rappel SMS ou une notification push mobile — quand je suis en cuisine le soir je ne lis pas mes courriels, mais je vois toujours mes textos
- As an Ontario contractor, the French-first UI elements (like 'Prochain acompte' and 'Comptable / Accountant' labels) create subtle cognitive friction — I get the bilingual mandate, but an EN-first user in Toronto shouldn't have to parse French labels in what's supposed to be their default experience; let the language selection in onboarding fully commit
- The three-agent chat system (General, Tax, Cash Flow) is smart architecture, but I want to see the auto-routing logic surfaced — if I ask a GST/HST question and it routes to Tax, show me a small badge like 'Handled by Tax Agent' so I trust the response rather than wondering if the general agent hallucinated something CRA-specific
- At $49 CAD/month I'd want a direct CRA My Business Account integration or at least a read-only ledger import — right now I still have to manually enter prior-year net income, which means the installment card is only as accurate as my memory, and for a contractor juggling three clients that's a real limitation

### Roadmap to 9.0/10 (low–medium effort, highest ROI)

**Root cause:** The current 8.4 average reflects a product that has excellent foundational architecture (installment card, fiscal calendar, bilingual context, Law 25) but repeatedly creates small navigation detours and cognitive friction at the moments of highest user intent — editing income requires leaving the dashboard, agent routing is invisible and creates trust doubt, language priority conflicts for EN-first users, onboarding doesn't branch for employers vs. sole proprietors, and the export menu presents three choices when users want one. None of these gaps require architectural changes; they are all UI-layer decisions where the product currently chooses completeness over simplicity. Non-technical Canadian SMB users — restaurateurs, contractors, salon owners — will tolerate complexity in a tool they trust, but they will score lower on navigation and UX precisely because these friction points appear during time-pressured workflows (tax deadlines, rush service hours, accountant calls). Fixing the top five friction points, all of which appear in at least two persona reviews, is sufficient to move average scores in navigation (+0.4), UI/UX (+0.3), and onboarding (+0.2) enough to cross the 9.0 threshold.

**Projected score:** 9.0/10

| # | Area | Improvement | Personas | Δ Score | Effort | ROI Note |
|---|------|-------------|----------|---------|--------|----------|
| 1 | dashboard | Quick-Edit Income Inline on Installment Sticky Card | marie, kevin, dave, fatima | +0.25 | low | The single most-requested navigation shortcut across personas — Marie explicitly described it as a rush-period blocker, Kevin flagged income accuracy as a trust issue, and Dave wants fewer clicks to reach key numbers; fixing this turns a friction point on the highest-visibility dashboard component into a delight moment. |
| 2 | chat | Surface Agent Routing as a Visible 'Handled By' Badge | kevin, dave, isabelle, fatima | +0.22 | low | Kevin explicitly named this as a trust gap ('wondering if the general agent hallucinated something CRA-specific'), Isabelle needs auditability for bookkeeping work, and solving it requires only UI state surfacing of already-known server-side routing data — zero AI architecture change. |
| 3 | language | Province-Committed Language Lock After Onboarding Step 1 | kevin, dave | +0.18 | medium | Kevin scored language 7/10 and directly cited French-first labels causing cognitive friction for an EN-default Ontario user — this is a pure i18n rendering fix that costs no new copy and recovers a half-point drag on language scores for the ~50% of Canadian SMBs outside Quebec. |
| 4 | onboarding | Employer vs. Self-Employed Onboarding Branch in Step 3 | fatima, marie, isabelle | +0.18 | low | Fatima scored onboarding 8/10 and named this exact ambiguity as her primary concern — a two-tile branch and a label change require no backend change and prevent a significant misunderstanding that could cause users to enter wrong data and distrust the installment card. |
| 5 | navigation | Consolidate Export Options Into Single 'Send to My Accountant' Primary CTA | dave, marie, fatima | +0.15 | low | Three personas flagged export complexity independently — this is a UI re-ordering exercise (no new backend) that eliminates decision paralysis at the exact moment of highest user-accountant workflow value, directly reducing churn risk for non-technical users. |

#### Details — 9.0 roadmap

**1. Quick-Edit Income Inline on Installment Sticky Card** (dashboard)
> Add a small pencil icon (edit glyph, 16px) directly on the amber Installment Sticky Card beside the income figure. Clicking it opens a compact inline input field (not a modal, not a settings redirect) with a single number field labeled 'Revenu net annuel / Annual net income', a 'Save' button, and a small gray helper text: 'Used to estimate your quarterly installments'. On save, the card amount recalculates instantly and shows a micro-toast: 'Montant mis à jour / Amount updated'. This eliminates the Account → Comptable navigation detour entirely. The pencil icon should appear on hover (desktop) or always be visible (mobile) to ensure discoverability.

**2. Surface Agent Routing as a Visible 'Handled By' Badge** (chat)
> After every AI response, display a small pill badge directly below the message bubble (not in the header, not in a tooltip) showing which agent responded. Badge text: 'Tax Agent / Agent fiscal — CRA source' (amber background, lock icon) or 'Cash Flow Agent / Agent trésorerie' (blue) or 'General Agent / Conseiller général' (gray). Badge should be 12px text, 4px border-radius pill, non-interactive but present on every message. For tax responses citing CRA or RQ, append a mini source chip inline: '📋 Pub. T4002' or '📋 RQ — Guide IN-151'. Also add a one-line tooltip on the badge on hover: 'Auto-routed by Agent SMB based on your question.' This also addresses Dave's 'three agents is confusing' concern by making the routing invisible to him — he never picks, the badge just confirms after the fact.

**3. Province-Committed Language Lock After Onboarding Step 1** (language)
> In the Account → Profile settings page, add a new toggle under 'Langue / Language': 'Interface preference: FR-first | EN-first'. When a user selects EN during onboarding (Ontario/BC/AB), all UI labels must render EN-first with no visible French string preceding them — 'Accountant' not 'Comptable / Accountant', 'Next installment' not 'Prochain acompte'. The bilingual string logic should flip: EN label shown, FR label appears only as a sub-label in 6px gray text beneath (or omitted entirely for EN-first users). Conversely, FR-first users (QC/NB) see French dominant. This is a label rendering toggle in i18n config — it does not change any underlying bilingual data, just the display priority. Add a visible 'Language preference: English-first' confirmation chip on the Account page so users know their setting is active.

**4. Employer vs. Self-Employed Onboarding Branch in Step 3** (onboarding)
> In Onboarding Step 3 (Tax Context), after the 'Revenue range' selector, add a single binary question: 'Do you have employees? / Avez-vous des employés?' with two large tile buttons: 'Yes — I have 1 or more employees / Oui — j'ai des employés' and 'No — I'm self-employed only / Non — travailleur autonome seulement'. If 'Yes' is selected, the 'Prior-year net income' field label changes to 'Your personal net income (not your payroll total) / Votre revenu net personnel' with a helper text: 'Enter your own income, not your employees' wages. Used only to estimate your personal installments.' Additionally, the installment sticky card on the dashboard shows a small info chip: 'Based on owner income only — does not include payroll source deductions.' This resolves Fatima's explicit confusion about whether the income field applied to her as an employer.

**5. Consolidate Export Options Into Single 'Send to My Accountant' Primary CTA** (navigation)
> On the Chat page desktop header, replace the three separate export buttons (MD download, PDF, Comptable format) with a single primary button: 'Send to My Accountant / Envoyer à mon comptable' (filled amber, 14px, accountant icon). Clicking this button: (1) if accountant email is stored in profile, opens a pre-filled mailto with the Comptable-formatted PDF attached and a confirmation micro-toast 'Email prepared / Courriel prêt'; (2) if no email is stored, opens a small inline form to enter the accountant's email with a 'Save for next time' checkbox. The three individual export options (MD, PDF, Comptable) move into a secondary 'More export options / Plus d'options' collapsed dropdown (chevron icon, gray text, right-aligned) for power users. Clipboard copy button remains always visible as fallback. Dave explicitly said 'just give me one button that says Send to my accountant' — this is copy-paste product direction.

### Roadmap to 9.5/10 (from 9.0 baseline)

**Root cause:** After the 9.0 fixes address surface-level friction, what separates Agent SMB from a 9.5 product is depth and trust infrastructure. The remaining gaps fall into three categories: (1) Industry specificity — the sector chips set context but don't yet deliver genuinely differentiated tax guidance for HRI, salon, or construction operators, leaving Marie and Fatima feeling served generically rather than expertly; (2) Auditability and precision — Isabelle and Kevin both identify that the product makes confident estimates and routing decisions without surfacing the evidence trail or acknowledging edge-case limitations, which is acceptable for a curious SMB owner but insufficient for anyone making professional recommendations or managing material tax obligations; (3) Business model fit for the advisor channel — Isabelle is the only persona who will not pay, and her reason is structural (no multi-client workspace), not a preference — she represents an entire segment of bookkeepers and accountants who could be the product's most powerful distribution channel if the Business tier offered a workable advisor workspace. Reaching 9.5 requires moving from 'great tool for a single Canadian SMB owner' to 'trusted platform for the Canadian SMB tax ecosystem,' which means deeper sector knowledge, transparent AI accountability, and a professional tier that serves advisors, not just their clients.

**Projected score:** 9.5/10

| # | Area | Improvement | Personas | Δ Score | Effort | ROI Note |
|---|------|-------------|----------|---------|--------|----------|
| 1 | chat | HRI / Industry-Specific Tax Logic Expansion in Sector Context Chips | marie, fatima, kevin | +0.2 | high | Industry-specific tax depth is the feature that converts Agent SMB from 'good generic AI' to 'my industry's tax tool' — the stickiest possible retention mechanism for sector-concentrated SMB cohorts, and the most defensible moat against generic ChatGPT alternatives Kevin explicitly compared the product to. |
| 2 | onboarding | SMS / Push Notification Opt-In in Account Notification Settings | marie, fatima, dave | +0.18 | medium | SMS deadline reminders transform the product's core value proposition (avoiding CRA/RQ penalties) from a dashboard feature into an ambient safety net — users who get a text before a deadline and avoid a $400 fine become lifetime subscribers, and this is the single change most likely to generate organic word-of-mouth among restaurant and salon owners. |
| 3 | chat | Conversation Timestamp and AI Version Audit Trail in Chat History | isabelle, kevin, fatima | +0.17 | medium | Isabelle will not pay $49/month and will not recommend the tool professionally without an audit trail — adding timestamped session headers and a plain-text export costs minimal backend work (data already exists in Supabase) but unlocks an entire advisor/bookkeeper referral channel that could drive dozens of SMB client subscriptions per bookkeeper converted. |
| 4 | dashboard | Income Fluctuation Caveat and Multi-Stream Input on Installment Card | isabelle, kevin, marie | +0.15 | medium | The installment card is the product's highest-visibility feature and its single largest accuracy risk — adding a lightweight adjustment input and honest caveat copy costs one sprint but prevents the trust collapse that would occur when a user follows the card's estimate and gets a CRA interest charge, which is a fatal churn event. |
| 5 | pricing | Bookkeeper / Advisor Portal — Multi-Client Workspace at Business Tier | isabelle, kevin | +0.2 | high | A single converted bookkeeper at $99/month who manages 12 SMB clients generates more LTV and organic acquisition than 12 independent SMB signups found through paid channels — the advisor portal is the highest-leverage distribution mechanism available and the only change that converts Isabelle from a vocal non-buyer to a vocal advocate. |

#### Details — 9.5 roadmap

**1. HRI / Industry-Specific Tax Logic Expansion in Sector Context Chips** (chat)
> Expand the 'Restaurant' context chip (and all sector chips) from a generic context-setting prompt into a structured sector knowledge module. For 'Restaurant / HRI (QC)', the chip now pre-loads: declared tips (pourboires déclarés) rules under RQ, meal credit for staff (crédit de taxe sur les repas du personnel), TVQ on restaurant supplies, and tipping payroll implications. For 'Salon/Spa', pre-load: RRQ treatment for employed vs. chair-rental stylists, TVQ on beauty services, and the distinction between T4 employees and T4A contractors. For 'Entrepreneur (Construction)', pre-load: Loi R-20 (QC), holdback rules, and GST/HST on progress billings. Implementation: each chip maps to a system-prompt injection at session start (server-side, not user-visible) that specializes the Tax Agent's knowledge scope for that session. Add a visible 'Industry context active: Restaurant — HRI Québec' banner below the chip row when active, with an 'x' to remove it. This directly answers Marie's request for HRI-specific guidance and Fatima's request for clearer RRQ employee explanations.

**2. SMS / Push Notification Opt-In in Account Notification Settings** (onboarding)
> Add a third notification channel in Account → Email Notifications section, below the existing email toggles. New section header: 'Mobile alerts / Alertes mobiles'. Two options: (1) SMS reminders — a phone number field with Canadian format validation (+1 XXX-XXX-XXXX), opt-in checkbox labeled 'Text me deadline reminders / Envoyer mes rappels par texto', and a helper: 'Standard messaging rates may apply. Max 4 texts/month.' Powered by Twilio or equivalent. (2) Push notifications — a 'Enable push notifications / Activer les notifications push' button that triggers the browser/PWA permission dialog, storing the subscription server-side. Reminder schedule mirrors email: 3, 7, and 14 days before deadlines. SMS sends a concise bilingual message: 'Agent SMB: Acompte dû Jun 15 — $6,796. Répondez STOP pour vous désabonner.' This was Marie's most practical request and reflects a real restaurant operator workflow: phone in pocket, not inbox.

**3. Conversation Timestamp and AI Version Audit Trail in Chat History** (chat)
> For every chat session, display a collapsible session header above the first message showing: session start timestamp (ISO 8601, user's local timezone), AI model version string (e.g., 'Agent SMB Tax v2.1 — GPT-4o'), and a session ID (short UUID, copyable). Format: gray pill row pinned to top of each conversation thread, collapsed by default, expands on click. On the Documents page (Mémoire), each memory entry should show the source session timestamp and session ID as sub-text beneath the memory content. Add an 'Export session log / Exporter le journal' button in the chat header (secondary, text-only) that downloads a plain-text .txt file with all messages, timestamps, agent routing decisions, and AI version — formatted for CRA audit readiness. Label the export: 'Conversation log — for professional use / Journal de conversation — usage professionnel'. This directly closes Isabelle's compliance gap without requiring a full audit infrastructure rebuild.

**4. Income Fluctuation Caveat and Multi-Stream Input on Installment Card** (dashboard)
> Expand the Installment Sticky Card's data input from a single 'prior-year net income' field to a two-field optional panel (accessible via the pencil icon added in Roadmap 1). The panel shows: Field 1: 'Prior-year net income / Revenu net de l'an passé' (existing). Field 2 (new, optional, collapsible): 'Expected change this year / Changement prévu cette année' — a +/- dollar input or a percentage slider (±50%) labeled 'If your income will be significantly higher or lower this year, adjust here.' When Field 2 is populated, the installment card shows an adjusted figure with a small note: 'Adjusted estimate / Estimation ajustée' and a yellow info chip: '⚠️ CRA allows method 2 installments based on current-year estimate — confirm with your accountant.' Also add a persistent gray fine-print disclaimer below the installment amount: 'Estimate based on prior-year income. Significant income changes or multiple revenue streams may affect your actual obligation.' This closes Isabelle's precision gap and Kevin's accuracy concern without requiring full CRA API integration.

**5. Bookkeeper / Advisor Portal — Multi-Client Workspace at Business Tier** (pricing)
> At the Business $99 CAD/month tier, add a 'Advisor workspace / Espace conseiller' mode accessible from the Account page via a toggle: 'I manage clients / Je gère des clients'. When enabled, the left sidebar (desktop) or bottom nav (mobile) gains a 'Clients' tab showing a list of client profiles, each with: client name, business type, province, last activity date, and a one-click 'Switch to client / Basculer vers ce client' button that loads that client's dashboard, calendar, and chat history in a fully siloed context. Client data is segregated by client_id in Supabase with RLS policies. The advisor's own profile remains separate. Maximum clients at Business tier: 15. Add an 'Invite client / Inviter un client' flow that sends the client a magic-link onboarding email pre-filled with the advisor's email as the accountant contact. Isabelle explicitly said 12 separate $49 subscriptions is 'economically unworkable' — this feature converts her from a non-subscriber who recommends the tool to a $99/month anchor customer who brings 12 SMB clients into the ecosystem.

### $49 CAD Pricing Analysis

At $49 CAD/month, four of five personas confirmed willingness to pay using the same rational justification — one avoided CRA/RQ penalty covers multiple months of subscription — which means the pricing is defensible on ROI grounds for active SMB owners who have already experienced a penalty or live in fear of one. The one non-paying persona, Isabelle, rejected the price not because $49 is too high but because the product architecture forces her to pay $49 × 12 clients = $588/month for a use case (multi-client bookkeeping) the product doesn't yet support, making her price sensitivity structural rather than value-based. The persona most at risk of quiet churn is Kevin Zhang: he pays $49 today based on the promise of CRA integration accuracy, but his explicit condition for continued payment is 'a direct CRA My Business Account integration or at least a read-only ledger import' — if the installment card's accuracy degrades his trust (e.g., he enters a wrong income figure and gets surprised by a CRA interest charge), he will cancel within 90 days because he is sophisticated enough to build his own alternative. The single change most likely to improve willingness to pay across all personas is launching the Advisor/Bookkeeper workspace at the Business $99 tier: it converts Isabelle from a non-subscriber into a $99/month anchor customer who actively drives 12 SMB clients into the Pro tier, it gives Kevin a professional-grade tool context that justifies $49, and it repositions the pricing ladder from 'Free → Solo Pro' to 'Free → Solo Pro → Professional Practice' — a structure that mirrors how Canadian SMBs actually buy software (through their bookkeeper's recommendation).

---

## Iteration 2 — Average Score: **8.4/10**

| Persona | Onboard | Dashboard | Chat | UI/UX | Navigation | Language | **Overall** | Pay $49? |
|---------|---------|-----------|------|-------|------------|----------|-------------|----------|
| Marie Tremblay | 9 | 9 | 8 | 9 | 8 | 10 | **8.8** | ✅ |
| Kevin Zhang | 9 | 9 | 8 | 8 | 8 | 7 | **8.2** | ✅ |
| Fatima Ouali | 8 | 8 | 9 | 8 | 7 | 8 | **8.0** | ✅ |
| Dave Bouchard | 8 | 9 | 8 | 8 | 7 | 9 | **8.2** | ✅ |
| Isabelle Roy | 9 | 9 | 8 | 9 | 8 | 9 | **8.7** | ❌ |

### What they said

> **Marie Tremblay:** "C'est la première application qui me parle vraiment comme une restauratrice québécoise, pas comme une entreprise en Ontario — le RQ en bleu, la TVQ bien séparée, tout en français sans que j'aie à le demander, c'est ce que j'attendais depuis longtemps."  
> **Kevin Zhang:** "This is the first Canadian SMB tool that actually feels like it was built for someone who files a T2125 and worries about June 15 installments, not a generic AI wrapper with a maple leaf slapped on the landing page."  
> **Fatima Ouali:** "C'est la première appli d'affaires où j'ai eu mes réponses sur la RRQ sans avoir l'impression de lire un formulaire du gouvernement."  
> **Dave Bouchard:** "I've been doing this job for 28 years and nobody ever put my tax deadlines and what I owe on one screen — that alone makes this worth a look."  
> **Isabelle Roy:** "The Law 25 implementation is the most credible I've seen in a Canadian SaaS product — but until there's a multi-client view, I'm recommending it to my clients, not billing it to myself."  

### Common themes

**👍 Most liked:**
- La carte d'acompte provisionnel toujours visible en amber — voir mon prochain paiement de $6,796 directement sur le tableau de bord sans chercher, c'est exactement ce dont j'avais besoin après mon pénalité de $400 l'année passée
- Le calendrier fiscal avec les badges ARC en rouge et RQ en bleu — je sais immédiatement quelle agence est concernée, et l'export .ics pour l'ajouter à mon agenda iPhone est une vraie bénédiction pour quelqu'un comme moi
- Le fait que tout est en français dès le départ pour le Québec, avec les références à Revenu Québec et la TPS/TVQ correctement séparées — ça montre que les développeurs comprennent vraiment la réalité fiscale québécoise
- The installment sticky card is genuinely the killer feature for me — seeing '$6,796 / trimestre due Jun 15' at a glance without digging through CRA's My Account is exactly the zero-friction experience I didn't know I needed
- Tax agent quality with actual CPP percentages, T2125 auto-detection, and CRA publication citations feels like it was built by someone who actually files T1 General as a contractor — not generic 'consult a professional' filler
- Magic-link login plus Canadian data hosting and Law 25 compliance ticks all my boxes — I'm not putting my business financials through a US-hosted app with vague privacy policies

**🔧 Most wanted improvements:**
- J'aimerais des rappels push sur mon téléphone en plus des courriels — quand je suis dans le rush du service du soir, je ne lis pas mes emails, mais une notification push 7 jours avant une échéance me sauverait la mise
- Le chat avec trois agents spécialisés c'est bien, mais parfois comme restauratrice j'ai des questions qui mêlent fiscalité ET trésorerie en même temps (ex: est-ce que je peux reporter un acompte si mon mois a été mauvais?) — un agent hybride ou une meilleure transition entre agents serait utile
- J'aimerais pouvoir entrer mes revenus mensuels approximatifs directement dans l'app pour que l'estimation des acomptes se raffine au fil de l'année, pas seulement basée sur le revenu de l'année passée qui peut être très différent
- The agent routing is smart but I'd want to manually override it more granularly — a dropdown to pick 'Tax' vs 'Cash Flow' upfront rather than hunting for the renamed 'Choose advisor' button after the fact, similar to how Linear lets you assign issue types before submission
- At $49/mo I'd expect API access or a Zapier/Make integration so I can pipe installment reminders into my existing Notion dashboard or calendar without manually exporting .ics files — the export is good but it's still a manual step
- The language score reflects that as an Ontario EN-first user I'll rarely touch the French layer, so I can't fully evaluate its quality, but I noticed the mixed EN/FR labels like 'Comptable / Accountant' throughout the UI feel slightly inconsistent — pick a lane per user language preference or make it a clean toggle, not a slash label on every button

### Roadmap to 9.0/10 (low–medium effort, highest ROI)

**Root cause:** The gap between 8.4 and 9.0 is not caused by missing features but by three compounding UX friction points that affect every persona simultaneously. First, the chat interface buries agent selection post-message and front-loads architectural explanations instead of answers — all five personas either explicitly asked for faster routing control or shorter response formats. Second, the settings and dashboard surface too much information density on mobile without a progressive disclosure escape valve, causing navigation scores (the weakest dimension at 7.0–8.0 across personas) to drag down overall averages. Third, the bilingual slash-label pattern and the settings architecture both signal unfinished localization and structural inconsistency to users who notice UI polish — particularly Kevin and Isabelle, whose professional contexts make them hypersensitive to these signals. None of these gaps require new infrastructure: they are all presentation-layer and information-architecture problems solvable in 1–2 sprints.

**Projected score:** 9.0/10

| # | Area | Improvement | Personas | Δ Score | Effort | ROI Note |
|---|------|-------------|----------|---------|--------|----------|
| 1 | chat | Upfront Agent Selector Dropdown + Answer Summary Header | kevin, fatima, dave, marie | +0.25 | low | Impacts chat scores for 4 of 5 personas and requires only UI repositioning of an existing button plus a prompted response format change — no architectural work. |
| 2 | dashboard | Simplified 'Next 2 Dates' Mobile Dashboard Mode Toggle | fatima, dave, marie | +0.2 | medium | Directly resolves Fatima's color-overload complaint and Dave's 'too many features at once' complaint without removing functionality for power users like Marie and Kevin. |
| 3 | navigation | Simplified Settings Architecture — 3-Section Consolidation | fatima, dave, kevin, marie | +0.2 | medium | Navigation is the lowest-scoring dimension across all personas and this change requires no new features — only reorganization of existing settings components, directly lifting navigation scores. |
| 4 | onboarding | Prior-Year Income Inline Entry in Installment Card CTA | marie, dave, kevin, fatima | +0.2 | medium | Directly implements Marie's highest-priority request (in-app revenue refinement) while removing a navigation dead-end that frustrates all personas who encounter the empty installment card state. |
| 5 | language | Language-Consistent UI Labels — Eliminate All Slash Labels | kevin, marie, fatima, dave | +0.15 | low | A pure copy and conditional rendering change across existing components — zero new features — that lifts language scores for both EN-first and FR-first users and signals genuine localization craftsmanship. |

#### Details — 9.0 roadmap

**1. Upfront Agent Selector Dropdown + Answer Summary Header** (chat)
> Replace the post-message 'Choisir un conseiller / Choose advisor' button with a visible segmented control or dropdown directly above the chat input field, showing three options: 'Fiscal / Tax', 'Trésorerie / Cash Flow', 'Général / General' with icons. Default remains auto-route, but the selector is always visible — no hunting required. Additionally, prepend every chat response with a one-line bolded summary (max 12 words) before the detailed answer — e.g., 'Oui, tu dois charger la TVQ sur ce service.' followed by the full explanation. This directly addresses Kevin's Linear-style routing request, Fatima's request for a 3-line max summary, and Dave's desire for answers without AI architecture explanations.

**2. Simplified 'Next 2 Dates' Mobile Dashboard Mode Toggle** (dashboard)
> Add a toggle in the Annual Fiscal Calendar component header — a pill switch labeled 'Vue simplifiée / Simple view' (default on mobile, off on desktop). In Simple View, the calendar collapses to a single card showing only the next 2 upcoming deadlines as large-text chips: date, agency badge (ARC/RQ), and amount if applicable. No color legend, no 12-month grid, no dot system. Full calendar remains accessible via 'Voir tout / See all' text link. Simultaneously, add a dashboard density toggle in Account → Display settings: 'Compact' (shows only Installment card + Next 2 dates card) vs 'Full' (current layout). Default to Compact for users with province set to QC or NB on mobile viewports.

**3. Simplified Settings Architecture — 3-Section Consolidation** (navigation)
> Restructure the Account / Compte settings page from its current 5+ sections into exactly 3 clearly labeled sections with large tap targets (min 56px height on mobile): (1) 'Mon profil / My Profile' — consolidates Profile, Location & Language, and Display theme into one scrollable section with a section header and inline save; (2) 'Fiscalité & Comptable / Tax & Accountant' — consolidates Accountant & Tax Planning and Email notifications into one section, with the prior-year net income field promoted to the top with an amber highlight if not yet filled; (3) 'Confidentialité / Privacy' — contains Danger Zone with right-to-erasure, relabeled with a shield icon instead of a warning label. Remove the slash-label pattern ('Comptable / Accountant') from section headers — use the user's active language only, with a language toggle at the top of the page as the single bilingual entry point.

**4. Prior-Year Income Inline Entry in Installment Card CTA** (onboarding)
> When the Installment Sticky Card shows the 'Enter your income' CTA (income not yet set), clicking it should open an inline expansion of the card itself — not navigate away to Account settings. The card expands to show a single number input field labeled 'Revenu net de l'année passée / Prior-year net income' with a CAD dollar prefix, a one-line explainer ('Used to estimate your quarterly installments'), and a 'Calculer / Calculate' button. On submit, the card immediately recalculates and displays the estimated installment amount with a green confirmation state for 3 seconds. Also add a secondary input — 'Revenu mensuel approximatif / Approximate monthly revenue' (optional, labeled 'Nouveau — affine ton estimation au fil de l'année') — which feeds a running in-year estimate. This addresses Marie's top improvement request and reduces the navigation friction Dave experiences.

**5. Language-Consistent UI Labels — Eliminate All Slash Labels** (language)
> Conduct a full UI audit of every component label, button, tab, and section header that currently uses the 'Word / Mot' bilingual slash pattern. Replace all instances with single-language labels that match the user's active language preference (set during onboarding or in settings). Examples: 'Comptable / Accountant' button in chat header becomes 'Accountant' for EN users and 'Comptable' for FR users. 'Choisir un conseiller / Choose advisor' becomes 'Choose advisor' or 'Choisir un conseiller'. Export buttons follow the same rule. The only exception is the public landing page (which remains fully bilingual). Add a language toggle pill (FR | EN) to the top-right of the app header as a persistent, one-tap language switcher — so users can flip without going to settings. This directly addresses Kevin's slash-label inconsistency complaint and reinforces the language-first positioning for Marie.

### Roadmap to 9.5/10 (from 9.0 baseline)

**Root cause:** After the 9.0 fixes address presentation-layer friction, the remaining gap to 9.5 is structural: the product has three architectural ceilings that cap its score for the personas most likely to expand revenue. First, the single-account model makes the product fundamentally unusable as a practice tool for Isabelle's persona — the bookkeeper/advisor channel — which represents the highest-leverage customer acquisition path (one Isabelle brings 12 SMBs). Second, the chat's three-agent architecture, while technically sound, surfaces as a limitation rather than a feature when users ask multi-domain questions, which Marie articulates with precision and which represents a recurring real-world use case for mixed fiscal/trésorerie decisions. Third, the product lacks any integration surface for power users like Kevin, who judge tools by their composability with existing workflows — at $49/month, the absence of a webhook or API token is a churn risk for the segment most likely to evangelize the product to other contractors. These are not polish issues; they are capability gaps that require deliberate architectural investment to close.

**Projected score:** 9.5/10

| # | Area | Improvement | Personas | Δ Score | Effort | ROI Note |
|---|------|-------------|----------|---------|--------|----------|
| 1 | chat | Cross-Agent Hybrid Query Handling — 'Multi-Advisor' Thread Mode | marie, fatima, dave | +0.2 | high | Marie's hybrid-question use case is the single most specific and actionable improvement request in the dataset — implementing it turns the three-agent architecture from a limitation into a visible differentiator that no Canadian SMB competitor currently offers. |
| 2 | onboarding | Push Notification Opt-In — Native Mobile PWA Deadline Alerts | marie, fatima, dave | +0.2 | high | Push notifications directly prevent the missed-deadline scenario that is the core emotional purchase driver for the majority of personas — Marie's $400 penalty story is the most compelling retention and acquisition narrative in the dataset, and this feature makes that story impossible to repeat. |
| 3 | dashboard | Bookkeeper / Multi-Client Switcher — Partner Tier Foundation | isabelle | +0.15 | high | Isabelle's persona represents the bookkeeper/advisor channel — converting one Isabelle from 'recommends to clients' to 'bills to practice' unlocks 10–12x the revenue per acquired user and transforms the product's B2B referral flywheel. |
| 4 | ui_ux | Zapier / Make Webhook Integration + API Token for Pro Users | kevin, isabelle | +0.15 | high | At $49 CAD/month, Kevin explicitly benchmarks against his own billable rate — API/Zapier access is the specific feature class that converts the product from 'useful tool' to 'infrastructure' in a developer-minded contractor's stack, dramatically reducing churn risk. |
| 5 | chat | AI Memory Audit Trail + Mem0 Sub-Processor Disclosure Panel | isabelle, kevin, marie | +0.1 | medium | Isabelle's privacy concerns are professionally grounded in real PIPEDA/Law 25 compliance obligations — resolving them converts the product from a referral tool into billable practice infrastructure and signals enterprise-grade privacy readiness to the bookkeeper/accountant channel. |

#### Details — 9.5 roadmap

**1. Cross-Agent Hybrid Query Handling — 'Multi-Advisor' Thread Mode** (chat)
> Introduce a 'Question complexe / Complex question' mode triggered automatically when the AI detects query intent spanning two agent domains (e.g., 'Can I defer my installment if cash flow is bad?' triggers both Tax and Cash Flow agents). In this mode, the chat UI shows a split response card with two labeled sections — 'Fiscal:' and 'Trésorerie:' — each answered by the respective specialist agent, followed by a one-sentence synthesis labeled 'En résumé / Bottom line:'. The detection logic uses keyword co-occurrence (installment + cash + month, etc.) and can be manually triggered via a new 'Question complexe' chip added to the industry context chip row. This directly addresses Marie's most specific and well-articulated pain point and would also benefit Dave and Fatima who ask mixed questions without realizing it.

**2. Push Notification Opt-In — Native Mobile PWA Deadline Alerts** (onboarding)
> Implement Web Push Notifications (PWA) with an opt-in prompt triggered at the end of the onboarding wizard, step 4 — after the Pro trial confirmation screen. The prompt shows: 'Recevoir des alertes avant vos échéances / Get deadline alerts before due dates' with three preset reminder options presented as toggleable chips: '3 jours / 3 days', '7 jours / 7 days', '14 jours / 14 days' (matching existing email reminder options in Account settings). Push notifications fire for every event in the Annual Fiscal Calendar that matches the user's province. Notification copy follows the active language: 'Rappel ARC — Acompte provisionnel dû dans 7 jours: ~$6,796'. Settings page gains a 'Notifications push / Push alerts' subsection under 'Fiscalité & Comptable' showing toggle + configured lead times. This is Marie's single highest-priority improvement request and addresses a genuine behavioral reality (restaurateurs don't read emails during service).

**3. Bookkeeper / Multi-Client Switcher — Partner Tier Foundation** (dashboard)
> Introduce a 'Business' tier feature: a client-switcher dropdown in the top navigation bar (replacing the user avatar menu on desktop, accessible via a 'Mes clients / My clients' entry on mobile nav). From this switcher, a bookkeeper or accountant can add up to 12 client profiles, each with their own province, tax context, and installment data, and switch between them without logging out. Each client profile is a separate data silo (separate Supabase row, separate Mem0 namespace) with full Law 25 sub-processor disclosure per client shown in the client profile creation flow. The 'Accountant export PDF' is enhanced to include the client's business name and a co-signature line. This is the single change Isabelle explicitly named as the blocker to her $49/month purchase decision — she represents an entire channel of bookkeeper/advisor referral customers who would each bring multiple SMB clients.

**4. Zapier / Make Webhook Integration + API Token for Pro Users** (ui_ux)
> Add an 'Intégrations / Integrations' section to Account settings (visible to Pro and Business tier users only) containing: (1) a personal API token generator with one-click copy and a 'Révoquer / Revoke' button; (2) a Zapier 'Connect' button that deep-links to an Agent SMB Zapier app with pre-built triggers: 'New deadline within 14 days', 'Installment amount updated', 'New AI memory saved'; (3) a Make (Integromat) webhook URL field. Each trigger sends a JSON payload with: deadline date, agency (ARC/RQ), event type, estimated amount, and user language. Documentation link opens a lightweight bilingual docs page hosted on a /docs subdomain. This directly addresses Kevin's most specific and technically-grounded improvement request and is table-stakes for the $49/month price point for tech-forward contractor users.

**5. AI Memory Audit Trail + Mem0 Sub-Processor Disclosure Panel** (chat)
> Add a 'Mémoire IA — Audit / AI Memory Log' expandable panel inside the Documents / Mémoire page. For each stored memory, show: the exact text stored, the date it was created, the agent that created it (Tax/Cash Flow/General), the session ID it originated from, and a 'Source: Mem0 (sous-traitant / sub-processor)' badge that links to a dedicated Privacy Architecture page. The Privacy Architecture page (accessible from footer and Danger Zone) explains in plain language: what Mem0 stores, where it is hosted, that it is contractually prohibited from training on user data, the retention period (deleted within 30 days of account deletion), and the PIPEDA/Law 25 sub-processor classification. The Danger Zone right-to-erasure confirmation modal is updated to explicitly confirm 'Vos données Mem0 seront supprimées dans 72 heures / Your Mem0 data will be deleted within 72 hours' with a timestamp. This directly addresses Isabelle's most detailed and professionally-grounded concern and also pre-empts regulatory scrutiny as Law 25 enforcement matures.

### $49 CAD Pricing Analysis

At $49 CAD/month, the only persona who declined to pay is Isabelle — and her objection is structural rather than price-sensitive: she would pay $49 per client but cannot justify a single-login tool for a 12-client practice. The four personas who accepted $49 all anchor their willingness on a specific avoided cost (Marie's $400 penalty, Kevin's one billable hour, Fatima's one accountant hour, Dave's one accountant call), which means the price is defensible as long as the product demonstrably prevents a concrete loss or substitutes a concrete expense. The single highest-impact change to improve willingness to pay across the board — particularly to reduce future price-sensitivity as the market matures — is to introduce a 'Bookkeeper / Partner' seat model under the Business $99 CAD/month tier that allows up to 12 client profiles under one login, which would immediately convert Isabelle from a zero-revenue referral source into a $99/month subscriber and would reframe the pricing ladder (Free → Pro → Business) as a genuine SMB-to-practice progression rather than a message-count upsell, making the $49 Pro tier feel even more clearly targeted and justified for individual SMB owners.

---

## Iteration 3 — Average Score: **8.4/10**

| Persona | Onboard | Dashboard | Chat | UI/UX | Navigation | Language | **Overall** | Pay $49? |
|---------|---------|-----------|------|-------|------------|----------|-------------|----------|
| Marie Tremblay | 9 | 9 | 8 | 9 | 8 | 10 | **8.8** | ✅ |
| Kevin Zhang | 9 | 9 | 8 | 8 | 9 | 7 | **8.3** | ✅ |
| Fatima Ouali | 8 | 9 | 9 | 8 | 8 | 7 | **8.2** | ✅ |
| Dave Bouchard | 8 | 9 | 8 | 8 | 7 | 9 | **8.2** | ✅ |
| Isabelle Roy | 9 | 8 | 9 | 9 | 8 | 9 | **8.7** | ❌ |

### What they said

> **Marie Tremblay:** "C'est la première fois qu'un outil me parle vraiment comme une restauratrice québécoise — en français, avec mes taxes provinciales, et mon prochain acompte affiché en gros dès que j'ouvre l'application."  
> **Kevin Zhang:** "This is the first Canadian business tool I've tested that actually feels like it was built for how CRA works, not just a US fintech app with a maple leaf slapped on the pricing page."  
> **Fatima Ouali:** "C'est la première appli d'affaires où j'ai pas eu envie de fermer l'écran après deux minutes — elle me parle de mon salon, pas d'une grande entreprise."  
> **Dave Bouchard:** "I've seen software that made me feel stupid for not having a computer science degree — this one actually seems to know I'm a contractor in Moncton, not a startup guy in San Francisco."  
> **Isabelle Roy:** "The Law 25 implementation and Quebec tax accuracy are genuinely impressive, but until there's a multi-client mode, this is a great tool for my clients to use themselves — not a tool I can use professionally on their behalf."  

### Common themes

**👍 Most liked:**
- La carte d'acompte trimestriel toujours visible — voir mon $6,796 dû le 15 juin directement sur le tableau de bord, sans chercher, c'est exactement ce dont j'avais besoin après ma pénalité de $400 l'an dernier
- Le calendrier fiscal avec les badges ARC en rouge et RQ en bleu — je sais immédiatement qui veut quoi et quand, c'est clair comme de l'eau de roche pour une restauratrice au Québec
- L'interface en français dès le départ, professionnelle comme QuickBooks mais sans me faire sentir comme si j'avais besoin d'un diplôme en informatique pour m'en servir
- The installment sticky card is genuinely the killer feature for me — seeing '$6,796 / trimestre due Jun 15' without digging through a menu is exactly what I needed, and no other tool I've used (not FreshBooks, not Wave) surfaces this so cleanly
- Tax agent quality feels legitimately Canadian — CPP at 5.95%, T2125 auto-detection, CRA citations — this is not a generic GPT wrapper with 'consult a professional' slapped on every response, it clearly knows the difference between a T4A contractor and a T2 corp
- The no-credit-card 14-day Pro trial combined with the persistent message counter is honest SaaS design — I never felt like I was being manipulated into a paywall, which is rare and builds real trust

**🔧 Most wanted improvements:**
- Un rappel push sur mon téléphone 7 jours avant chaque échéance — le courriel mensuel c'est bien, mais quand je suis dans le rush du service du vendredi soir, c'est une notification directe sur mon écran qui va vraiment m'empêcher de manquer une date
- Une intégration avec mon système de caisse ou au moins une façon d'importer mes revenus hebdomadaires sans tout entrer à la main — comme restauratrice, mes chiffres changent vite et je veux que les calculs d'acomptes reflètent ma réalité actuelle, pas juste l'année passée
- Un guide de démarrage rapide de 2-3 minutes en vidéo en français — j'ai compris l'essentiel, mais pour montrer l'app à ma commis-comptable, un petit vidéo québécois ferait toute la différence
- As an Ontario-based contractor I have zero need for RQ/Revenu Québec UI elements, but I still noticed the bilingual scaffolding adds some cognitive noise — I'd want a cleaner 'Ontario solo contractor' mode that strips the QC-specific UI entirely rather than just hiding it
- The three export options (MD, PDF, Accountant PDF) are great in theory but I'd want API or Zapier integration to push that accountant-formatted PDF directly to my Google Drive or email thread — opening a mailto is a 2015 solution for a 2025 tool
- Chat agent auto-routing is smart but I want transparency into *why* it routed me to Tax vs Cash Flow — even a one-line 'Routed to Tax agent because your question references T2125 deductions' would satisfy my inner power user and build trust in the system

### Roadmap to 9.0/10 (low–medium effort, highest ROI)

**Root cause:** The gap between 8.4 and 9.0 is not architectural — the core features (installment card, fiscal calendar, bilingual tax agent) are already scoring 8–9 individually. The drag comes from three converging friction points: (1) a single confusing onboarding field (prior-year income) that blocks the app's best feature before users ever see it, (2) dashboard information density that alienates the less technical half of the user base (Dave, Fatima) without offering an escape valve, and (3) the chat experience being slightly opaque (routing feels like a black box to Kevin, responses feel too long on mobile for Fatima) and the export UX using technical vocabulary that excludes non-power users. All five improvements above are surface-level changes — copy, layout hierarchy, a toggle — that require no new backend services, no new agents, and no schema migrations. They affect 3–4 personas each and target the exact friction points named explicitly across the reviews.

**Projected score:** 9.05/10

| # | Area | Improvement | Personas | Δ Score | Effort | ROI Note |
|---|------|-------------|----------|---------|--------|----------|
| 1 | onboarding | Add inline placeholder examples to prior-year net income field | fatima, marie, dave | +0.15 | low | A single field-level copy change unblocks the installment card for every new user who skips income entry due to confusion, directly unlocking the app's highest-rated feature for more users at onboarding. |
| 2 | dashboard | Add 'Simple mode' toggle to collapse dashboard to 3 essential widgets | dave, fatima, marie | +0.2 | medium | Dashboard cognitive overload is the single most cited UI friction across 3 of 5 personas and reducing it increases daily retention — the metric most correlated with Pro conversion and renewal at $49/month. |
| 3 | chat | Add one-line routing transparency label and shorten mobile chat responses with expandable 'Voir plus' | kevin, fatima, dave | +0.2 | medium | Routing transparency converts power users like Kevin from skeptics into advocates, while response truncation directly reduces the mobile UX friction that Fatima cited as her top improvement — together these raise the chat score for 3 personas without any model or backend changes. |
| 4 | navigation | Replace 3-button export row with a single 'Envoyer à mon comptable / Send to Accountant' primary CTA plus collapsed secondary options | dave, fatima, marie | +0.15 | low | Export is a retention-driving feature (it creates a professional output users share externally) but is currently invisible to non-technical users because three equal-weight buttons with jargon labels diffuse attention — making the primary job-to-be-done the default action is a zero-backend copy and layout change with direct impact on perceived professionalism. |
| 5 | onboarding | Add 2-minute bilingual Quebec French onboarding video on the post-signup confirmation screen | marie, fatima, isabelle | +0.15 | medium | A short contextual video on the confirmation screen (highest-attention moment in the funnel) reduces trial abandonment for Quebec FR users who feel uncertain after signup, and gives bookkeepers a shareable link to hand to clients — a zero-code-change distribution lever once the video is produced. |

#### Details — 9.0 roadmap

**1. Add inline placeholder examples to prior-year net income field** (onboarding)
> On the onboarding Step 3 (Tax Context) and the Account → Comptable section, add a gray placeholder text inside the net income input field reading 'ex: 45 000 $' and add a one-line helper text below the field: 'Trouvez ce montant à la ligne 23600 de votre déclaration T1 / Find this on line 23600 of your T1 return.' On mobile, trigger a numeric keyboard. This eliminates the drop-off point Fatima identified without adding a new screen or step.

**2. Add 'Simple mode' toggle to collapse dashboard to 3 essential widgets** (dashboard)
> Add a persistent toggle in the dashboard header — a pill-shaped button labeled 'Vue simplifiée / Simple view' — that collapses the 4-widget grid and the fiscal calendar to show ONLY: (1) the installment sticky card, (2) a single next-deadline chip, and (3) a direct chat entry box. The toggle state is saved to user profile (profiles table). Default to Simple view for users who selected 'Contractor' or 'Trades' in onboarding. Power users (bookkeepers, tech-savvy) default to full view. This directly addresses Dave's 'cockpit' complaint without removing features other personas rely on.

**3. Add one-line routing transparency label and shorten mobile chat responses with expandable 'Voir plus'** (chat)
> Two targeted chat changes: (1) Immediately below the agent header when auto-routing occurs, render a single gray italic line: 'Dirigé vers l'agent Fiscalité · question liée au T2125 / Routed to Tax agent · T2125 deduction detected' — derived from the routing trigger keyword already known server-side. (2) For chat responses exceeding 250 words on mobile viewports (<768px), auto-truncate to the first 3 sentences and append a tappable 'Voir la réponse complète / See full answer ▾' inline expander. Full response is pre-loaded in DOM, no second API call. This addresses Kevin's trust request and Fatima's scrolling fatigue simultaneously.

**4. Replace 3-button export row with a single 'Envoyer à mon comptable / Send to Accountant' primary CTA plus collapsed secondary options** (navigation)
> In the chat desktop header, replace the three separate export buttons (MD, PDF, Accountant PDF) with one primary amber button labeled 'Envoyer à mon comptable / Send to Accountant' that directly triggers the pre-filled mailto with the accountant-formatted PDF attached (using the stored accountant email). Add a small '⋯ Plus d'options / More options' text link beside it that expands an inline dropdown revealing the .md and raw PDF downloads for power users. If no accountant email is stored, the primary button instead reads 'Configurer mon comptable / Set up accountant' and links to Account → Comptable. This collapses cognitive load for Dave while preserving Kevin's advanced options.

**5. Add 2-minute bilingual Quebec French onboarding video on the post-signup confirmation screen** (onboarding)
> On the post-magic-link confirmation screen (the 'Vérifiez votre courriel' page shown after signup), embed a hosted video player (Loom or equivalent, <2 min) showing a Quebec French narrator walking through: dashboard installment card, fiscal calendar badge colors, and sending to accountant. Add an EN equivalent triggered by detected language. The video thumbnail should show a recognizable Quebec SMB context (restaurant/salon setting, not a stock office). Add a 'Passer / Skip' link below. Video is hosted on CadieuxAI CDN (Canadian hosting). This directly fulfills Marie's top request and helps bookkeepers like Isabelle onboard their clients without live demos.

### Roadmap to 9.5/10 (from 9.0 baseline)

**Root cause:** After the 9.0 improvements, the remaining gap to 9.5 is structural rather than cosmetic. Four issues persist: (1) The app is still passive — it waits to be opened rather than proactively alerting users to deadlines, which undermines its core 'never miss a CRA date' promise for users who are in the middle of a restaurant service or a job site; (2) The installment card, while excellent as a display element, is static — it doesn't reflect income variability or let users model scenarios, limiting its value for anyone whose income fluctuates (Marie, contractors); (3) The French conversational register remains slightly formal-translated rather than authentically Québécois, which creates a subtle trust deficit for native French speakers who are the highest-LTV segment given provincial tax complexity; and (4) The Business tier has no structural reason to exist for the bookkeeper/accountant segment — Isabelle's non-conversion is not a pricing problem but a product-market fit gap (missing multi-client isolation) that, once solved, unlocks a B2B2C referral channel worth multiples of direct SMB acquisition.

**Projected score:** 9.5/10

| # | Area | Improvement | Personas | Δ Score | Effort | ROI Note |
|---|------|-------------|----------|---------|--------|----------|
| 1 | dashboard | Push notification system with configurable deadline alerts (7-day, 3-day, day-of) | marie, fatima, dave | +0.2 | high | Push notifications are the single most-requested feature by name across the reviews (Marie explicitly, Dave implicitly via 'phone call avoided') and transform the app from passive reference tool to active compliance guardian — the core emotional value proposition at $49/month — dramatically reducing churn from users who forget to open the app between deadlines. |
| 2 | ui_ux | Ontario/province-specific UI mode that suppresses all RQ/Revenu Québec components for non-QC users | kevin, dave | +0.15 | medium | Kevin's 'cognitive noise' complaint represents the entire non-Quebec English Canada market — the majority of Canadian SMBs by volume — and province-aware UI filtering positions the app as the clean, purpose-built Ontario contractor tool rather than a Quebec-first product with bilingual scaffolding, directly improving conversion and NPS in the largest TAM segment. |
| 3 | chat | Natural conversational tone pass for French responses with Quebec SMB register and mobile-first response format | fatima, marie, dave | +0.15 | medium | Language register and response length are the top two chat improvement requests from both French-speaking personas and fixing them via prompt engineering (no model change, no infrastructure cost) directly raises the chat score from 8–9 to 9–10 for the Quebec market — the highest-LTV segment given Law 25 compliance requirements and provincial tax complexity. |
| 4 | dashboard | Multi-scenario installment modeler widget with income change slider | marie, isabelle, kevin | +0.15 | medium | The installment card is already the highest-rated feature across all personas — adding a what-if modeler on the same card surface extends its value from static reference to active planning tool, directly increasing daily active use and justifying the $49/month price point through demonstrated ongoing utility rather than one-time setup value. |
| 5 | navigation | Bookkeeper multi-client switcher with isolated memory contexts (Business tier feature) | isabelle | +0.2 | high | Isabelle represents the bookkeeper/accountant segment who, if converted, brings 10–15 SMB clients into the ecosystem through referral and direct onboarding — a single bookkeeper tier sale at $99/month generates equivalent or greater LTV than 3–4 individual Pro subscriptions and creates a B2B2C distribution channel that requires no additional marketing spend. |

#### Details — 9.5 roadmap

**1. Push notification system with configurable deadline alerts (7-day, 3-day, day-of)** (dashboard)
> Implement web push notifications (PWA Service Worker + push API, no native app required) with opt-in prompt triggered after the user's first viewed deadline in the fiscal calendar. Default subscription to 7-day pre-deadline alerts. In Account → Email Notifications, add a second section 'Notifications push / Push alerts' with toggles for 7 days, 3 days, and day-of per deadline type (installments, GST/HST remittances, filing dates). Notification body should read: 'Acompte CRA dû dans 7 jours — 6 796 $ le 15 juin. Ouvrir AgentSMB.' Notification icon uses the amber installment card color for installments, red for filing. No native iOS/Android app required — works via Chrome/Safari on mobile and desktop. Backend: add a scheduled job (cron) that queries upcoming deadlines from the calendar against subscribed users' push tokens and fires via Web Push Protocol.

**2. Ontario/province-specific UI mode that suppresses all RQ/Revenu Québec components for non-QC users** (ui_ux)
> Add a province-aware rendering layer that, for users with province set to ON/BC/AB/MB/SK/NS/NL/PE, completely removes from the DOM (not just hides with CSS): (1) the RQ blue badge and fleur-de-lis from the fiscal calendar legend, (2) all RQ-tagged calendar events, (3) any RQ/TVQ/RRQ references in chat context chips, and (4) the bilingual FR/EN toggle if the user has never changed language from EN default. Replace the calendar legend with a simplified 'CRA Federal' single-authority version. In Account → Location, add an explicit label: 'Your province: Ontario — Revenu Québec items are hidden. Change province to update.' This is a rendering logic change using the already-stored province field, not a new data architecture.

**3. Natural conversational tone pass for French responses with Quebec SMB register and mobile-first response format** (chat)
> Implement a system-prompt layer (applied before every FR-language response generation) that enforces: (1) Quebec conversational register — 'vous' formal but warm, contractions like 'c'est', 'ça', regional fiscal vocabulary like 'acompte provisionnel' rather than 'versement', (2) a mandatory response structure for mobile: lead with a 1-sentence direct answer in bold, then a maximum 3-bullet breakdown, then an optional 'En savoir plus ▾' expander section for full detail. Add a dedicated QC SMB tone guide as a pinned system message in the FR chat agent prompt, referencing persona archetypes (restauratrice, coiffeuse, entrepreneur en construction). This does not change the AI model — it is a prompt engineering and response formatting change in the chat API layer.

**4. Multi-scenario installment modeler widget with income change slider** (dashboard)
> Add a new collapsible section below the installment sticky card titled 'Simulateur d'acomptes / Installment Modeler'. It contains: (1) a slider or input field 'Revenu net estimé cette année / Estimated net income this year' pre-filled with prior-year income, (2) real-time recalculation of the quarterly installment amount as the user adjusts the slider (client-side JS, no API call — formula is prior-year net × marginal rate ÷ 4), (3) a comparison line showing 'Méthode 1 (année précédente): X $ vs Méthode 2 (revenus actuels): Y $' with a one-line CRA explanation of the two installment methods, (4) a 'Mettre à jour mon profil / Update my profile' button that saves the new income estimate to Account → Comptable. This addresses Isabelle's 'what if income changes' need and Marie's 'my numbers change fast as a restaurateur' concern without requiring multi-client architecture.

**5. Bookkeeper multi-client switcher with isolated memory contexts (Business tier feature)** (navigation)
> In the Business tier ($99/mo), add a 'Clients' top-nav item that renders a client switcher sidebar. Each client is a sub-profile (new 'client_profiles' table linked to the bookkeeper's master account_id) with isolated: business name, province, tax context, prior-year income, and — critically — a separate Mem0 namespace/collection_id so that AI memories from Client A are physically isolated from Client B at the API query level. The dashboard, chat, fiscal calendar, and installment card all re-render using the active client profile context. Add a persistent top-bar banner (amber, 4px height, subtle) showing the active client name: 'Contexte actif: Salon Bella | Changer de client ▾'. Account deletion for a client sub-profile triggers Mem0 namespace deletion for that client only, maintaining Law 25 compliance per client. This directly converts Isabelle's 'False' on willingness to pay into a 'True' for the Business tier.

### $49 CAD Pricing Analysis

At $49 CAD/month, the persona most at risk of churn is Isabelle Roy — she explicitly declined and her objection is architectural, not price-sensitive: she is being asked to pay more than QuickBooks Simple Start for a tool that cannot serve her actual workflow of 12 client contexts. Dave Bouchard is the second churn risk: his willingness to pay is real but fragile ('pays for itself before lunch') and depends entirely on the app actively preventing a missed deadline — if he goes two months without a push notification and relies on the monthly email digest alone, the $49/month will feel passive and unearned. The single change that would most improve willingness to pay across all five personas is the push notification system (Roadmap 9.5, Rank 1): it transforms the product's value from 'reference tool I might remember to open' to 'compliance guardian that interrupts my workday before I miss a $400 CRA penalty' — which is the exact ROI frame that Marie, Dave, Kevin, and Fatima all used to justify the price point in their own words, and which would make the $49/month feel like a recurring insurance premium rather than a software subscription they have to remember to use.

---

## Iteration 4 — Average Score: **8.4/10**

| Persona | Onboard | Dashboard | Chat | UI/UX | Navigation | Language | **Overall** | Pay $49? |
|---------|---------|-----------|------|-------|------------|----------|-------------|----------|
| Marie Tremblay | 9 | 9 | 8 | 9 | 8 | 10 | **8.8** | ✅ |
| Kevin Zhang | 9 | 9 | 8 | 8 | 9 | 7 | **8.3** | ✅ |
| Fatima Ouali | 8 | 9 | 9 | 8 | 8 | 7 | **8.2** | ✅ |
| Dave Bouchard | 8 | 9 | 8 | 8 | 7 | 9 | **8.2** | ✅ |
| Isabelle Roy | 9 | 9 | 8 | 9 | 8 | 9 | **8.7** | ❌ |

### What they said

> **Marie Tremblay:** "Ça fait des années que je cherche quelque chose qui comprend vraiment la réalité d'une restauratrice au Québec — TPS, TVQ, RQ, ARC — et là pour la première fois j'ai l'impression que l'outil a été fait pour moi, pas traduit en français à la dernière minute."  
> **Kevin Zhang:** "This is the first Canadian business tool I've used that actually knows I owe installments quarterly and tells me the number upfront — everything else makes me dig for that, and I'm already thinking about how to pipe this data into my own dashboards."  
> **Fatima Ouali:** "C'est la première appli d'affaires qui me répond en français comme si elle savait que j'ai un salon à Laval et pas une compagnie de construction à Toronto."  
> **Dave Bouchard:** "I'm not a tech guy but this thing actually told me what I needed to know without making me feel stupid — that's worth something."  
> **Isabelle Roy:** "The Law 25 implementation is the most credible I've seen in a Canadian SaaS tool, but until there's a proper bookkeeper or accountant mode with isolated client profiles, I can admire it from a distance — I'm not mixing Madame Tremblay's TVQ remittances with Monsieur Gagnon's installment history in the same AI memory."  

### Common themes

**👍 Most liked:**
- La carte d'acompte provisionnel toujours visible — voir mon prochain versement de $6,796 directement sur le tableau de bord sans chercher, c'est exactement ce qu'il me fallait après ma pénalité de 400$ l'an dernier
- Le calendrier fiscal avec les badges ARC en rouge et RQ en bleu, et l'export .ics pour l'ajouter à mon calendrier — enfin je peux voir toutes mes échéances Revenu Québec ET fédérales au même endroit
- L'interface en français dès le départ parce que je suis au Québec, et le ton professionnel qui ressemble à un vrai outil comptable, pas une application pour geeks de la Silicon Valley
- The installment sticky card is genuinely brilliant — showing my exact quarterly CRA installment amount ($6,796) without me having to navigate anywhere is the kind of zero-friction UX that most fintech tools completely miss
- Tax agent quality feels legitimately Canadian-specific: CPP at 5.95%, T2125 auto-detection, and actual CRA publication citations instead of generic 'consult a professional' deflection — that's rare and valuable
- The persistent message counter with the amber/red threshold progression is honest UX design — no surprise paywalls mid-conversation is a trust signal I genuinely appreciate as someone who's been burned by manipulative SaaS upgrade flows before

**🔧 Most wanted improvements:**
- Je voudrais une intégration directe avec mon système de caisse ou mon logiciel comptable — entrer mon revenu net manuellement une fois c'est correct, mais si les chiffres changent en cours d'année, j'ai peur d'oublier de mettre à jour
- Les rappels par courriel sont bien, mais j'aimerais aussi recevoir une notification push sur mon téléphone 7 jours avant une échéance — quand je suis dans le rush du restaurant, les courriels se perdent facilement
- Le chat avec 50 messages par mois en version gratuite me semble un peu serré pour tester vraiment l'outil — en période de remises de TPS/TVQ j'ai beaucoup de questions et j'aurais peur de manquer de messages
- As an Ontario-based contractor I'll never see RQ events, but I'd want the fiscal calendar to let me filter by deadline type — right now even within federal deadlines, I want to pin just installment dates and collapse everything else so it's more like my Linear board and less like a generic calendar dump
- The chat agent auto-routing is smart in theory but I'd want transparency on *why* it routed me — something like a subtle inline label 'Routed to: Tax Agent — because your question mentioned T2125' would satisfy my technical curiosity and build more trust than a black-box redirect
- At $49 CAD/month I'm comparing this to a Notion AI subscription plus a few hours of my accountant's time — the value proposition holds, but I'd want an API or Zapier integration so I can pull installment dates and deadlines into my own workflow tooling rather than living exclusively in this dashboard

---

## Final Summary

- **Final average score:** 8.4/10
- **Would pay $49 CAD/mo:** 4/5 personas
- **Target reached:** ❌ Not yet
- **Iterations run:** 4