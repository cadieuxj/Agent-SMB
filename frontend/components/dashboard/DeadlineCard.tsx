"use client";

import { useState, useEffect } from "react";
import { CalendarClock, CheckCircle2, Bell, BellOff, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNotificationPrefs, saveNotificationPrefs, type NotificationPrefs } from "@/lib/api";
import type { Deadline } from "@/lib/api";

interface DeadlineCardProps {
  deadlines: Deadline[];
  language?: "fr" | "en";
  userId?: string;
}

function urgencyColor(days: number) {
  if (days <= 14) return "text-danger";
  if (days <= 30) return "text-warning";
  return "text-success";
}

function urgencyBorder(days: number) {
  if (days <= 14) return "border-l-danger";
  if (days <= 30) return "border-l-warning";
  return "border-l-success";
}

export default function DeadlineCard({ deadlines, language = "fr", userId }: DeadlineCardProps) {
  const t = language === "en";
  const upcoming = deadlines.slice(0, 3);
  const [showModal, setShowModal] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>({ deadline_email: false, reminder_days_before: 7 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userId) {
      getNotificationPrefs(userId).then(setPrefs);
    }
  }, [userId]);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    try {
      await saveNotificationPrefs(userId, prefs);
      setSaved(true);
      setTimeout(() => { setSaved(false); setShowModal(false); }, 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="bg-surface-raised border border-gray-800 rounded-xl p-5 space-y-4 card-glow transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock size={16} className="text-warning" />
            <h3 className="text-sm font-semibold text-white">
              {t ? "Upcoming deadlines" : "Échéances à venir"}
            </h3>
          </div>
          {userId && (
            <button
              onClick={() => setShowModal(true)}
              title={t ? "Email reminders" : "Rappels par courriel"}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                prefs.deadline_email
                  ? "text-brand-text bg-brand/10"
                  : "text-gray-600 hover:text-gray-300 hover:bg-surface-overlay"
              )}
            >
              {prefs.deadline_email ? <Bell size={14} /> : <BellOff size={14} />}
            </button>
          )}
        </div>

        {upcoming.length === 0 ? (
          <div className="flex items-center gap-2 py-2 text-success">
            <CheckCircle2 size={16} />
            <p className="text-sm text-gray-400">
              {t ? "No upcoming deadlines" : "Aucune échéance imminente"}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((d, i) => (
              <li key={i} className={cn("pl-3 border-l-2 space-y-0.5", urgencyBorder(d.days_until))}>
                <p className="text-sm text-white font-medium leading-tight">
                  {language === "fr" ? d.title_fr : d.title}
                </p>
                <p className={cn("text-xs font-medium", urgencyColor(d.days_until))}>
                  {d.days_until === 0
                    ? (t ? "Today" : "Aujourd'hui")
                    : d.days_until === 1
                    ? (t ? "Tomorrow" : "Demain")
                    : t ? `In ${d.days_until} days` : `Dans ${d.days_until} jours`}
                  {" · "}
                  <span className="text-gray-500 font-normal">{d.authority}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Notification opt-in modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-surface-raised border border-gray-700 rounded-2xl w-full max-w-sm p-6 space-y-5 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-300"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                <Bell size={18} className="text-brand-text" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {t ? "Deadline reminders" : "Rappels d'échéances"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t ? "Get notified by email before CRA/RQ deadlines" : "Recevez un courriel avant vos échéances ARC/RQ"}
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setPrefs(p => ({ ...p, deadline_email: !p.deadline_email }))}
                className={cn(
                  "w-10 h-6 rounded-full transition-colors relative cursor-pointer",
                  prefs.deadline_email ? "bg-brand" : "bg-gray-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                  prefs.deadline_email ? "translate-x-5" : "translate-x-1"
                )} />
              </div>
              <span className="text-sm text-gray-300">
                {t ? "Email reminders enabled" : "Rappels par courriel activés"}
              </span>
            </label>

            {prefs.deadline_email && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400">
                  {t ? "Remind me this many days before:" : "Me rappeler combien de jours avant :"}
                </p>
                <div className="flex gap-2">
                  {[3, 7, 14].map((days) => (
                    <button
                      key={days}
                      onClick={() => setPrefs(p => ({ ...p, reminder_days_before: days }))}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                        prefs.reminder_days_before === days
                          ? "border-brand bg-brand/10 text-brand-text"
                          : "border-gray-700 text-gray-400 hover:border-gray-600"
                      )}
                    >
                      {days}j
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
            >
              {saved ? <><Check size={15} /> {t ? "Saved!" : "Sauvegardé!"}</> : (t ? "Save preferences" : "Sauvegarder")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
