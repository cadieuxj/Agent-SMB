# Agent SMB — Pilot Customer Feedback Report

_Generated: 2026-05-17 11:38_

---

## Iteration 1 — Average Score: **8.3/10**

| Persona | Onboard | Dashboard | Chat | UI/UX | Navigation | Language | **Overall** | Pay $29? |
|---------|---------|-----------|------|-------|------------|----------|-------------|----------|
| Marie Tremblay | 9 | 9 | 8 | 9 | 8 | 10 | **8.8** | ✅ |
| Kevin Zhang | 8 | 8 | 9 | 7 | 8 | 7 | **7.8** | ✅ |
| Fatima Ouali | 8 | 9 | 9 | 8 | 8 | 9 | **8.5** | ✅ |
| Dave Bouchard | 8 | 9 | 8 | 8 | 7 | 8 | **8.0** | ✅ |
| Isabelle Roy | 8 | 9 | 9 | 8 | 8 | 9 | **8.5** | ✅ |

### What they said

> **Marie Tremblay:** "C'est la première fois qu'une application me parle vraiment comme une restauratrice québécoise et pas comme si j'étais une startup de Toronto — le français est impeccable et elle connaît Revenu Québec, pas juste Ottawa."  
> **Kevin Zhang:** "This is the first Canadian business AI that doesn't feel like ChatGPT with a maple leaf slapped on it — the CRA citations and T2125 awareness are doing real work, though the theme inconsistency and hidden agent routing tell me this is still a v1 that a careful PM needs to pressure-test end-to-end."  
> **Fatima Ouali:** "Enfin une application qui me parle comme une vraie personne et qui connaît les règles du Québec — pas juste des réponses génériques copiées d'internet."  
> **Dave Bouchard:** "I came in expecting some Silicon Valley nonsense and instead it just told me my GST is due April 30th and what form to use — that's the whole ballgame right there."  
> **Isabelle Roy:** "The Revenu Québec source badges and T2125 vs T2 distinction tell me someone who actually understands Quebec tax built this — but I'm not recommending it to a single client until I see a self-serve data deletion flow and a clear subprocessor retention schedule that holds up under Loi 25 scrutiny."  

### Common themes

**👍 Most liked:**
- Le widget 'Prochaine échéance' en gros en haut du tableau de bord — c'est exactement ce dont j'ai besoin, je n'aurais pas raté ma date limite de l'an passé avec ça
- Les rappels par courriel avec choix de 3, 7 ou 14 jours avant — simple, pratique, je peux configurer ça en 30 secondes entre deux services
- Les badges sources 'ARC/CRA' ET 'Revenu Québec' séparés dans les réponses — enfin un outil qui comprend qu'on a deux gouvernements à satisfaire au Québec
- The Tax agent actually knows what T2125 vs T2 means and leads with the answer — that's the first AI tool I've used that didn't just say 'consult a CPA' and call it day; the CPP rate and form number citations feel genuinely useful
- Business-type-specific starter prompts are a sharp UX call — seeing 'Am I better off incorporated (T2) or sole proprietor (T2125)?' on the empty chat state as an IT contractor immediately signals this tool actually knows my context, not just a generic SMB wrapper
- Email deadline reminders with configurable lead times (3/7/14 days) plus a proper bilingual HTML email is exactly the quarterly installment nudge I wanted — this alone justifies the free tier for freelancers who lose track of June 15 deadlines

