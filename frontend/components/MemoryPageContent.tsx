"use client";

import { useState, useEffect } from "react";
import { Menu, Brain, Inbox, Trash2, Undo2, ShieldCheck, Lock, BadgeCheck, FileCheck, Zap } from "lucide-react";
import { getProfile, getMemories, deleteMemory, type Memory, type Profile } from "@/lib/api";
import UpgradeModal from "@/components/UpgradeModal";
import NavSidebar from "@/components/layout/NavSidebar";
import MobileBottomTabs from "@/components/layout/MobileBottomTabs";
import MobileDrawer from "@/components/layout/MobileDrawer";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type TabId = "all" | "tax" | "cashflow" | "profile";

const TAX_RE = /impôt|fiscal|tps|tvq|gst|hst|déclaration|déduction|crédit|arc|cra|taxe|cotisation|rpc|rrq/i;
const CASH_RE = /trésorerie|cash|flux|dépense|revenu|chiffre|facturation|paiement|invoice|payment|vente/i;
const PROFILE_RE = /entreprise|business|province|secteur|activité|employé|fondé|créé|ouvert|industrie/i;

function filterMemories(memories: Memory[], tab: TabId): Memory[] {
  if (tab === "all") return memories;
  if (tab === "tax") return memories.filter((m) => TAX_RE.test(m.memory));
  if (tab === "cashflow") return memories.filter((m) => CASH_RE.test(m.memory));
  if (tab === "profile") return memories.filter((m) => PROFILE_RE.test(m.memory));
  return memories;
}

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Données au Canada" },
  { icon: Lock,        label: "Chiffrement" },
  { icon: BadgeCheck,  label: "Conforme ARC/CRA" },
  { icon: FileCheck,   label: "Aucun partage" },
];

