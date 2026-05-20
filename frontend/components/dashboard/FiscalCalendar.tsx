"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, Download } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Static 2025–2026 Canadian fiscal calendar
// ---------------------------------------------------------------------------

type EventType = "filing" | "remittance" | "installment" | "planning";
type Authority = "CRA" | "RQ" | "Both";

interface CalEvent {
  month: number;  // 1–12
  day: number;
  labelFr: string;
  label: string;
  type: EventType;
  authority: Authority;
  appliesTo?: string[];  // undefined = all
}

const EVENTS_2026: CalEvent[] = [
  { month: 2, day: 28, labelFr: "T4/RL-1 dus",              label: "T4/RL-1 Due",              type: "filing",      authority: "Both" },
  { month: 3, day: 15, labelFr: "Remise paie (fév)",         label: "Payroll Remittance (Feb)", type: "remittance",  authority: "CRA" },
  { month: 3, day: 31, labelFr: "TPS/TVQ annuel T4",         label: "GST/HST Annual Q4",        type: "remittance",  authority: "Both" },
  { month: 4, day: 15, labelFr: "Remise paie (mars)",        label: "Payroll Remittance (Mar)", type: "remittance",  authority: "CRA" },
  { month: 4, day: 30, labelFr: "Impôt personnel",           label: "Personal Tax",             type: "filing",      authority: "Both" },
  { month: 5, day: 15, labelFr: "Remise paie (avr)",         label: "Payroll Remittance (Apr)", type: "remittance",  authority: "CRA" },
  { month: 6, day: 15, labelFr: "T1 travailleur autonome",   label: "T1 Self-Employed",         type: "filing",      authority: "CRA" },
  { month: 6, day: 15, labelFr: "Remise paie (mai)",         label: "Payroll Remittance (May)", type: "remittance",  authority: "CRA" },
  { month: 6, day: 30, labelFr: "TPS/TVQ trim. T2",          label: "GST/HST Quarterly Q2",     type: "remittance",  authority: "Both" },
  { month: 7, day: 15, labelFr: "Remise paie (juin)",        label: "Payroll Remittance (Jun)", type: "remittance",  authority: "CRA" },
  { month: 8, day: 15, labelFr: "Remise paie (juil)",        label: "Payroll Remittance (Jul)", type: "remittance",  authority: "CRA" },
  { month: 9, day: 15, labelFr: "Remise paie (août)",        label: "Payroll Remittance (Aug)", type: "remittance",  authority: "CRA" },
  { month: 9, day: 30, labelFr: "TPS/TVQ trim. T3",          label: "GST/HST Quarterly Q3",     type: "remittance",  authority: "Both" },
  { month: 10, day: 15, labelFr: "Remise paie (sept)",       label: "Payroll Remittance (Sep)", type: "remittance",  authority: "CRA" },
  { month: 11, day: 15, labelFr: "Remise paie (oct)",        label: "Payroll Remittance (Oct)", type: "remittance",  authority: "CRA" },
  { month: 12, day: 15, labelFr: "Acomptes prov. (T3)",      label: "Installments (Q3)",        type: "installment", authority: "CRA" },
  { month: 12, day: 15, labelFr: "Remise paie (nov)",        label: "Payroll Remittance (Nov)", type: "remittance",  authority: "CRA" },
  { month: 12, day: 31, labelFr: "TPS/TVQ trim. T4",         label: "GST/HST Quarterly Q4",     type: "remittance",  authority: "Both" },
  { month: 12, day: 31, labelFr: "Planification fin d'année",label: "Year-End Tax Planning",    type: "planning",    authority: "CRA" },
];

const MONTH_NAMES_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const MONTH_NAMES_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TYPE_DOT: Record<EventType, string> = {
  filing:      "bg-danger",
  remittance:  "bg-brand-text",
  installment: "bg-warning",
  planning:    "bg-success",
};

// ARC = red (Canadian flag), RQ = blue (Quebec flag / fleur-de-lis)
// Using inline style for color so light-mode CSS overrides cannot touch the white text
const AUTHORITY_BADGE: Record<Authority, { label: string; bg: string }[]> = {
  CRA:  [{ label: "ARC", bg: "#dc2626" }],
  RQ:   [{ label: "RQ",  bg: "#2563eb" }],
  Both: [
    { label: "ARC", bg: "#dc2626" },
    { label: "RQ",  bg: "#2563eb" },
  ],
};

const TYPE_LABEL_FR: Record<EventType, string> = {
  filing:      "Production",
  remittance:  "Remise",
  installment: "Acompte",
  planning:    "Planification",
};

const TYPE_LABEL_EN: Record<EventType, string> = {
  filing:      "Filing",
  remittance:  "Remittance",
  installment: "Installment",
  planning:    "Planning",
};

