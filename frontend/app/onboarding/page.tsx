"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UtensilsCrossed, ShoppingBag, HardHat, Sparkles, Briefcase,
  Building2, Send, CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getProfile, updateProfile } from "@/lib/api";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STEPS = ["Langue", "Entreprise", "Fiscalité", "Activation"];

const BUSINESS_TYPES = [
  { value: "restaurant",    label: "Restaurant / Café",         icon: UtensilsCrossed },
  { value: "retail",        label: "Commerce de détail",        icon: ShoppingBag },
  { value: "contractor",    label: "Entrepreneur",              icon: HardHat },
  { value: "salon",         label: "Salon / Spa",               icon: Sparkles },
  { value: "professional",  label: "Services professionnels",   icon: Briefcase },
  { value: "other",         label: "Autre",                     icon: Building2 },
];

const PROVINCES = [
  { value: "QC", label: "Québec" },
  { value: "ON", label: "Ontario" },
  { value: "BC", label: "Colombie-Britannique" },
  { value: "AB", label: "Alberta" },
  { value: "MB", label: "Manitoba" },
  { value: "SK", label: "Saskatchewan" },
  { value: "NS", label: "Nouvelle-Écosse" },
  { value: "NB", label: "Nouveau-Brunswick" },
  { value: "NL", label: "Terre-Neuve" },
  { value: "PE", label: "Île-du-Prince-Édouard" },
];

const REVENUE_RANGES = [
  { value: "under_30k",   label: "Moins de 30 000 $" },
  { value: "30k_100k",    label: "30 000 $ – 100 000 $" },
  { value: "100k_500k",   label: "100 000 $ – 500 000 $" },
  { value: "over_500k",   label: "Plus de 500 000 $" },
];

const STARTER_CHIPS: Record<string, string[]> = {
  fr: [
    "Quelles sont mes obligations fiscales cette année?",
    "Comment optimiser ma trésorerie ce trimestre?",
    "Quelles dépenses puis-je déduire pour mon entreprise?",
  ],
  en: [
    "What are my tax obligations this year?",
    "How can I optimize my cash flow this quarter?",
    "What business expenses can I deduct?",
  ],
};

