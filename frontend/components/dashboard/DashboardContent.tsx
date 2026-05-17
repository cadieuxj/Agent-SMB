"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { getProfile, getDeadlines, getSuggestions, getMemories } from "@/lib/api";
import type { Profile, Deadline, Suggestion, Memory } from "@/lib/api";
import { CalendarClock, Lightbulb, ArrowRight } from "lucide-react";
import NavSidebar from "@/components/layout/NavSidebar";
import MobileBottomTabs from "@/components/layout/MobileBottomTabs";
import MobileDrawer from "@/components/layout/MobileDrawer";
import DeadlineCard from "@/components/dashboard/DeadlineCard";
import SuggestionsCard from "@/components/dashboard/SuggestionsCard";
import MemorySnapshot from "@/components/dashboard/MemorySnapshot";
import QuickChat from "@/components/dashboard/QuickChat";
import { Spinner } from "@/components/ui/spinner";

function PriorityHero({ deadline, suggestion, language }: { deadline: Deadline | null; suggestion: Suggestion | null; language: "fr" | "en" }) {
  const t = language === "en";
  if (deadline) {
    const urgent = deadline.days_until <= 14;
    return (
      <div className={`rounded-xl border px-5 py-4 flex items-center justify-between gap-4 ${urgent ? "bg-danger/5 border-danger/30" : "bg-warning/5 border-warning/30"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <CalendarClock size={20} className={urgent ? "text-danger shrink-0" : "text-warning shrink-0"} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
              {t ? "Next deadline" : "Prochaine échéance"}
            </p>
            <p className="text-sm font-semibold text-white truncate">
              {language === "fr" ? deadline.title_fr : deadline.title}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-lg font-bold ${urgent ? "text-danger" : "text-warning"}`}>
            {deadline.days_until === 0 ? (t ? "Today" : "Aujourd'hui") : deadline.days_until === 1 ? (t ? "Tomorrow" : "Demain") : `${deadline.days_until}j`}
          </p>
          <p className="text-[10px] text-gray-500">{deadline.authority}</p>
        </div>
      </div>
    );
  }
  if (suggestion) {
    return (
      <Link href="/chat" className="block rounded-xl border border-brand/20 bg-brand/5 px-5 py-4 hover:border-brand/40 transition-colors">
        <div className="flex items-start gap-3">
          <Lightbulb size={18} className="text-brand-text shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-text mb-1">
              {t ? "Suggestion" : "Suggestion"}
            </p>
            <p className="text-sm text-gray-200 leading-relaxed line-clamp-2">{suggestion.content}</p>
          </div>
          <ArrowRight size={15} className="text-gray-600 shrink-0 mt-1" />
        </div>
      </Link>
    );
  }
  return null;
}

export default function DashboardContent({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const language = (profile?.language ?? "fr") as "fr" | "en";
  const t = language === "en";

  useEffect(() => {
    Promise.all([
      getProfile(userId),
      getDeadlines(userId),
      getSuggestions(userId),
      getMemories(userId),
    ]).then(([p, d, s, m]) => {
      setProfile(p);
      setDeadlines(d);
      setSuggestions(s);
      setMemories(m);
      setLoading(false);
    });
  }, [userId]);

  const firstName = profile?.full_name?.split(" ")[0] ?? null;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t ? "Good morning" : "Bonjour";
    if (hour < 18) return t ? "Good afternoon" : "Bon après-midi";
    return t ? "Good evening" : "Bonsoir";
  };

  const sidebarProps = { profile, userEmail, language };

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <NavSidebar className="hidden lg:flex" {...sidebarProps} />

        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <NavSidebar {...sidebarProps} />
        </MobileDrawer>

        <div className="flex-1 flex flex-col min-w-0 pb-14 lg:pb-0 overflow-hidden">
          {/* Mobile header */}
          <div className="flex lg:hidden items-center h-12 px-4 border-b border-gray-800 shrink-0 bg-surface-raised">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
              aria-label={t ? "Open menu" : "Ouvrir le menu"}
            >
              <Menu size={20} />
            </button>
            <span className="ml-3 font-semibold text-sm text-white truncate">
              {profile?.business_name ?? "Agent SMB"}
            </span>
          </div>

          <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Page header */}
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {firstName ? `${greeting()}, ${firstName}` : greeting()}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {profile?.business_name
                      ? (t ? `Overview for ${profile.business_name}` : `Aperçu de ${profile.business_name}`)
                      : (t ? "Your business overview" : "Aperçu de votre entreprise")}
                  </p>
                </div>

                {/* Priority action hero — most urgent deadline or top suggestion */}
                {(deadlines.length > 0 || suggestions.length > 0) && (
                  <PriorityHero
                    deadline={deadlines[0] ?? null}
                    suggestion={suggestions[0] ?? null}
                    language={language}
                  />
                )}

                {/* Widget grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <DeadlineCard deadlines={deadlines} language={language} userId={userId} />
                  <SuggestionsCard suggestions={suggestions} language={language} />
                  <MemorySnapshot memories={memories} language={language} />
                  <QuickChat
                    language={language}
                    businessName={profile?.business_name}
                    firstName={firstName}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <MobileBottomTabs activeTab="dashboard" language={language} />
    </>
  );
}