// ---------------------------------------------------------------------------
// iCal export
// ---------------------------------------------------------------------------

function toIcalDate(year: number, month: number, day: number): string {
  return `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
}

function generateIcal(language: "fr" | "en"): string {
  const year = 2026;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Agent SMB//Fiscal Calendar//CA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${language === "fr" ? "Calendrier fiscal Agent SMB" : "Agent SMB Tax Calendar"}`,
  ];

  EVENTS_2026.forEach((ev, i) => {
    const dt = toIcalDate(year, ev.month, ev.day);
    const dtNext = toIcalDate(year, ev.month, ev.day + 1);
    lines.push(
      "BEGIN:VEVENT",
      `UID:agentsmb-${year}-${ev.month}-${ev.day}-${i}@cadieuxai.com`,
      `DTSTAMP:${toIcalDate(year, 1, 1)}T000000Z`,
      `DTSTART;VALUE=DATE:${dt}`,
      `DTEND;VALUE=DATE:${dtNext}`,
      `SUMMARY:${language === "fr" ? ev.labelFr : ev.label} [${ev.authority}]`,
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadIcal(language: "fr" | "en") {
  const content = generateIcal(language);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = language === "fr" ? "calendrier-fiscal-2026.ics" : "tax-calendar-2026.ics";
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Installment estimator (mirrors backend logic, for client-side display)
// ---------------------------------------------------------------------------

function estimateQuarterlyInstallment(income: number, province: string): number | null {
  if (income <= 0) return null;

  const federalTax = (() => {
    const brackets: [number, number][] = [[57375, 0.15],[57375, 0.205],[63895, 0.26],[76782, 0.29],[Infinity, 0.33]];
    let tax = 0, rem = income;
    for (const [size, rate] of brackets) {
      const chunk = Math.min(rem, size);
      tax += chunk * rate;
      rem -= chunk;
      if (rem <= 0) break;
    }
    return Math.max(tax - 15705 * 0.15, 0);
  })();

  const cpp = province.toUpperCase() === "QC"
    ? Math.min(Math.max(income - 3500, 0), 69700) * 0.128
    : Math.min(Math.max(income - 3500, 0), 65000) * 0.119;

  const provRates: Record<string, number> = {
    QC: 0.14, ON: 0.085, BC: 0.087, AB: 0.10, MB: 0.109,
    SK: 0.105, NS: 0.115, NB: 0.103, NL: 0.119, PE: 0.098,
  };
  const provRate = provRates[province.toUpperCase()] ?? 0.10;
  const provTax = Math.max(income * provRate - 15000 * provRate, 0);

  const total = federalTax + cpp + provTax;
  return total > 3000 ? Math.round(total / 4) : null;
}

interface FiscalCalendarProps {
  language?: "fr" | "en";
  priorYearIncome?: number | null;
  province?: string;
}

export default function FiscalCalendar({ language = "fr", priorYearIncome, province = "QC" }: FiscalCalendarProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const t = language === "en";

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-indexed
  const quarterlyAmount = priorYearIncome ? estimateQuarterlyInstallment(priorYearIncome, province) : null;

  // Next 3 upcoming deadline chips (sorted by month/day from now)
  const upcoming = EVENTS_2026
    .filter((ev) => ev.month > currentMonth || (ev.month === currentMonth && ev.day >= today.getDate()))
    .sort((a, b) => a.month !== b.month ? a.month - b.month : a.day - b.day)
    .filter((ev, i, arr) => arr.findIndex(e => e.labelFr === ev.labelFr) === i) // dedupe same-label
    .slice(0, 3);

  const monthNames = t ? MONTH_NAMES_EN : MONTH_NAMES_FR;

  return (
    <div className="bg-surface-raised border border-gray-800 rounded-xl p-5 space-y-4 card-glow transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-brand-text" />
          <h3 className="text-sm font-semibold text-white">
            {t ? "Your Tax Calendar 2026" : "Votre calendrier fiscal 2026"}
          </h3>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          aria-expanded={expanded}
        >
          {expanded
            ? (t ? "Collapse" : "Réduire")
            : (t ? "See all" : "Voir tout")}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Installment amount banner */}
      {quarterlyAmount && (
        <div className="flex items-center justify-between bg-warning/5 border border-warning/20 rounded-xl px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-warning">
              {t ? "Estimated quarterly installments" : "Acomptes provisionnels estimés"}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {t ? "Mar 15 · Jun 15 · Sep 15 · Dec 15 · Estimate only" : "15 mars · 15 juin · 15 sept · 15 déc · Estimation seulement"}
            </p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-xl font-bold text-warning">{quarterlyAmount.toLocaleString("fr-CA")} $</p>
            <p className="text-[10px] text-gray-500">{t ? "/ quarter" : "/ trimestre"}</p>
          </div>
        </div>
      )}

      {/* Collapsed: next 3 chips with ARC/RQ badges */}
      {!expanded && (
        <div className="flex flex-wrap gap-2">
          {upcoming.map((ev, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-surface-overlay border border-gray-700 rounded-full px-3 py-1.5 text-xs"
            >
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", TYPE_DOT[ev.type])} />
              {AUTHORITY_BADGE[ev.authority].map((b) => (
                <span key={b.label} className="text-[9px] font-bold px-1 rounded" style={{ background: b.bg, color: "#fff" }}>{b.label}</span>
              ))}
              <span className="text-gray-300 font-medium">
                {monthNames[ev.month - 1]} {ev.day}
              </span>
              <span className="text-gray-500">—</span>
              <span className="text-gray-400">{t ? ev.label : ev.labelFr}</span>
            </div>
          ))}
          {upcoming.length === 0 && (
            <p className="text-xs text-gray-500">{t ? "No more deadlines this year" : "Pas d'autres échéances cette année"}</p>
          )}
        </div>
      )}

      {/* Expanded: 12-month grid */}
      {expanded && (
        <>
          {/* Legend — always visible, split into type + authority */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {(["filing", "remittance", "installment", "planning"] as EventType[]).map((type) => (
              <div key={type} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <span className={cn("w-2 h-2 rounded-full shrink-0", TYPE_DOT[type])} />
                {t ? TYPE_LABEL_EN[type] : TYPE_LABEL_FR[type]}
              </div>
            ))}
            <span className="text-[10px] text-gray-700">·</span>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="px-1.5 rounded text-[9px] font-semibold" style={{ background: "#dc2626", color: "#fff" }}>ARC</span>
              {t ? "Federal (Canada)" : "Fédéral (Canada)"}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="px-1.5 rounded text-[9px] font-semibold" style={{ background: "#2563eb", color: "#fff" }}>RQ</span>
              {t ? "Quebec (Revenu Québec)" : "Québec (Revenu Québec)"}
            </div>
          </div>

          {/* Grid — 2-col on mobile for larger touch targets, 4-col on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
              const monthEvents = EVENTS_2026.filter((ev) => ev.month === month);
              const isPast = month < currentMonth;
              const isCurrent = month === currentMonth;

              return (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(selectedMonth === month ? null : month)}
                  className={cn(
                    "rounded-xl border p-2.5 space-y-1.5 transition-colors text-left min-h-[64px]",
                    selectedMonth === month
                      ? "border-brand bg-brand/10"
                      : isCurrent
                      ? "border-brand/40 bg-brand/5 hover:border-brand/60"
                      : isPast
                      ? "border-gray-800 bg-surface-base opacity-50 cursor-default"
                      : "border-gray-800 bg-surface-base hover:border-gray-600"
                  )}
                >
                  <p className={cn(
                    "text-[11px] font-semibold",
                    isCurrent ? "text-brand-text" : isPast ? "text-gray-600" : "text-gray-300"
                  )}>
                    {monthNames[month - 1]}
                  </p>
                  {monthEvents.length === 0 ? (
                    <p className="text-[9px] text-gray-700">—</p>
                  ) : (
                    <div className="space-y-1">
                      {monthEvents.map((ev, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", TYPE_DOT[ev.type])} />
                          {AUTHORITY_BADGE[ev.authority].map((b) => (
                            <span key={b.label} className="text-[8px] font-bold px-0.5 rounded leading-tight" style={{ background: b.bg, color: "#fff" }}>{b.label}</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom sheet — month detail on tap */}
          {selectedMonth !== null && (() => {
            const evs = EVENTS_2026.filter((ev) => ev.month === selectedMonth);
            return (
              <div className="bg-surface-overlay border border-gray-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{monthNames[selectedMonth - 1]} 2026</p>
                  <button onClick={() => setSelectedMonth(null)} className="text-gray-500 hover:text-gray-300 text-xs">{t ? "Close" : "Fermer"}</button>
                </div>
                {evs.length === 0 ? (
                  <p className="text-sm text-gray-500">{t ? "No deadlines this month." : "Aucune échéance ce mois-ci."}</p>
                ) : (
                  <div className="space-y-2.5">
                    {evs.map((ev, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", TYPE_DOT[ev.type])} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm text-white font-medium">{t ? ev.label : ev.labelFr}</p>
                            {AUTHORITY_BADGE[ev.authority].map((b) => (
                              <span key={b.label} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: b.bg, color: "#fff" }}>{b.label}</span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">{monthNames[selectedMonth - 1]} {ev.day}, 2026</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Export */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => downloadIcal(language)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Download size={12} />
              {t ? "Add to Calendar (.ics)" : "Ajouter au calendrier (.ics)"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