type Form = {
  language: string;
  full_name: string;
  business_name: string;
  business_type: string;
  province: string;
  sales_tax_registered: string;
  revenue_range: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [firstMessage, setFirstMessage] = useState("");
  const [form, setForm] = useState<Form>({
    language: "fr",
    full_name: "",
    business_name: "",
    business_type: "",
    province: "QC",
    sales_tax_registered: "yes",
    revenue_range: "30k_100k",
  });

  function set(field: keyof Form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/"); return; }
      setUserId(user.id);
      setUserEmail(user.email ?? "");
      const profile = await getProfile(user.id);
      if (profile?.business_name) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  async function handleFinish(message?: string) {
    if (!userId || !userEmail) return;
    setSaving(true);
    try {
      await updateProfile(userId, {
        email: userEmail,
        full_name: form.full_name || undefined,
        business_name: form.business_name,
        business_type: form.business_type,
        province: form.province,
        language: form.language,
        sales_tax_registered: form.sales_tax_registered === "yes",
        revenue_range: form.revenue_range,
      });
      document.cookie = `lang=${form.language}; path=/; max-age=31536000`;
      const dest = message
        ? `/chat?q=${encodeURIComponent(message)}`
        : "/dashboard";
      router.replace(dest);
    } catch {
      setSaving(false);
    }
  }

  const nextDisabled =
    (step === 0 && !form.language) ||
    (step === 1 && (!form.business_name.trim() || !form.business_type)) ||
    (step === 2 && (!form.province || !form.sales_tax_registered || !form.revenue_range));

  return (
    <OnboardingShell
      steps={STEPS}
      current={step}
      onBack={step > 0 ? () => setStep(step - 1) : undefined}
      onNext={step < 3 ? () => setStep(step + 1) : undefined}
      nextDisabled={nextDisabled}
    >
      {step === 0 && <StepLanguage form={form} set={set} />}
      {step === 1 && <StepBusiness form={form} set={set} />}
      {step === 2 && <StepTax form={form} set={set} />}
      {step === 3 && (
        <StepActivation
          form={form}
          chips={STARTER_CHIPS[form.language] ?? STARTER_CHIPS.fr}
          firstMessage={firstMessage}
          setFirstMessage={setFirstMessage}
          onFinish={handleFinish}
          saving={saving}
        />
      )}
    </OnboardingShell>
  );
}

/* ── Step 1: Language ── */
function StepLanguage({ form, set }: { form: Form; set: (k: keyof Form, v: string) => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Choisissez votre langue</h1>
        <p className="text-gray-400 text-sm">Choose your preferred language</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { value: "fr", flag: "🇨🇦", primary: "Français", secondary: "French" },
          { value: "en", flag: "🇨🇦", primary: "English", secondary: "Anglais" },
        ].map((lang) => (
          <button
            key={lang.value}
            onClick={() => set("language", lang.value)}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all cursor-pointer",
              form.language === lang.value
                ? "border-brand bg-brand/10 ring-4 ring-brand/10"
                : "border-gray-700 bg-surface-raised hover:border-gray-600"
            )}
          >
            <span className="text-4xl">{lang.flag}</span>
            <div className="text-center">
              <p className="font-semibold text-white">{lang.primary}</p>
              <p className="text-xs text-gray-500 mt-0.5">{lang.secondary}</p>
            </div>
            {form.language === lang.value && (
              <CheckCircle2 size={18} className="text-brand" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Step 2: Business Profile ── */
function StepBusiness({ form, set }: { form: Form; set: (k: keyof Form, v: string) => void }) {
  const t = form.language === "en";
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">
          {t ? "Tell us about your business" : "Parlez-nous de votre entreprise"}
        </h1>
        <p className="text-gray-400 text-sm">
          {t ? "This helps your advisor personalize every response." : "Votre conseiller pourra vous répondre plus précisément."}
        </p>
      </div>

      <div className="space-y-4">
        <Input
          id="business_name"
          label={t ? "Business name *" : "Nom de l'entreprise *"}
          value={form.business_name}
          onChange={(e) => set("business_name", e.target.value)}
          placeholder={t ? "Maple Leaf Plumbing" : "Plomberie Tremblay"}
          autoComplete="organization"
        />
        <Input
          id="full_name"
          label={t ? "Your name (optional)" : "Votre nom (optionnel)"}
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          placeholder={t ? "Jean-Pierre Tremblay" : "Jean-Pierre Tremblay"}
          autoComplete="name"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-300">
          {t ? "Business type *" : "Type d'entreprise *"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BUSINESS_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => set("business_type", value)}
              className={cn(
                "flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer text-center",
                form.business_type === value
                  ? "border-brand bg-brand/10 text-brand-text"
                  : "border-gray-700 bg-surface-raised text-gray-400 hover:border-gray-600 hover:text-gray-200"
              )}
            >
              <Icon size={22} />
              <span className="text-xs font-medium leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Tax Context ── */
function StepTax({ form, set }: { form: Form; set: (k: keyof Form, v: string) => void }) {
  const t = form.language === "en";
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">
          {t ? "Your taxes & revenue" : "Vos taxes et revenus"}
        </h1>
        <p className="text-gray-400 text-sm">
          {t
            ? "Helps tailor tax reminders to your situation — takes 30 seconds."
            : "Pour personnaliser vos rappels fiscaux — 30 secondes."}
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">
          {t ? "Province" : "Province"}
        </label>
        <select
          value={form.province}
          onChange={(e) => set("province", e.target.value)}
          className="w-full bg-surface-overlay border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-colors"
        >
          {PROVINCES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <RadioGroup
        label={t ? "Are you registered to collect sales tax? (GST/HST)" : "Êtes-vous inscrit(e) aux taxes de vente? (TPS/TVQ)"}
        value={form.sales_tax_registered}
        onChange={(v) => set("sales_tax_registered", v)}
        options={[
          { value: "yes", label: t ? "Yes" : "Oui" },
          { value: "no",  label: t ? "No"  : "Non" },
        ]}
      />

      <RadioGroup
        label={t ? "Annual revenue" : "Chiffre d'affaires annuel"}
        value={form.revenue_range}
        onChange={(v) => set("revenue_range", v)}
        options={REVENUE_RANGES}
      />
    </div>
  );
}

function RadioGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-300">{label}</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer text-left",
              value === opt.value
                ? "border-brand bg-brand/10 text-white"
                : "border-gray-700 bg-surface-raised text-gray-400 hover:border-gray-600 hover:text-gray-200"
            )}
          >
            <div className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
              value === opt.value ? "border-brand" : "border-gray-600"
            )}>
              {value === opt.value && <div className="w-2 h-2 rounded-full bg-brand" />}
            </div>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Step 4: Activation ── */
function StepActivation({
  form,
  chips,
  firstMessage,
  setFirstMessage,
  onFinish,
  saving,
}: {
  form: Form;
  chips: string[];
  firstMessage: string;
  setFirstMessage: (v: string) => void;
  onFinish: (msg?: string) => void;
  saving: boolean;
}) {
  const t = form.language === "en";
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSend(msg?: string) {
    const message = msg ?? firstMessage.trim();
    onFinish(message || undefined);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={24} className="text-success" />
          <h1 className="text-2xl font-bold text-white">
            {t ? "All set!" : "Tout est prêt!"}
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
          {t
            ? `Your advisor knows about ${form.business_name || "your business"} in ${form.province}.`
            : `Votre conseiller connaît ${form.business_name || "votre entreprise"} au ${form.province}.`}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-300">
          {t ? "How can I help you today?" : "Par où voulez-vous commencer?"}
        </p>
        <div className="space-y-2">
          {chips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              disabled={saving}
              className="w-full text-left px-4 py-3 rounded-xl border border-gray-700 bg-surface-raised text-sm text-gray-300 hover:border-brand/60 hover:text-white hover:bg-brand/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Pro trial banner */}
      <div className="bg-brand/10 border border-brand/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-text">
            🎁 {t ? "14-day free Pro trial" : "Essai Pro gratuit de 14 jours"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {t ? "No credit card required." : "Aucune carte requise."}
          </p>
        </div>
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              const uid = document.cookie.match(/agentsmb_uid=([^;]+)/)?.[1];
              if (uid) localStorage.setItem(`agentsmb_pro_${uid}`, "true");
            }
          }}
          className="shrink-0 text-xs font-semibold bg-brand hover:bg-brand-dark text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {t ? "Activate" : "Activer"}
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-gray-600 text-center">
          {t ? "or type your own question" : "ou posez votre propre question"}
        </p>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !saving && handleSend()}
            placeholder={t ? "Ask anything about your business…" : "Posez votre question…"}
            disabled={saving}
            className="flex-1 bg-surface-overlay border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-50 transition-colors"
          />
          <Button
            onClick={() => handleSend()}
            disabled={saving}
            loading={saving}
            icon={<Send size={15} />}
            className="shrink-0"
          >
            {t ? "Start" : "Commencer"}
          </Button>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => onFinish()}
          disabled={saving}
          className="w-full text-xs text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-50"
        >
          {t ? "Skip and go to chat →" : "Passer et aller au chat →"}
        </button>
      </div>
    </div>
  );
}
