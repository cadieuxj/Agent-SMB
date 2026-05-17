"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu, UtensilsCrossed, ShoppingBag, HardHat,
  Sparkles, Briefcase, Building2, Check, Trash2,
} from "lucide-react";
import { getProfile, updateProfile, deleteAccount, type Profile } from "@/lib/api";
import NavSidebar from "@/components/layout/NavSidebar";
import MobileBottomTabs from "@/components/layout/MobileBottomTabs";
import MobileDrawer from "@/components/layout/MobileDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  { value: "restaurant",   label: "Restaurant / Café",       icon: UtensilsCrossed },
  { value: "retail",       label: "Commerce de détail",      icon: ShoppingBag },
  { value: "contractor",   label: "Entrepreneur",            icon: HardHat },
  { value: "salon",        label: "Salon / Spa",             icon: Sparkles },
  { value: "professional", label: "Services professionnels", icon: Briefcase },
  { value: "other",        label: "Autre",                   icon: Building2 },
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
  { value: "under_30k",  label: "Moins de 30 000 $" },
  { value: "30k_100k",   label: "30 000 $ – 100 000 $" },
  { value: "100k_500k",  label: "100 000 $ – 500 000 $" },
  { value: "over_500k",  label: "Plus de 500 000 $" },
];

type Form = {
  full_name: string;
  business_name: string;
  business_type: string;
  province: string;
  language: string;
  sales_tax_registered: string;
  revenue_range: string;
};

function profileToForm(p: Profile | null): Form {
  return {
    full_name: p?.full_name ?? "",
    business_name: p?.business_name ?? "",
    business_type: p?.business_type ?? "",
    province: p?.province ?? "QC",
    language: p?.language ?? "fr",
    sales_tax_registered: p?.sales_tax_registered === true ? "yes" : p?.sales_tax_registered === false ? "no" : "yes",
    revenue_range: p?.revenue_range ?? "30k_100k",
  };
}

