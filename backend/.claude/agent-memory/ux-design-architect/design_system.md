---
name: Agent-SMB Design System Foundation
description: Canonical color tokens, typography, spacing, and component library decisions for Agent-SMB
type: project
---

# Agent-SMB Design System

## Color Strategy
Dark-first. No light mode in v1 — defer until post-launch.

### Semantic Tokens (Tailwind CSS variables)
```css
--color-surface-base: theme('colors.gray.950')      /* page background */
--color-surface-raised: theme('colors.gray.900')    /* sidebar, panels */
--color-surface-overlay: theme('colors.gray.800')   /* cards, inputs */
--color-surface-hover: theme('colors.gray.750')     /* hover states — use gray-800/80 */
--color-border-subtle: theme('colors.gray.800')     /* subtle dividers */
--color-border-default: theme('colors.gray.700')    /* input borders */
--color-text-primary: theme('colors.white')
--color-text-secondary: theme('colors.gray.300')
--color-text-muted: theme('colors.gray.500')
--color-text-disabled: theme('colors.gray.600')
--color-brand-default: #2563eb    /* blue-600 — primary CTA */
--color-brand-hover: #1d4ed8      /* blue-700 */
--color-brand-subtle: theme('colors.blue.950')      /* banner backgrounds */
--color-brand-text: theme('colors.blue.400')        /* links, labels on dark */
--color-success: theme('colors.emerald.500')
--color-success-subtle: theme('colors.emerald.950')
--color-warning: theme('colors.amber.400')
--color-warning-subtle: theme('colors.amber.950')
--color-error: theme('colors.red.400')
--color-error-subtle: theme('colors.red.950')
--color-tax: #a78bfa               /* violet-400 — Tax agent accent */
--color-cashflow: #34d399          /* emerald-400 — Cash Flow agent accent */
--color-advisor: #60a5fa           /* blue-400 — General advisor accent */
```

## Typography
- **Font family**: Inter (primary), system-ui fallback. Load via next/font.
- **Scale** (all rem-based, 16px root):

| Token | Size | Weight | Line-height | Usage |
|---|---|---|---|---|
| display | 2.25rem / 36px | 700 | 1.2 | Hero headings |
| heading-lg | 1.5rem / 24px | 700 | 1.3 | Page titles |
| heading-md | 1.125rem / 18px | 600 | 1.4 | Section headers |
| heading-sm | 0.875rem / 14px | 600 | 1.4 | Card titles, labels |
| body-lg | 1rem / 16px | 400 | 1.6 | Onboarding body copy |
| body-md | 0.875rem / 14px | 400 | 1.5 | General UI text |
| body-sm | 0.75rem / 12px | 400 | 1.5 | Sidebar items, captions |
| mono | 0.75rem / 12px | 400 | 1.4 | Code blocks, memory IDs |

## Spacing System
8px base unit. Tailwind defaults align (4=16px, 6=24px, 8=32px).

Common spatial decisions:
- Page horizontal padding: px-4 (mobile) → px-6 (tablet) → px-8 (desktop)
- Card padding: p-4 (compact) / p-6 (default) / p-8 (hero cards)
- Sidebar width: 256px (w-64) — was 240px, increased for readability
- Memory panel width: 288px (w-72)
- Input height: 44px min (touch target compliance)
- Button height: 40px (default), 36px (small), 48px (large / primary CTA)

## Border Radius
- Small (inputs, tags): rounded-lg (8px)
- Default (cards, panels): rounded-xl (12px)
- Large (modals, feature cards): rounded-2xl (16px)
- Full (avatars, pills): rounded-full

## Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.4)
--shadow-md: 0 4px 12px rgba(0,0,0,0.5)
--shadow-lg: 0 8px 32px rgba(0,0,0,0.6)
--shadow-brand: 0 0 0 3px rgba(37,99,235,0.35)  /* focus ring */
```

## Component Library Decision
**No third-party component library in v1.** Pure Tailwind. Rationale: existing codebase is already pure Tailwind, adding Radix/shadcn mid-project creates migration overhead. However, design spec should be written so shadcn/ui components could drop in cleanly in v2.

## Icon Set
**Lucide React** — install `lucide-react`. Reasons: tree-shakeable, 24x24 default, consistent stroke width, works well at 16px and 20px, no license concerns. Replace all current emoji icons in the UI.

## Motion
- Transition duration: 150ms (hover/focus), 200ms (panel open/close), 300ms (page transitions)
- Easing: ease-out for entrances, ease-in for exits
- No motion if `prefers-reduced-motion` is set