**🔧 Most wanted improvements:**
- Je voudrais pouvoir connecter mon logiciel de caisse ou mon comptable directement — pour l'instant je dois quand même tout ressaisir manuellement, ce qui prend du temps quand on gère un resto
- Les réponses fiscales sont bonnes mais j'aimerais une confirmation claire que l'information s'applique bien aux restaurants spécifiquement, pas juste aux PME en général — la TVQ sur les repas c'est un cas particulier
- Le PDF export c'est bien mais j'aurais besoin de pouvoir l'envoyer directement à mon comptable depuis l'appli — copier-coller un fichier Markdown c'est pas vraiment dans mes habitudes
- The light mode default is fine for mass-market adoption but the design description still reads 'deep navy-black' in several places — there's an internal contradiction in the spec that suggests the theme toggle UX might be confusing or visually inconsistent depending on which components got updated; I'd want to audit whether dark/light modes are truly cohesive or patchwork
- The auto-routing that hides agent selection from users is a regression for power users — I appreciate that Expert Mode toggle exists, but it should be more discoverable; burying it means I spent time wondering why a cash flow question got routed to the general advisor before I found the override
- PDF and Markdown export is great but I'd want webhook or Zapier integration so I can pipe conversation summaries into my Notion client folders automatically — right now it's still a manual step, and for a contractor billing multiple clients the context-switching cost adds up fast

### UI/UX Synthesizer Recommendations

**Root cause:** The app already exceeds the 8.0 target at 8.3, but the remaining friction clusters around three compounding gaps that affect different personas for different reasons but share the same root: the app was designed around a technically confident solo user on desktop, not the actual diversity of the SMB audience. First, trust and compliance infrastructure is incomplete for professional users like Isabelle — the Loi 25 self-serve deletion gap is a hard blocker that suppresses her scores and limits her referral potential to 12 other SMBs. Second, export and share flows use developer-facing language ('Markdown', 'export') that creates confusion and friction for mobile-first, non-technical users like Fatima and Marie who just want to text something to their accountant. Third, the chat UI tries to serve two contradictory user types — power users who want agent control (Kevin) and users who want complete invisibility (Dave, Fatima) — without a clean adaptive solution, leaving both groups mildly dissatisfied. These are not deep product problems; they are surface-level UX polish issues that can be resolved with copy changes, a self-serve deletion flow, and a context-aware mobile response format — all achievable within one sprint cycle.

**Projected score after improvements:** 8.7/10

| # | Area | Improvement | Personas affected | Δ Score | Effort |
|---|------|-------------|-------------------|---------|--------|
| 1 | ui_ux | Self-Serve Account Deletion + Data Retention Schedule Page | isabelle, marie, fatima, kevin | +0.25 | medium |
| 2 | chat | Replace Markdown Export CTA with 'Send to Notes / Save as PDF' Plain-Language Actions | marie, fatima, dave, isabelle | +0.2 | low |
| 3 | onboarding | Add 60-Second Business-Type Video + Contextual First-Action Prompt on Step 4 | fatima, marie, dave | +0.15 | medium |
| 4 | chat | Mobile-Optimized 'Short Answer' Response Mode with Inline Expand | fatima, dave, marie | +0.15 | medium |
| 5 | navigation | Make Expert Mode Toggle Prominent + Add Plain-English 'Why This Agent?' Disclosure | kevin, dave, fatima, isabelle | +0.1 | low |

#### Detailed improvements

**1. Self-Serve Account Deletion + Data Retention Schedule Page** (ui_ux)
> Add a 'Supprimer mon compte / Delete My Account' button directly in Settings → Privacy section (not behind a contact form). Clicking it shows a confirmation modal with: (1) exactly what data will be deleted, (2) a 30-day erasure confirmation email sent automatically, (3) a written acknowledgement PDF downloaded on confirmation. Separately, add a /data-retention page (linked from /privacy) listing: Supabase Canada retention period post-cancellation (e.g., 90 days), Mem0 memory vector deletion timeline, Anthropic prompt data handling, and subprocessor DPA links. This directly unblocks Isabelle's Loi 25 blocker and increases trust for all Quebec personas.

**2. Replace Markdown Export CTA with 'Send to Notes / Save as PDF' Plain-Language Actions** (chat)
> Remove or rename the 'Export Markdown' button entirely. Replace with two clearly labeled actions on every conversation: (1) '📄 Save as PDF' — triggers the existing print-formatted window, labelled plainly; (2) '📧 Email to my accountant' — opens a pre-filled mailto: or in-app form with the PDF attached and a subject line auto-populated as 'Résumé fiscal – [Business Name] – [Date]'. On mobile (iOS/Android), add a native Share Sheet trigger so Fatima can send directly to Apple Notes or WhatsApp. The word 'Markdown' should never appear in any UI visible to end users — replace all instances with 'text file' or remove entirely.

