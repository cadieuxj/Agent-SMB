"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickChatProps {
  language?: "fr" | "en";
  businessName?: string | null;
  firstName?: string | null;
}

const CHIPS: Record<string, string[]> = {
  fr: [
    "Quelles sont mes prochaines obligations fiscales?",
    "Analyse ma trésorerie ce trimestre",
    "Quels crédits d'impôt puis-je réclamer?",
  ],
  en: [
    "What are my next tax obligations?",
    "Analyze my cash flow this quarter",
    "What tax credits can I claim?",
  ],
};

export default function QuickChat({ language = "fr", businessName, firstName }: QuickChatProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const t = language === "en";
  const chips = CHIPS[language] ?? CHIPS.fr;

  function send(msg: string) {
    const text = msg.trim();
    if (!text) return;
    router.push(`/chat?q=${encodeURIComponent(text)}`);
  }

  return (
    <div className="bg-surface-raised border border-gray-800 rounded-xl p-5 space-y-4 md:col-span-2 xl:col-span-3">
      <div className="flex items-center gap-2">
        <MessageSquare size={16} className="text-brand-text" />
        <h3 className="text-sm font-semibold text-white">
          {firstName
            ? (t ? `Hi ${firstName} — what can I help with?` : `Bonjour ${firstName} — comment puis-je vous aider ?`)
            : (t ? "What can I help with today?" : "Comment puis-je vous aider aujourd'hui ?")}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => send(chip)}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-brand/60 hover:text-white hover:bg-brand/5 transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(message)}
          placeholder={t ? "Ask anything about your business…" : "Posez votre question…"}
          className="flex-1 bg-surface-overlay border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-colors"
        />
        <button
          onClick={() => send(message)}
          disabled={!message.trim()}
          className={cn(
            "shrink-0 rounded-xl px-4 py-2.5 transition-colors",
            message.trim()
              ? "bg-brand hover:bg-brand-dark text-white"
              : "bg-surface-overlay text-gray-600 cursor-not-allowed"
          )}
          aria-label={t ? "Send" : "Envoyer"}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
