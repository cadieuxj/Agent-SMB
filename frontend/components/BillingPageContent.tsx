"use client";

import { useState, useEffect } from "react";
import { Menu, CreditCard, Zap } from "lucide-react";
import { getProfile, type Profile } from "@/lib/api";
import NavSidebar from "@/components/layout/NavSidebar";
import MobileBottomTabs from "@/components/layout/MobileBottomTabs";
import MobileDrawer from "@/components/layout/MobileDrawer";
import Link from "next/link";
import UpgradeModal from "@/components/UpgradeModal";
import { PlanCard } from "@/components/ui/plan-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";

const FREE_LIMIT = 50;

const PLANS = {
  fr: [
    {
      name: "Gratuit",
      price: "0 $",
      priceNote: "/mois",
      description: "Pour découvrir Agent SMB",
      features: [
        "50 messages / mois",
        "Agent conseiller général",
        "Mémoire limitée (5 souvenirs)",
        "Support communautaire",
      ],
      ctaLabel: "Plan actuel",
      isCurrent: true,
    },
    {
      name: "Pro",
      price: "49 $",
      priceNote: "/mois CAD",
      description: "Pour les PME sérieuses",
      features: [
        "Messages illimités",
        "Agents Fiscalité + Trésorerie",
        "Mémoire complète (aucune limite)",
        "Support prioritaire",
      ],
      highlighted: true,
      popularLabel: "Populaire",
      ctaLabel: "Passer à Pro",
      isCurrent: false,
    },
    {
      name: "Entreprise",
      price: "99 $",
      priceNote: "/mois CAD",
      description: "Pour les équipes et comptables",
      features: [
        "Tout Pro inclus",
        "3 utilisateurs (seats)",
        "Accès API",
        "Support dédié",
      ],
      ctaLabel: "Contacter",
      isCurrent: false,
    },
  ],
  en: [
    {
      name: "Free",
      price: "$0",
      priceNote: "/mo",
      description: "Try Agent SMB",
      features: [
        "50 messages / month",
        "General advisor agent",
        "Limited memory (5 items)",
        "Community support",
      ],
      ctaLabel: "Current plan",
      isCurrent: true,
    },
    {
      name: "Pro",
      price: "$49",
      priceNote: "/mo CAD",
      description: "For serious SMBs",
      features: [
        "Unlimited messages",
        "Tax + Cash Flow agents",
        "Full memory (no limit)",
        "Priority support",
      ],
      highlighted: true,
      popularLabel: "Popular",
      ctaLabel: "Upgrade to Pro",
      isCurrent: false,
    },
    {
      name: "Business",
      price: "$99",
      priceNote: "/mo CAD",
      description: "For teams & accountants",
      features: [
        "Everything in Pro",
        "3 user seats",
        "API access",
        "Dedicated support",
      ],
      ctaLabel: "Contact us",
      isCurrent: false,
    },
  ],
};

export default function BillingPageContent({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [msgCount, setMsgCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const language = (profile?.language ?? "fr") as "fr" | "en";
  const t = language === "en";
  const plans = PLANS[language];

  useEffect(() => {
    getProfile(userId).then((p) => { setProfile(p); setLoading(false); });
    setMsgCount(parseInt(localStorage.getItem(`agentsmb_msgs_${userId}`) ?? "0", 10));
    setIsPro(localStorage.getItem(`agentsmb_pro_${userId}`) === "true");
  }, [userId]);

  function handleUpgrade() {
    localStorage.setItem(`agentsmb_pro_${userId}`, "true");
    setIsPro(true);
    setShowModal(false);
  }

  const usagePct = Math.round((msgCount / FREE_LIMIT) * 100);

  return (
    <>
      {showModal && (
        <UpgradeModal
          language={language}
          onClose={() => setShowModal(false)}
          onUpgrade={handleUpgrade}
        />
      )}

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
            <span className="ml-3 font-semibold text-sm text-white">{t ? "Billing" : "Facturation"}</span>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
          ) : (
            <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
              <div className="max-w-3xl mx-auto space-y-8">
                {/* Tab navigation */}
                <div className="flex gap-1 border-b border-gray-800 -mx-4 px-4 lg:-mx-8 lg:px-8">
                  <Link
                    href="/settings"
                    className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-300 -mb-px transition-colors"
                  >
                    {t ? "Profile" : "Profil"}
                  </Link>
                  <span className="px-4 py-2 text-sm font-medium border-b-2 border-brand text-white -mb-px">
                    {t ? "Billing" : "Facturation"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard size={22} className="text-brand-text" />
                  <h1 className="text-xl font-bold text-white">{t ? "Billing" : "Facturation"}</h1>
                </div>

                {/* Current plan summary */}
                <div className="bg-surface-raised border border-gray-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                        {t ? "Current plan" : "Plan actuel"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {isPro ? (
                          <span className="flex items-center gap-1.5 text-brand-text font-semibold">
                            <Zap size={14} /> Pro
                          </span>
                        ) : (
                          <span className="text-white font-semibold">{t ? "Free" : "Gratuit"}</span>
                        )}
                      </div>
                    </div>
                    {!isPro && (
                      <button
                        onClick={() => setShowModal(true)}
                        className="text-xs text-brand-text hover:text-brand border border-brand/30 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        {t ? "Upgrade" : "Mettre à niveau"}
                      </button>
                    )}
                  </div>

                  {!isPro && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{t ? "Messages this month" : "Messages ce mois"}</span>
                        <span className={msgCount >= FREE_LIMIT ? "text-danger font-medium" : ""}>
                          {msgCount} / {FREE_LIMIT}
                        </span>
                      </div>
                      <ProgressBar value={usagePct} />
                      {msgCount >= 40 && msgCount < FREE_LIMIT && (
                        <p className="text-xs text-warning">
                          {t
                            ? "You're approaching your limit. Upgrade to continue."
                            : "Vous approchez de votre limite. Mettez à niveau pour continuer."}
                        </p>
                      )}
                      {msgCount >= FREE_LIMIT && (
                        <p className="text-xs text-danger">
                          {t
                            ? "Limit reached. Upgrade to send more messages."
                            : "Limite atteinte. Mettez à niveau pour continuer à envoyer des messages."}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Plan comparison */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    {t ? "Plans" : "Plans disponibles"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                      <PlanCard
                        key={plan.name}
                        {...plan}
                        isCurrent={isPro ? plan.name === "Pro" || plan.name === "Pro" : plan.isCurrent}
                        onSelect={plan.isCurrent || (isPro && !plan.highlighted) ? undefined : () => setShowModal(true)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </main>
          )}
        </div>
      </div>

      <MobileBottomTabs activeTab="settings" language={language} />
    </>
  );
}