**3. Add 60-Second Business-Type Video + Contextual First-Action Prompt on Step 4** (onboarding)
> On Onboarding Step 4 (Activation screen), after the user has selected their business type, display: (1) A 60-second autoplay muted video thumbnail (with play button) specific to their business type — restaurant owners see Marie-like scenario, contractors see Dave-like scenario, salon owners see Fatima-like scenario. Video shows exactly one real question being asked and answered in the app. (2) Below the video, replace generic starter chips with a single bold CTA: 'Votre première question suggérée:' followed by the single most relevant prompt for their business type (e.g., for salons: 'Est-ce que je dois charger la TVQ sur mes services de coiffure?'). This eliminates Fatima's 'I didn't know what to do' first-session anxiety and accelerates time-to-value for all new users.

**4. Mobile-Optimized 'Short Answer' Response Mode with Inline Expand** (chat)
> Detect mobile viewport (< 768px) and apply a stricter response rendering rule: AI responses on mobile show maximum 3 sentences (approx. 300 characters) by default, with a '+ Voir plus / + Read more' inline tap target — not a separate button below, but a tappable '...' continuation within the text flow. The expanded view slides open inline without page jump. This is distinct from the existing 2500-char collapse (which is desktop-oriented) — this is a mobile-first 3-sentence cap. For the Tax agent specifically, the first sentence must always be the direct answer (rate, form number, or yes/no), never a caveat. Update the agent system prompt to enforce: 'First sentence = direct answer. Second sentence = key condition or exception. Third sentence = source citation. Everything else goes in the expanded section.'

**5. Make Expert Mode Toggle Prominent + Add Plain-English 'Why This Agent?' Disclosure** (navigation)
> Move the Expert Mode agent selector from its current buried location to a persistent, visible (but unobtrusive) row directly above the chat input field — displayed as three small pill buttons: '🧭 Général', '🧾 Fiscalité', '💰 Trésorerie' with the auto-selected one highlighted in indigo. Default state shows the auto-selected agent highlighted with a small '(auto)' label so Kevin immediately sees which agent was chosen and can override with one tap. For Dave and Fatima who want it invisible: add a toggle in Settings → 'Affichage avancé / Advanced Display' that hides these pills entirely and restores the seamless invisible routing. The agent pills should only be visible by default on desktop; on mobile they are hidden by default unless the user has enabled Advanced Display. This resolves Kevin's 'hidden routing' frustration without overwhelming Dave or Fatima.

---

## Iteration 2 — Average Score: **8.2/10**

| Persona | Onboard | Dashboard | Chat | UI/UX | Navigation | Language | **Overall** | Pay $29? |
|---------|---------|-----------|------|-------|------------|----------|-------------|----------|
| Marie Tremblay | 9 | 9 | 8 | 8 | 8 | 9 | **8.5** | ✅ |
| Kevin Zhang | 8 | 8 | 9 | 7 | 8 | 7 | **7.8** | ✅ |
| Fatima Ouali | 8 | 8 | 9 | 8 | 8 | 9 | **8.3** | ✅ |
| Dave Bouchard | 8 | 9 | 8 | 8 | 7 | 8 | **8.0** | ✅ |
| Isabelle Roy | 8 | 9 | 9 | 8 | 8 | 9 | **8.5** | ✅ |

### What they said