export default function MemoryPageContent({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Undo-delete state
  const [pendingDeletes, setPendingDeletes] = useState<Map<string, { memory: Memory; timer: ReturnType<typeof setTimeout> }>>(new Map());
  const [isPro, setIsPro] = useState(false);

  const language = (profile?.language ?? "fr") as "fr" | "en";
  const t = language === "en";

  useEffect(() => {
    Promise.all([getProfile(userId), getMemories(userId)]).then(([p, m]) => {
      setProfile(p);
      setMemories(m);
      setLoading(false);
    });
    setIsPro(localStorage.getItem(`agentsmb_pro_${userId}`) === "true");
  }, [userId]);

  function handleDelete(memory: Memory) {
    setMemories((prev) => prev.filter((m) => m.id !== memory.id));
    const timer = setTimeout(() => {
      deleteMemory(userId, memory.id).catch(() => {});
      setPendingDeletes((prev) => {
        const next = new Map(prev);
        next.delete(memory.id);
        return next;
      });
    }, 3000);
    setPendingDeletes((prev) => new Map(prev).set(memory.id, { memory, timer }));
  }

  function handleUndo(memoryId: string) {
    const entry = pendingDeletes.get(memoryId);
    if (!entry) return;
    clearTimeout(entry.timer);
    setMemories((prev) => [entry.memory, ...prev]);
    setPendingDeletes((prev) => {
      const next = new Map(prev);
      next.delete(memoryId);
      return next;
    });
  }

  const TABS: { id: TabId; labelFr: string; labelEn: string }[] = [
    { id: "all",      labelFr: "Tout",        labelEn: "All" },
    { id: "tax",      labelFr: "Fiscalité",   labelEn: "Tax" },
    { id: "cashflow", labelFr: "Trésorerie",  labelEn: "Cash flow" },
    { id: "profile",  labelFr: "Profil",      labelEn: "Profile" },
  ];

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const FREE_MEMORY_LIMIT = 5;
  const filtered = filterMemories(memories, activeTab);
  const visibleMemories = isPro ? filtered : filtered.slice(0, FREE_MEMORY_LIMIT);
  const lockedMemories = isPro ? [] : filtered.slice(FREE_MEMORY_LIMIT);
  const pendingList = [...pendingDeletes.values()];

  function handleUpgrade() {
    localStorage.setItem(`agentsmb_pro_${userId}`, "true");
    setIsPro(true);
    setShowUpgradeModal(false);
  }

  return (
    <>
      {showUpgradeModal && (
        <UpgradeModal language={language} onClose={() => setShowUpgradeModal(false)} onUpgrade={handleUpgrade} />
      )}
      <div className="flex h-screen overflow-hidden">
        <NavSidebar className="hidden lg:flex" profile={profile} userEmail={userEmail} language={language} />

        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <NavSidebar profile={profile} userEmail={userEmail} language={language} />
        </MobileDrawer>

        <div className="flex-1 flex flex-col min-w-0 pb-14 lg:pb-0 overflow-hidden">
          <div className="flex lg:hidden items-center h-12 px-4 border-b border-gray-800 shrink-0 bg-surface-raised">
            <button onClick={() => setDrawerOpen(true)} className="p-1 text-gray-400 hover:text-gray-200 transition-colors" aria-label={t ? "Open menu" : "Ouvrir le menu"}>
              <Menu size={20} />
            </button>
            <span className="ml-3 font-semibold text-sm text-white">{t ? "Memory" : "Mémoire"}</span>
          </div>

          <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <Brain size={22} className="text-agent-advisor" />
                  <div>
                    <h1 className="text-xl font-bold text-white">{t ? "Memory" : "Mémoire"}</h1>
                    <p className="text-sm text-gray-500">
                      {t
                        ? `${memories.length} thing${memories.length !== 1 ? "s" : ""} remembered about your business`
                        : `${memories.length} souvenir${memories.length !== 1 ? "s" : ""} sur votre entreprise`}
                    </p>
                  </div>
                </div>

                {/* Category tabs */}
                <div className="flex gap-1 border-b border-gray-800 pb-0">
                  {TABS.map(({ id, labelFr, labelEn }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
                        activeTab === id
                          ? "border-brand text-white"
                          : "border-transparent text-gray-500 hover:text-gray-300"
                      )}
                    >
                      {t ? labelEn : labelFr}
                    </button>
                  ))}
                </div>

                {/* Memory cards */}
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <Inbox size={36} className="text-gray-700" strokeWidth={1.5} />
                    <p className="text-sm text-gray-500">
                      {activeTab === "all"
                        ? (t ? "No memories yet. Start a conversation!" : "Aucun souvenir. Commencez une conversation !")
                        : (t ? "No memories in this category." : "Aucun souvenir dans cette catégorie.")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visibleMemories.map((m) => (
                      <div
                        key={m.id}
                        className="group flex items-start gap-3 bg-surface-raised border border-gray-800 rounded-xl px-4 py-3 hover:border-gray-700 transition-colors"
                      >
                        <p className="flex-1 text-sm text-gray-200 leading-relaxed">{m.memory}</p>
                        <button
                          onClick={() => handleDelete(m)}
                          className="shrink-0 mt-0.5 text-gray-600 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                          aria-label={t ? "Delete" : "Supprimer"}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}

                    {/* Pro blur overlay for locked memories */}
                    {lockedMemories.length > 0 && (
                      <div className="relative">
                        <div className="space-y-2 pointer-events-none select-none">
                          {lockedMemories.slice(0, 3).map((m) => (
                            <div key={m.id} className="flex items-start gap-3 bg-surface-raised border border-gray-800 rounded-xl px-4 py-3 blur-sm">
                              <p className="flex-1 text-sm text-gray-200 leading-relaxed">{m.memory}</p>
                            </div>
                          ))}
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-base/80 rounded-xl backdrop-blur-sm">
                          <p className="text-sm font-medium text-white text-center px-4">
                            {t
                              ? `${lockedMemories.length} more memories with Pro`
                              : `${lockedMemories.length} souvenir${lockedMemories.length > 1 ? "s" : ""} de plus avec Pro`}
                          </p>
                          <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                          >
                            <Zap size={13} />
                            {t ? "Upgrade to Pro" : "Passer à Pro"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Trust block */}
                <div className="border-t border-gray-800 pt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TRUST_BADGES.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-surface-raised border border-gray-800">
                        <Icon size={15} className="text-success" />
                        <span className="text-[10px] text-gray-500 text-center leading-tight font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Undo toasts */}
      {pendingList.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
          {pendingList.map(({ memory }) => (
            <div
              key={memory.id}
              className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 shadow-lg text-sm text-white"
            >
              <span className="text-gray-400 truncate max-w-[200px]">
                {t ? "Memory deleted" : "Souvenir supprimé"}
              </span>
              <button
                onClick={() => handleUndo(memory.id)}
                className="flex items-center gap-1.5 text-brand-text hover:text-brand font-medium shrink-0 transition-colors"
              >
                <Undo2 size={14} />
                {t ? "Undo" : "Annuler"}
              </button>
            </div>
          ))}
        </div>
      )}

      <MobileBottomTabs activeTab="memory" language={language} />
    </>
  );
}