export default function SettingsPageContent({ userId, userEmail }: { userId: string; userEmail: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Form>(profileToForm(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const language = form.language as "fr" | "en";
  const t = language === "en";

  useEffect(() => {
    getProfile(userId).then((p) => {
      setProfile(p);
      setForm(profileToForm(p));
      setLoading(false);
    });
  }, [userId]);

  function set(field: keyof Form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateProfile(userId, {
        email: userEmail,
        full_name: form.full_name || undefined,
        business_name: form.business_name,
        business_type: form.business_type,
        province: form.province,
        language: form.language,
        sales_tax_registered: form.sales_tax_registered === "yes",
        revenue_range: form.revenue_range,
      });
      setProfile(updated);
      document.cookie = `lang=${form.language}; path=/; max-age=31536000`;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silently fail — could add error state
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <NavSidebar className="hidden lg:flex" profile={profile} userEmail={userEmail} language={language} />

        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <NavSidebar profile={profile} userEmail={userEmail} language={language} />
        </MobileDrawer>

        <div className="flex-1 flex flex-col min-w-0 pb-14 lg:pb-0 overflow-hidden">
          <div className="flex lg:hidden items-center h-12 px-4 border-b border-gray-800 shrink-0 bg-surface-raised">
            <button onClick={() => setDrawerOpen(true)} className="p-1 text-gray-400 hover:text-gray-200 transition-colors">
              <Menu size={20} />
            </button>
            <span className="ml-3 font-semibold text-sm text-white">{t ? "Settings" : "Paramètres"}</span>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-xl mx-auto px-4 py-6 lg:px-8 space-y-8 pb-24">
                {/* Tab navigation */}
                <div className="flex gap-1 border-b border-gray-800 -mx-4 px-4 lg:-mx-8 lg:px-8">
                  <span className="px-4 py-2 text-sm font-medium border-b-2 border-brand text-white -mb-px">
                    {t ? "Profile" : "Profil"}
                  </span>
                  <Link
                    href="/settings/billing"
                    className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-300 -mb-px transition-colors"
                  >
                    {t ? "Billing" : "Facturation"}
                  </Link>
                </div>

                <h1 className="text-xl font-bold text-white">{t ? "Profile" : "Mon profil"}</h1>

                {/* Identity */}
                <section className="space-y-4">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t ? "Identity" : "Identité"}
                  </h2>
                  <Input
                    id="full_name"
                    label={t ? "Your name" : "Votre nom"}
                    value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                    placeholder="Jean-Pierre Tremblay"
                  />
                  <Input
                    id="business_name"
                    label={t ? "Business name *" : "Nom de l'entreprise *"}
                    value={form.business_name}
                    onChange={(e) => set("business_name", e.target.value)}
                    placeholder={t ? "Maple Leaf Plumbing" : "Plomberie Tremblay"}
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t ? "Email" : "Courriel"}
                    </p>
                    <p className="text-sm text-gray-400 bg-surface-overlay border border-gray-700 rounded-lg px-4 py-2.5">{userEmail}</p>
                  </div>
                </section>

                {/* Business type */}
                <section className="space-y-3">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t ? "Business type" : "Type d'entreprise"}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BUSINESS_TYPES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => set("business_type", value)}
                        className={cn(
                          "flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer text-center",
                          form.business_type === value
                            ? "border-brand bg-brand/10 text-brand-text"
                            : "border-gray-700 bg-surface-raised text-gray-400 hover:border-gray-600"
                        )}
                      >
                        <Icon size={20} />
                        <span className="text-xs font-medium leading-tight">{label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Display */}
                <section className="space-y-4">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t ? "Display" : "Affichage"}
                  </h2>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-300">{t ? "Theme" : "Thème"}</label>
                    <div className="flex rounded-lg overflow-hidden border border-gray-700 text-sm w-fit">
                      {([
                        { value: "dark",   labelFr: "Sombre",   labelEn: "Dark" },
                        { value: "light",  labelFr: "Clair",    labelEn: "Light" },
                        { value: "system", labelFr: "Système",  labelEn: "System" },
                      ] as const).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            localStorage.setItem("agentsmb_theme", opt.value);
                            const html = document.documentElement;
                            if (opt.value === "light") {
                              html.classList.add("theme-light");
                            } else if (opt.value === "dark") {
                              html.classList.remove("theme-light");
                            } else {
                              if (window.matchMedia("(prefers-color-scheme: light)").matches) {
                                html.classList.add("theme-light");
                              } else {
                                html.classList.remove("theme-light");
                              }
                            }
                          }}
                          className={cn(
                            "px-4 py-2 font-medium transition-colors",
                            (typeof window !== "undefined" && localStorage.getItem("agentsmb_theme") === opt.value) ||
                            (!localStorage.getItem("agentsmb_theme") && opt.value === "dark")
                              ? "bg-surface-overlay text-white"
                              : "text-gray-400 hover:text-white"
                          )}
                        >
                          {t ? opt.labelEn : opt.labelFr}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Location & language */}
                <section className="space-y-4">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t ? "Location & Language" : "Localisation & Langue"}
                  </h2>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-300">{t ? "Province" : "Province"}</label>
                    <select
                      value={form.province}
                      onChange={(e) => set("province", e.target.value)}
                      className="w-full bg-surface-overlay border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-300">{t ? "Language" : "Langue"}</label>
                    <div className="flex rounded-lg overflow-hidden border border-gray-700 text-sm w-fit">
                      {(["fr", "en"] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => set("language", lang)}
                          className={cn(
                            "px-6 py-2 font-medium transition-colors",
                            form.language === lang ? "bg-surface-overlay text-white" : "text-gray-400 hover:text-white"
                          )}
                        >
                          {lang === "fr" ? "Français" : "English"}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Tax context */}
                <section className="space-y-4">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t ? "Tax context" : "Contexte fiscal"}
                  </h2>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">
                      {t ? "Registered for GST/HST?" : "Inscrit pour la TPS/TVQ?"}
                    </p>
                    {[{ value: "yes", labelFr: "Oui", labelEn: "Yes" }, { value: "no", labelFr: "Non", labelEn: "No" }].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => set("sales_tax_registered", opt.value)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer text-left",
                          form.sales_tax_registered === opt.value
                            ? "border-brand bg-brand/10 text-white"
                            : "border-gray-700 bg-surface-raised text-gray-400 hover:border-gray-600"
                        )}
                      >
                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                          form.sales_tax_registered === opt.value ? "border-brand" : "border-gray-600"
                        )}>
                          {form.sales_tax_registered === opt.value && <div className="w-2 h-2 rounded-full bg-brand" />}
                        </div>
                        {t ? opt.labelEn : opt.labelFr}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">
                      {t ? "Annual revenue" : "Chiffre d'affaires annuel"}
                    </p>
                    {REVENUE_RANGES.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => set("revenue_range", r.value)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer text-left",
                          form.revenue_range === r.value
                            ? "border-brand bg-brand/10 text-white"
                            : "border-gray-700 bg-surface-raised text-gray-400 hover:border-gray-600"
                        )}
                      >
                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                          form.revenue_range === r.value ? "border-brand" : "border-gray-600"
                        )}>
                          {form.revenue_range === r.value && <div className="w-2 h-2 rounded-full bg-brand" />}
                        </div>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </section>
                {/* Danger zone — account deletion (Law 25 §28) */}
                <section className="space-y-4 pt-4 border-t border-gray-800">
                  <h2 className="text-xs font-semibold text-danger uppercase tracking-wider">
                    {t ? "Danger zone" : "Zone dangereuse"}
                  </h2>
                  <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-gray-300">
                      {t
                        ? "Permanently delete your account, all conversations, and all AI memories. This cannot be undone."
                        : "Supprimez définitivement votre compte, toutes vos conversations et tous vos souvenirs IA. Cette action est irréversible."}
                    </p>
                    <div className="space-y-1.5">
                      <label className="block text-xs text-gray-400">
                        {t
                          ? `Type your business name "${profile?.business_name ?? "..."}" to confirm`
                          : `Tapez le nom de votre entreprise "${profile?.business_name ?? "..."}" pour confirmer`}
                      </label>
                      <input
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder={profile?.business_name ?? ""}
                        className="w-full bg-surface-overlay border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-danger"
                      />
                    </div>
                    <button
                      disabled={deleteConfirm !== profile?.business_name || deleting}
                      onClick={async () => {
                        if (deleteConfirm !== profile?.business_name) return;
                        setDeleting(true);
                        try {
                          await deleteAccount(userId);
                          router.replace("/");
                        } catch {
                          setDeleting(false);
                        }
                      }}
                      className="flex items-center gap-2 text-xs font-semibold text-danger border border-danger/30 px-4 py-2 rounded-lg hover:bg-danger/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                      {deleting
                        ? (t ? "Deleting…" : "Suppression…")
                        : (t ? "Delete my account" : "Supprimer mon compte")}
                    </button>
                  </div>
                </section>
              </div>

              {/* Sticky save bar */}
              <div className="sticky bottom-0 border-t border-gray-800 bg-surface-raised px-4 py-3">
                <div className="max-w-xl mx-auto flex items-center justify-between lg:px-4">
                  {saved ? (
                    <span className="flex items-center gap-2 text-sm text-success">
                      <Check size={15} />
                      {t ? "Saved!" : "Sauvegardé!"}
                    </span>
                  ) : <span />}
                  <Button onClick={handleSave} loading={saving} disabled={!form.business_name}>
                    {t ? "Save changes" : "Sauvegarder"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileBottomTabs activeTab="settings" language={language} />
    </>
  );
}