> **Marie Tremblay:** "Enfin une application qui parle comme une vraie comptable québécoise, pas comme un robot de Silicon Valley — et le fait qu'elle me rappelle mes échéances ARC et Revenu Québec par courriel, ça change tout pour moi."  
> **Kevin Zhang:** "This is the first Canadian business AI tool I've tested that actually knows what a T2125 is without me explaining it — everything else is just ChatGPT with a maple leaf sticker on it."  
> **Fatima Ouali:** "Pour la première fois, j'ai compris ce que je dois faire pour la RRQ de mes employées sans appeler mon comptable — et ça, ça vaut vraiment quelque chose."  
> **Dave Bouchard:** "I'm not a computer guy, but this thing told me exactly when my remittance was due and what form to use — that's more useful than half the people I've called at CRA."  
> **Isabelle Roy:** "As a bookkeeper who bills clients for explaining QST remittance schedules and T2125 deductions on repeat, seeing an AI tool that actually cites Revenu Québec separately from CRA and names the correct form numbers without hedging every sentence is genuinely impressive — but I'm not recommending this to any client until I see a clear Loi 25 data retention schedule for Mem0."  

### Common themes

**👍 Most liked:**
- Le widget 'Prochaine échéance' en gros en haut du tableau de bord — je vois immédiatement ce que je dois faire sans chercher, c'est exactement ce dont j'ai besoin après ma pénalité de 400$ l'an passé
- Les rappels par courriel avec choix de 3, 7 ou 14 jours avant la date limite — ça, c'est concret et pratique pour quelqu'un comme moi qui est toujours en cuisine
- Le badge Revenu Québec séparé de l'ARC pour les réponses fiscales — en tant que restauratrice québécoise avec la TVQ, j'ai besoin de savoir si c'est provincial ou fédéral, et l'app fait cette distinction clairement
- The Tax agent actually knows the difference between T2125 and T2 incorporation scenarios — that's legitimately useful for me right now as I'm deciding whether to stay sole prop or incorporate, and most generic AI tools just say 'consult a CPA'
- Business-type-specific starter prompts for IT contractors are exactly right — 'Am I better off incorporated (T2) or sole prop (T2125)?' is the first question I'd ask anyway, so whoever designed this actually talked to contractors
- PDF/Markdown export with agent labels and the 'No AI training' commitment backed by an Anthropic DPA — that's the kind of verifiable privacy claim I can actually check, not just a trust badge

**🔧 Most wanted improvements:**
- Je voudrais pouvoir entrer directement mes dates de fermeture saisonnière ou mes périodes achalandées pour que l'app adapte ses suggestions à la réalité d'un restaurant — pas juste des conseils génériques
- Les réponses de l'agent fiscal sont encore un peu longues pour quelqu'un qui lit son téléphone entre deux services du midi — même avec le bouton 'voir plus', j'aimerais une version encore plus courte par défaut, genre trois points bullet maximum
- J'aimerais un rappel pour la TVQ mensuelle ou trimestrielle intégré directement dans le calendrier de mon iPhone — un simple bouton 'Ajouter à mon calendrier' sur les échéances affichées
- The light mode default is fine for accessibility but the design description still says 'deep navy-black, indigo gradient' — there's an internal inconsistency in the product spec that makes me wonder if the actual shipped UI matches the stated intent, and I'd notice mismatched components immediately
- Expert mode agent selector is great, but I want keyboard shortcuts or a slash-command like '/tax' to switch agents inline — power users like me don't want to reach for a toggle UI element mid-conversation
- The quarterly installment reminders (March 15, June 15, Sept 15, Dec 15) aren't explicitly called out as a feature — the deadline widget covers CRA dates generically, but as a sole prop contractor my biggest actual need is installment payment reminders with the calculated amount, not just a bell icon

### UI/UX Synthesizer Recommendations

