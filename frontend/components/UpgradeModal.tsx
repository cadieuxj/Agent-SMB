"use client";

import { X, Zap, Brain, MessageSquare, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const BENEFITS = {
  fr: [
    { icon: MessageSquare, text: "Messages illimités" },
    { icon: Zap,           text: "Agents Fiscalité + Trésorerie" },
    { icon: Brain,         text: "Mémoire complète (aucune limite)" },
    { icon: HeadphonesIcon,text: "Support prioritaire" },
  ],
  en: [
    { icon: MessageSquare, text: "Unlimited messages" },
    { icon: Zap,           text: "Tax + Cash Flow agents" },
    { icon: Brain,         text: "Full memory (no limit)" },
    { icon: HeadphonesIcon,text: "Priority support" },
  ],
};

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
  language?: "fr" | "en";
}

export default function UpgradeModal({ onClose, onUpgrade, language = "fr" }: UpgradeModalProps) {
  const t = language === "en";
  const benefits = BENEFITS[language];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="dark-landing bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-brand/10 text-brand-text text-xs font-semibold px-3 py-1 rounded-full border border-brand/20">
            <Zap size={11} />
            Pro
          </div>
          <h2 className="text-xl font-bold text-white">
            {t ? "Upgrade to Pro" : "Passer à Pro"}
          </h2>
          <p className="text-sm text-gray-400">
            {t
              ? "Continue growing your business with AI."
              : "Continuez à développer votre entreprise avec l'IA."}
          </p>
        </div>

        <ul className="space-y-3">
          {benefits.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-gray-200">
              <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-brand-text" />
              </div>
              {text}
            </li>
          ))}
        </ul>

        <div className="space-y-3 pt-1">
          <Button onClick={onUpgrade} size="lg" className="w-full">
            {t ? "Upgrade → $49/mo CAD" : "Mettre à niveau → 49 $/mois CAD"}
          </Button>
          <p className="text-center text-xs text-gray-600">
            {t ? "Cancel anytime · No commitment" : "Annulez en tout temps · Sans engagement"}
          </p>
        </div>
      </div>
    </div>
  );
}
