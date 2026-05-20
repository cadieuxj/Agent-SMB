"use client";

import { useState } from "react";
import { TrendingUp, Pencil, Check, X } from "lucide-react";
import { updateProfile } from "@/lib/api";
import { cn } from "@/lib/utils";

const INSTALLMENT_DATES    = ["Mar 15", "Jun 15", "Sep 15", "Dec 15"];
const INSTALLMENT_DATES_FR = ["15 mars", "15 juin", "15 sept", "15 déc"];

function nextInstallmentDate(t: boolean): string {
  const now = new Date();
  const year = now.getFullYear();
  const deadlines = [
    new Date(year, 2, 15),
    new Date(year, 5, 15),
    new Date(year, 8, 15),
    new Date(year, 11, 15),
  ];
  const labels = t ? INSTALLMENT_DATES : INSTALLMENT_DATES_FR;
  for (let i = 0; i < deadlines.length; i++) {
    if (deadlines[i] >= now) {
      const days = Math.ceil((deadlines[i].getTime() - now.getTime()) / 86_400_000);
      const dayLabel = days === 0
        ? (t ? "Today" : "Aujourd'hui")
        : days === 1
        ? (t ? "Tomorrow" : "Demain")
        : t ? `In ${days} days` : `Dans ${days} jours`;
      return `${labels[i]} — ${dayLabel}`;
    }
  }
  return t ? "Mar 15 (next year)" : "15 mars (prochain)";
}

function estimateQuarterly(income: number, province: string): number | null {
  if (income <= 0) return null;
  const fed = (() => {
    const b: [number, number][] = [[57375,0.15],[57375,0.205],[63895,0.26],[76782,0.29],[Infinity,0.33]];
    let tax = 0, rem = income;
    for (const [s, r] of b) { const c = Math.min(rem, s); tax += c * r; rem -= c; if (rem <= 0) break; }
    return Math.max(tax - 15705 * 0.15, 0);
  })();
  const cpp = province.toUpperCase() === "QC"
    ? Math.min(Math.max(income - 3500, 0), 69700) * 0.128
    : Math.min(Math.max(income - 3500, 0), 65000) * 0.119;
  const rates: Record<string, number> = { QC:0.14, ON:0.085, BC:0.087, AB:0.10, MB:0.109, SK:0.105, NS:0.115, NB:0.103, NL:0.119, PE:0.098 };
  const prov = Math.max(income * (rates[province.toUpperCase()] ?? 0.10) - 15000 * (rates[province.toUpperCase()] ?? 0.10), 0);
  const total = fed + cpp + prov;
  return total > 3000 ? Math.round(total / 4) : null;
}

interface InstallmentCardProps {
  language?: "fr" | "en";
  priorYearIncome: number;
  province: string;
  userId: string;
  onIncomeUpdated?: (newIncome: number) => void;
}

export default function InstallmentCard({
  language = "fr",
  priorYearIncome,
  province,
  userId,
  onIncomeUpdated,
}: InstallmentCardProps) {
  const t = language === "en";
  const [income, setIncome] = useState(priorYearIncome);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(priorYearIncome));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const quarterly = estimateQuarterly(income, province);
  if (!quarterly) return null;

  const nextDate = nextInstallmentDate(t);
  const formatted = quarterly.toLocaleString(t ? "en-CA" : "fr-CA");

  async function handleSave() {
    const parsed = parseFloat(draft.replace(/[^0-9.]/g, ""));
    if (isNaN(parsed) || parsed <= 0) { setEditing(false); setDraft(String(income)); return; }
    setSaving(true);
    try {
      await updateProfile(userId, { prior_year_net_income: parsed });
      setIncome(parsed);
      onIncomeUpdated?.(parsed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  function handleCancel() {
    setDraft(String(income));
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-warning/5 border border-warning/30 rounded-xl px-5 py-4 card-glow">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
          <TrendingUp size={17} className="text-warning" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-warning uppercase tracking-wide">
            {t ? "Next installment" : "Prochain acompte"}
          </p>
          <p className="text-sm font-bold text-white mt-0.5">{nextDate}</p>
          {/* Inline income editor */}
          {editing ? (
            <div className="flex items-center gap-1.5 mt-1.5">
              <input
                type="number"
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
                className="w-28 text-xs bg-surface-overlay border border-warning/40 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-warning"
                placeholder={t ? "Annual income" : "Revenu annuel"}
              />
              <button onClick={handleSave} disabled={saving} className="text-success hover:text-green-300 transition-colors">
                <Check size={14} />
              </button>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-300 transition-colors">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[11px] text-gray-500">
                {saved
                  ? (t ? "Updated ✓" : "Mis à jour ✓")
                  : (t ? "Estimate only · Consult a CPA" : "Estimation seulement · Consultez un CPA")}
              </p>
              <button
                onClick={() => { setDraft(String(income)); setEditing(true); }}
                className="text-gray-600 hover:text-warning transition-colors"
                title={t ? "Update your prior-year income" : "Mettre à jour votre revenu annuel"}
              >
                <Pencil size={11} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-2xl font-bold text-warning">{formatted} $</p>
        <p className="text-[11px] text-gray-500">{t ? "/ quarter" : "/ trimestre"}</p>
      </div>
    </div>
  );
}