**Root cause:** The app already exceeds its 8.0 target at 8.2, so the real challenge is reinforcing and broadening that lead rather than fixing critical failures. The gap between individual scores reveals two concentrated weakness clusters: (1) mobile readability and response length — Marie, Fatima, and Dave all independently flag that AI responses, even with the TL;DR toggle, still require too much reading effort on a phone screen between tasks, meaning the current 'first sentence + expand' truncation is solving the wrong problem (the issue isn't length, it's the absence of a structured scannable summary before expanding); and (2) trust and transparency friction at specific micro-moments — Fatima's magic-link anxiety, Dave's confusion about what 'Mon dossier' saves, Kevin's spec inconsistency concern, and Isabelle's Loi 25 retention gap all represent points where the product's credibility is briefly undermined by missing one-line explanations or visual inconsistencies, none of which require architectural changes to fix. The navigation score (weakest category at 7.6 average across personas) is largely explained by these same friction points rather than structural navigation problems. Fixing the TL;DR pattern to be AI-generated bullets rather than raw truncation, adding calendar export to deadlines, and closing the three or four micro-copy gaps would collectively address all five personas and push the average above 8.4 without requiring any new features.

**Projected score after improvements:** 8.5/10

| # | Area | Improvement | Personas affected | Δ Score | Effort |
|---|------|-------------|-------------------|---------|--------|
| 1 | chat | TL;DR 3-bullet default with full expand — replace first-sentence truncation | marie, fatima, kevin, dave, isabelle | +0.25 | medium |
| 2 | dashboard | Inline 'Add to Calendar' button on every deadline card + quarterly installment dates | marie, kevin, dave | +0.2 | medium |
| 3 | onboarding | Magic-link reassurance microcopy + 'Mon dossier' one-liner explanation at first visit | fatima, dave | +0.15 | low |
| 4 | chat | Slash-command agent switching ('/tax', '/cash', '/general') in chat input | kevin, isabelle | +0.1 | medium |
| 5 | ui_ux | Fix light-mode vs dark-theme spec inconsistency + strengthen agent badge size on mobile | kevin, dave, isabelle, fatima | +0.1 | low |

#### Detailed improvements

**1. TL;DR 3-bullet default with full expand — replace first-sentence truncation** (chat)
> Replace the current 'show first sentence + expand' pattern with a structured TL;DR block at the top of every Tax and Cash Flow agent response: exactly 3 bullet points (max 12 words each) rendered by default, followed by a 'Voir les détails / Show full answer' chevron. The 3 bullets are generated by the AI as part of its response template, not truncated from the full text. This means mobile users on iPhone (Fatima, Marie) get an actionable summary without a single tap, while power users (Kevin, Isabelle) can expand immediately. Update the AI system prompt to always begin Tax/Cash Flow responses with '**En bref / In brief:**' followed by exactly 3 dash-prefixed bullets before the full explanation. On the chat UI component, render everything before the first horizontal rule as the collapsed view, everything after as the expandable section.

