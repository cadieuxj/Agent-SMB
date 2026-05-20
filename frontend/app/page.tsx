"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain, CheckCircle2, ArrowRight, ShieldCheck, Lock, BadgeCheck,
  FileCheck, MapPin, Zap, MessageSquare, BookOpen, Clock, Star,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

const copy = {
  fr: {
    nav: {
      login: "Se connecter",
      start: "Commencer gratuitement",
    },
    hero: {
      badge: "🇨🇦 Conçu pour les PME canadiennes",
      title: "Votre conseiller d'affaires IA",
      titleHighlight: "qui se souvient de vous",
      subtitle:
        "Agent SMB répond à vos questions sur la TPS/TVQ, les RRQ, la trésorerie et les impôts — en français, avec des réponses précises pour le Canada.",
      cta: "Commencer gratuitement",
      ctaSub: "14 jours Pro gratuits · Sans carte de crédit",
    },
    features: {
      title: "Tout ce qu'une PME canadienne doit savoir",
      items: [
        {
          icon: Clock,
          title: "Rappels CRA / ARC",
          desc: "Dates limites TPS/TVQ, acomptes provisionnels, feuillets T4 — jamais de pénalités par oubli.",
        },
        {
          icon: MessageSquare,
          title: "Réponses spécialisées",
          desc: "Trois agents experts : fiscalité, trésorerie et conseiller général. Taux exacts, formulaires CRA, règles provinciaux.",
        },
        {
          icon: BookOpen,
          title: "Mémoire persistante",
          desc: "L'IA retient votre secteur, votre province, vos dates importantes — chaque conversation repart de là où vous avez laissé.",
        },
      ],
    },
    howItWorks: {
      title: "Démarrez en 3 minutes",
      steps: [
        { number: "01", title: "Créez votre compte", desc: "Lien magique par courriel — aucun mot de passe à retenir." },
        { number: "02", title: "Parlez de votre entreprise", desc: "Province, secteur, statut TPS/TVQ — l'IA personnalise chaque réponse." },
        { number: "03", title: "Posez vos questions", desc: "Fiscalité, trésorerie, paie, incorporation — des réponses directes et canadiennes." },
      ],
    },
    pricing: {
      title: "Tarification transparente",
      subtitle: "Essayez gratuitement. Passez à Pro quand vous êtes prêt.",
      plans: [
        {
          name: "Gratuit",
          price: "0 $",
          period: "/mois",
          desc: "Pour découvrir Agent SMB",
          features: [
            "50 messages / mois",
            "Agent conseiller général",
            "Mémoire limitée (5 souvenirs)",
            "Support communautaire",
          ],
          cta: "Commencer gratuitement",
          highlighted: false,
        },
        {
          name: "Pro",
          price: "49 $",
          period: "/mois CAD",
          desc: "Pour les PME sérieuses",
          badge: "Le plus populaire",
          features: [
            "Messages illimités",
            "Agents Fiscalité + Trésorerie",
            "Mémoire complète (aucune limite)",
            "Rappels CRA / ARC par courriel",
            "Export PDF / Markdown",
            "Support prioritaire",
          ],
          cta: "Essayer Pro 14 jours gratuits",
          highlighted: true,
        },
        {
          name: "Entreprise",
          price: "99 $",
          period: "/mois CAD",
          desc: "Pour les équipes et comptables",
          features: [
            "Tout Pro inclus",
            "3 utilisateurs (sièges)",
            "Accès API",
            "Support dédié",
          ],
          cta: "Nous contacter",
          highlighted: false,
        },
      ],
    },
    trust: {
      title: "Conçu pour la conformité canadienne",
      badges: [
        { icon: ShieldCheck, label: "Données hébergées au Canada" },
        { icon: Lock,        label: "Chiffrement de bout en bout" },
        { icon: BadgeCheck,  label: "Conforme ARC / CRA" },
        { icon: FileCheck,   label: "Aucun partage de données" },
        { icon: MapPin,      label: "Loi 25 / PIPEDA" },
        { icon: Star,        label: "Aucun entraînement IA" },
      ],
    },
    testimonials: {
      title: "Ce que disent nos utilisateurs pilotes",
      items: [
        {
          quote: "Pour la première fois, j'ai compris mes obligations TVQ sans appeler mon comptable.",
          author: "Marie T.",
          role: "Restauratrice, Québec",
        },
        {
          quote: "Les rappels de dates CRA m'ont sauvé de deux pénalités cette année.",
          author: "Dave B.",
          role: "Entrepreneur général, Nouveau-Brunswick",
        },
        {
          quote: "L'IA connaît la différence entre T2125 et T2 — c'est rare.",
          author: "Isabelle R.",
          role: "Comptable, Montréal",
        },
      ],
    },
    cta: {
      title: "Prêt à simplifier la gestion de votre PME?",
      subtitle: "14 jours Pro gratuits. Sans carte de crédit.",
      button: "Commencer maintenant",
    },
    footer: {
      privacy: "Politique de confidentialité",
      rights: "© 2026 CadieuxAI Inc. Tous droits réservés.",
    },
  },
  en: {
    nav: {
      login: "Sign in",
      start: "Start for free",
    },
    hero: {
      badge: "🇨🇦 Built for Canadian SMBs",
      title: "Your AI business advisor",
      titleHighlight: "that remembers you",
      subtitle:
        "Agent SMB answers your questions about GST/HST, CPP/QPP, cash flow and taxes — in English or French, with Canada-specific precision.",
      cta: "Start for free",
      ctaSub: "14-day Pro trial · No credit card",
    },
    features: {
      title: "Everything a Canadian SMB needs to know",
      items: [
        {
          icon: Clock,
          title: "CRA / ARC Deadline Reminders",
          desc: "GST/HST remittances, installment payments, T4 slips — never miss a deadline again.",
        },
        {
          icon: MessageSquare,
          title: "Specialized Agents",
          desc: "Three expert agents: tax, cash flow, and general advisor. Exact rates, CRA forms, provincial rules.",
        },
        {
          icon: BookOpen,
          title: "Persistent Memory",
          desc: "The AI remembers your industry, province, and key dates — every conversation picks up where you left off.",
        },
      ],
    },
    howItWorks: {
      title: "Up and running in 3 minutes",
      steps: [
        { number: "01", title: "Create your account", desc: "Magic link by email — no password to remember." },
        { number: "02", title: "Tell us about your business", desc: "Province, industry, GST/HST status — the AI personalizes every answer." },
        { number: "03", title: "Ask your questions", desc: "Tax, cash flow, payroll, incorporation — direct, Canadian answers." },
      ],
    },
    pricing: {
      title: "Simple, transparent pricing",
      subtitle: "Try free. Upgrade when you're ready.",
      plans: [
        {
          name: "Free",
          price: "$0",
          period: "/mo",
          desc: "Try Agent SMB",
          features: [
            "50 messages / month",
            "General advisor agent",
            "Limited memory (5 items)",
            "Community support",
          ],
          cta: "Start for free",
          highlighted: false,
        },
        {
          name: "Pro",
          price: "$49",
          period: "/mo CAD",
          desc: "For serious SMBs",
          badge: "Most popular",
          features: [
            "Unlimited messages",
            "Tax + Cash Flow agents",
            "Full memory (no limit)",
            "CRA / ARC email reminders",
            "PDF / Markdown export",
            "Priority support",
          ],
          cta: "Try Pro free for 14 days",
          highlighted: true,
        },
        {
          name: "Business",
          price: "$99",
          period: "/mo CAD",
          desc: "For teams & accountants",
          features: [
            "Everything in Pro",
            "3 user seats",
            "API access",
            "Dedicated support",
          ],
          cta: "Contact us",
          highlighted: false,
        },
      ],
    },
    trust: {
      title: "Built for Canadian compliance",
      badges: [
        { icon: ShieldCheck, label: "Data hosted in Canada" },
        { icon: Lock,        label: "End-to-end encryption" },
        { icon: BadgeCheck,  label: "CRA / ARC compliant" },
        { icon: FileCheck,   label: "Zero data sharing" },
        { icon: MapPin,      label: "Law 25 / PIPEDA" },
        { icon: Star,        label: "No AI training on your data" },
      ],
    },
    testimonials: {
      title: "What our pilot users say",
      items: [
        {
          quote: "For the first time, I understood my GST obligations without calling my accountant.",
          author: "Marie T.",
          role: "Restaurant owner, Quebec City",
        },
        {
          quote: "The CRA deadline reminders saved me from two penalties this year.",
          author: "Dave B.",
          role: "General contractor, New Brunswick",
        },
        {
          quote: "The AI knows the difference between T2125 and T2 — that's rare.",
          author: "Isabelle R.",
          role: "Bookkeeper, Montreal",
        },
      ],
    },
    cta: {
      title: "Ready to simplify your SMB?",
      subtitle: "14-day Pro trial. No credit card required.",
      button: "Get started now",
    },
    footer: {
      privacy: "Privacy Policy",
      rights: "© 2026 CadieuxAI Inc. All rights reserved.",
    },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LandingPage() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const t = copy[lang];

  return (
    <div className="dark-landing min-h-screen bg-surface-base text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-surface-base/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">Agent SMB</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="text-xs font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-1.5 transition-colors"
            >
              {lang === "fr" ? "EN" : "FR"}
            </button>

            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block"
            >
              {t.nav.login}
            </Link>

            <Link
              href="/login"
              className="text-sm font-semibold bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-xl transition-colors"
            >
              {t.nav.start}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4 sm:px-6">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand-text text-sm font-medium px-4 py-2 rounded-full">
            {t.hero.badge}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            {t.hero.title}
            <br />
            <span className="text-brand-text">{t.hero.titleHighlight}</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-4 rounded-2xl text-base transition-colors shadow-lg shadow-brand/20"
            >
              {t.hero.cta}
              <ArrowRight size={18} />
            </Link>
            <p className="text-sm text-gray-400">{t.hero.ctaSub}</p>
          </div>

          {/* App preview card */}
          <div className="mx-auto max-w-2xl mt-12 bg-surface-raised border border-gray-800 rounded-2xl p-6 text-left shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-danger" />
              <div className="w-2 h-2 rounded-full bg-warning" />
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="ml-2 text-xs text-gray-400">Agent SMB — Chat</span>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs">👤</div>
                <div className="bg-surface-overlay rounded-xl rounded-tl-none px-4 py-2.5 text-sm text-gray-300 max-w-xs">
                  {lang === "fr"
                    ? "Est-ce que mes frais de véhicule sont déductibles en tant que restaurant?"
                    : "Are my vehicle expenses deductible as a restaurant owner?"}
                </div>
              </div>
              <div className="flex gap-3 flex-row-reverse">
                <div className="shrink-0 w-7 h-7 rounded-full bg-brand flex items-center justify-center">
                  <Brain size={12} className="text-white" />
                </div>
                <div className="bg-brand/10 border border-brand/20 rounded-xl rounded-tr-none px-4 py-2.5 text-sm text-gray-200 max-w-sm">
                  {lang === "fr"
                    ? "Oui — pour un restaurant, vous pouvez déduire les frais de livraison et de ravitaillement à 100%. Les déplacements personnels ne sont pas admissibles. Formulaire T2125, ligne 9281. Taux kilométrique CRA 2025 : 0,70$/km pour les premiers 5 000 km. 🍁 ARC"
                    : "Yes — for a restaurant, delivery and supply runs are 100% deductible. Personal trips are not eligible. T2125 line 9281. CRA 2025 mileage rate: $0.70/km for the first 5,000 km. 🍁 CRA"}
                  <span className="block mt-1.5 text-[10px] text-agent-tax font-medium">
                    {lang === "fr" ? "🟣 Agent Fiscalité" : "🟣 Tax Agent"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">{t.features.title}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {t.features.items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-surface-raised border border-gray-800 rounded-2xl p-6 space-y-4 hover:border-gray-700 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                    <Icon size={20} className="text-brand-text" />
                  </div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 bg-surface-raised border-y border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">{t.howItWorks.title}</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {t.howItWorks.steps.map((step, i) => (
              <div key={step.number} className="relative text-center space-y-3">
                {i < t.howItWorks.steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-[60%] w-[80%] h-px bg-gray-800" />
                )}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand-text font-bold text-sm">
                  {step.number}
                </div>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold">{t.pricing.title}</h2>
            <p className="text-gray-400">{t.pricing.subtitle}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {t.pricing.plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 flex flex-col gap-5 ${
                  plan.highlighted
                    ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                    : "border-gray-800 bg-surface-raised"
                }`}
              >
                {"badge" in plan && plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{plan.desc}</p>
                </div>

                <ul className="flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle2 size={14} className="text-success mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`w-full text-center text-sm font-semibold py-3 rounded-xl transition-colors ${
                    plan.highlighted
                      ? "bg-brand hover:bg-brand-dark text-white"
                      : "bg-surface-overlay hover:bg-gray-700 text-gray-200 border border-gray-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 px-4 sm:px-6 bg-surface-raised border-y border-gray-800">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold">{t.trust.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {t.trust.badges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-surface-base border border-gray-800 rounded-xl px-4 py-3">
                <Icon size={18} className="text-success shrink-0" />
                <span className="text-sm text-gray-300 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">{t.testimonials.title}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {t.testimonials.items.map((item) => (
              <div key={item.author} className="bg-surface-raised border border-gray-800 rounded-2xl p-6 space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed italic">&ldquo;{item.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-white text-sm">{item.author}</p>
                  <p className="text-xs text-gray-400">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="bg-brand/10 border border-brand/20 rounded-3xl p-10 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">{t.cta.title}</h2>
            <p className="text-gray-400">{t.cta.subtitle}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-4 rounded-2xl text-base transition-colors shadow-lg shadow-brand/20"
            >
              {t.cta.button}
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center">
              <Brain size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Agent SMB</span>
            <span className="text-gray-500 mx-1">·</span>
            <span className="text-sm text-gray-400">{t.footer.rights}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
              {t.footer.privacy}
            </Link>
            <button
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {lang === "fr" ? "English" : "Français"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