**2. Inline 'Add to Calendar' button on every deadline card + quarterly installment dates** (dashboard)
> On the 'Next Deadline' hero card and every item in the Upcoming Deadlines widget, add a single-tap '📅 Ajouter au calendrier / Add to Calendar' button that generates a .ics file download (compatible with iPhone Calendar, Google Calendar, Outlook) with the deadline title, amount-due field (if known), and a reminder alarm pre-set to 7 days before. Separately, add quarterly CRA installment dates (March 15, June 15, Sept 15, Dec 15) as a distinct deadline category in the widget — labelled 'Acomptes provisionnels / Installment payment' — with a calculated estimated amount field based on the revenue range entered during onboarding Step 3. The bell icon email reminder subscription (feature #20) remains, but the calendar export is a second parallel CTA rendered as a ghost button directly beneath the deadline date text on each card. Copy on button: '📅 Ajouter à mon calendrier' (FR) / '📅 Add to my calendar' (EN).

**3. Magic-link reassurance microcopy + 'Mon dossier' one-liner explanation at first visit** (onboarding)
> Two targeted copy fixes: (1) On the magic-link login screen, directly below the 'Envoyer le lien / Send link' button, add a single line in muted gray text: '✓ Pas de mot de passe — c'est normal et sécurisé / No password needed — this is normal and secure.' This line should appear before the user clicks send, not after, so it prevents anxiety rather than resolving it. (2) On the first visit to the 'Mon dossier / My Business File' page, show a one-time dismissible banner (blue info strip, not a modal) with the copy: 'On garde ici les infos que vous nous avez partagées — pour que vous n'ayez pas à vous répéter. / We save the info you've shared here so you never have to repeat yourself.' Include a single 'Compris / Got it' button that permanently hides the banner. Both changes require zero new screens and target the exact anxiety moments Fatima and Dave described.

**4. Slash-command agent switching ('/tax', '/cash', '/general') in chat input** (chat)
> In the chat input field, implement slash-command detection: when a user types '/' as the first character, show an inline autocomplete popover above the input listing three options — '/tax — Fiscalité', '/cash — Trésorerie', '/general — Conseiller'. Selecting one pins that agent for the current conversation session (overrides auto-routing) and shows a small persistent badge in the chat header: 'Agent: Fiscalité ✕'. The ✕ clears the pin and returns to auto-routing. This is additive — non-power users who never type '/' never see it and continue using auto-routing transparently. The Expert Mode toggle in settings remains as the persistent preference setting; the slash command is a per-conversation override. Also add keyboard shortcut tooltips visible on desktop hover: Cmd+1 (General), Cmd+2 (Tax), Cmd+3 (Cash Flow), listed in a '⌨️ Shortcuts' link in the chat footer alongside the existing 'No AI training' badge.

**5. Fix light-mode vs dark-theme spec inconsistency + strengthen agent badge size on mobile** (ui_ux)
> Two visual consistency fixes: (1) Remove all references to 'deep navy-black backgrounds, indigo gradient' from the app description, help text, and any in-app onboarding copy — the shipped default is light mode (white/#0f172a) and the spec must match. In Settings under the theme toggle, label the options explicitly: 'Clair / Light (défaut)' and 'Sombre / Dark'. This resolves Kevin's legitimate concern about spec/UI mismatch signalling quality issues. (2) Increase the agent badge on chat messages from its current small inline size to a pill-shaped label (min 80px wide, 22px tall, 12px font) with distinct background colors per agent — blue-gray for General, amber for Tax/Fiscalité, teal for Cash Flow/Trésorerie — placed on its own line above the response text, not inline with it. On mobile viewports below 390px width, the badge should remain fully readable without truncation. This directly addresses Dave's 'felt small on my phone' comment and reinforces Isabelle's trust requirement for agent accountability.

---

## Iteration 3 — Average Score: **8.3/10**

| Persona | Onboard | Dashboard | Chat | UI/UX | Navigation | Language | **Overall** | Pay $29? |
|---------|---------|-----------|------|-------|------------|----------|-------------|----------|
| Marie Tremblay | 9 | 9 | 8 | 8 | 8 | 9 | **8.5** | ✅ |
| Kevin Zhang | 9 | 8 | 9 | 8 | 8 | 7 | **8.2** | ✅ |
| Fatima Ouali | 8 | 9 | 9 | 8 | 8 | 9 | **8.5** | ✅ |
| Dave Bouchard | 8 | 9 | 8 | 8 | 7 | 8 | **8.0** | ✅ |
| Isabelle Roy | 8 | 9 | 9 | 8 | 8 | 9 | **8.5** | ✅ |

### What they said

> **Marie Tremblay:** "Enfin une application qui parle vraiment québécois — pas juste en français, mais qui connaît Revenu Québec, la TVQ, et qui me dit quoi faire concrètement au lieu de me dire d'appeler un professionnel pour chaque petite question."  
> **Kevin Zhang:** "This is the first Canadian business AI tool I've seen that actually knows what a T2125 is without me explaining it — if the answers stay this specific and don't drift toward generic disclaimers over time, I'm keeping the Pro subscription."  
> **Fatima Ouali:** "Enfin une appli qui me parle comme une vraie personne en français, qui connaît le Québec, et qui répond vraiment à mes questions sur la TVQ — j'ai trouvé mes réponses en 5 minutes alors que ça faisait des semaines que je me débattais avec ça."  
> **Dave Bouchard:** "I came in expecting to be lost in five minutes, and I wasn't — it told me my next deadline before I even had to ask, so that's a good start."  
> **Isabelle Roy:** "The Revenu Québec badge and T2125 vs T2 distinction tell me someone who actually knows Canadian tax built this — but before I put a single client's revenue numbers in here, I need the Loi 25 data residency documentation in writing, not just a trust badge."  

### Common themes

**👍 Most liked:**
- Le widget 'Prochaine échéance' en gros en haut du tableau de bord — c'est exactement ce dont j'ai besoin, pas besoin de chercher, je vois tout de suite ce qui s'en vient avec l'ARC ou Revenu Québec
- Les rappels par courriel avant les échéances fiscales — si j'avais eu ça l'année passée, j'aurais pas payé 400$ de pénalités, c'est probablement la fonctionnalité la plus utile pour moi
- Le fait que les réponses citent à la fois l'ARC et Revenu Québec séparément avec les badges — en tant que restauratrice au Québec je dois gérer les deux, et enfin une application qui comprend ça
- The IT contractor-specific starter prompt — 'Am I better off incorporated (T2) or sole proprietor (T2125)?' — is exactly the question I was going to ask anyway, and the fact that the Tax agent leads with CPP rates and actual form numbers instead of immediately hedging with 'consult a professional' is genuinely refreshing compared to what I get from generic ChatGPT prompts
- Chat export to Markdown is a killer feature for me — I can drop that into Notion or keep it as a plain text audit trail, and the 'no AI training' contractual commitment with Anthropic DPA is the kind of verifiable trust signal that actually matters rather than a hollow badge
- The email deadline reminders with 3/7/14-day lead time and 7AM ET send time shows real product thinking — I've missed installment deadlines before because I was heads-down on a contract, and having that configurable bell on the widget is exactly the friction-free setup I'd actually use

**🔧 Most wanted improvements:**
- Je voudrais pouvoir entrer mes dates de remises TPS/TVQ manuellement dans le calendrier — mon cycle de remises est trimestriel et je veux être sûre que l'app le sait sans avoir à le répéter à chaque fois
- Les réponses de l'agent fiscal sont bonnes mais parfois encore un peu trop techniques — quand il parle de T2125 je comprends c'est quoi, mais mes employés de cuisine qui ont leur propre petite business, eux ils comprendraient pas, un petit lexique cliquable aiderait
- L'exportation PDF c'est bien, mais j'aimerais pouvoir envoyer directement à mon comptable depuis l'app — copier-coller le PDF par courriel ça fait une étape de plus que nécessaire
- The light mode default is the right call for the broader SMB market but I'd want the dark mode toggle to persist immediately from first login without going into Settings — as someone who runs everything dark (VS Code, Linear, Notion), having to dig into Settings before my eyes bleed from the white interface is a minor but real annoyance
- The automatic agent routing sounds clean for non-tech users but as a power user I want the Expert mode toggle front and center in the chat header, not buried — if I know I need T2125 vs T2 clarity I shouldn't have to hunt for the manual override, it should be a one-tap switch visible inline with the input field
- The billing jump from Free (50 msg/mo) to Pro at $29 is reasonable but I'd want clearer API-level transparency — specifically, I want to know if my Anthropic-processed queries are using Claude 3 Haiku or Sonnet, because as an IT contractor I'm evaluating the underlying model quality as part of the value proposition, not just the feature wrapper

---

## Iteration 4 — Average Score: **8.3/10**

| Persona | Onboard | Dashboard | Chat | UI/UX | Navigation | Language | **Overall** | Pay $29? |
|---------|---------|-----------|------|-------|------------|----------|-------------|----------|
| Marie Tremblay | 9 | 9 | 8 | 8 | 8 | 9 | **8.5** | ✅ |
| Kevin Zhang | 9 | 8 | 9 | 8 | 8 | 7 | **8.2** | ✅ |
| Fatima Ouali | 8 | 9 | 9 | 8 | 8 | 8 | **8.3** | ✅ |
| Dave Bouchard | 8 | 9 | 8 | 8 | 7 | 8 | **8.0** | ✅ |
| Isabelle Roy | 8 | 9 | 9 | 8 | 8 | 9 | **8.5** | ✅ |

### What they said

> **Marie Tremblay:** "Pour la première fois depuis que j'ai ouvert mon restaurant, j'ai l'impression qu'un outil comprend vraiment mes obligations fiscales au Québec — en français, sans me noyer dans le jargon."  
> **Kevin Zhang:** "This is the first AI tool I've tried that actually knows the difference between T2125 and T2 without me having to explain my entire business structure first — it's not perfect, but it's closer to a junior tax associate than a generic chatbot."  
> **Fatima Ouali:** "Enfin une application qui me répond comme une vraie personne en français et qui connaît les règles du Québec — j'avais peur que ce soit compliqué mais j'ai eu ma réponse sur la RRQ en deux minutes."  
> **Dave Bouchard:** "I'm not a computer guy but I could figure this out, and it actually told me what I needed to know instead of dancing around it — that's all I was asking for."  
> **Isabelle Roy:** "The Quebec dual-source badges and the Loi 25 disclosure page tell me someone actually did their homework on this market — but until I can delete client conversation data with one click and see a retention schedule, I'm not connecting this to anything involving real client financials."  

### Common themes

**👍 Most liked:**
- Le widget 'Prochaine échéance' en gros en haut du tableau de bord — c'est exactement ce dont j'ai besoin, je vois tout de suite ce qui s'en vient sans chercher partout
- Les rappels par courriel avant les échéances de l'ARC et de Revenu Québec — si j'avais eu ça l'an passé, j'aurais évité mes 400$ de pénalités
- L'interface en français avec un langage clair et professionnel — ça ressemble à un vrai outil comptable canadien, pas à une application américaine traduite à la va-vite
- The IT contractor-specific starter prompt — 'Am I better off incorporated (T2) or sole proprietor (T2125)?' — is exactly the question I ask my accountant every year, and seeing it surface immediately told me the app actually knows its audience
- Tax agent giving CPP rates (5.95%), citing T2125 directly, and leading with the answer instead of drowning me in 'consult a professional' hedges is genuinely more useful than half the Reddit threads I've bookmarked
- PDF/Markdown export with audit trail and 'no AI training' commitment baked in — as a contractor who invoices clients and needs paper trails, this is the kind of detail that separates a real tool from a toy

**🔧 Most wanted improvements:**
- J'aimerais pouvoir entrer directement mes dates de période de taxes et que l'app calcule automatiquement mes échéances TVQ/TPS spécifiques à mon restaurant — pas juste des dates génériques
- Une intégration avec mon logiciel de caisse ou mes relevés bancaires serait vraiment utile pour que l'IA voie mes vrais chiffres, pas juste ce que je lui dis
- Je voudrais une confirmation claire que les conseils fiscaux tiennent compte des règles particulières pour la restauration au Québec, comme les pourboires et les obligations RL-1 — j'ai des employés et c'est compliqué
- The expert mode agent toggle is great, but I want keyboard shortcuts or a slash-command like '/tax' to route instantly — clicking a toggle when I'm mid-thought breaks my flow the same way switching contexts in Linear does
- Quarterly installment reminders (March 15, June 15, Sept 15, Dec 15) should be a first-class feature with a dedicated card, not buried in the deadline widget — this is literally the #1 reason a freelancer gets hit with CRA interest and it deserves more prominence than a generic bell icon
- The language toggle feels like an afterthought — I work in English but occasionally need to share a response with a Quebec client in French; I want per-message or per-export language switching, not a global Settings toggle that resets my whole UI

---

## Final Summary

- **Final average score:** 8.3/10
- **Would pay $29/mo:** 5/5 personas
- **Target reached:** ❌ Not yet
- **Iterations run:** 4