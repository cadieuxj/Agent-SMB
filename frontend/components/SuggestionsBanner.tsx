"use client";

import { useEffect, useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { getSuggestions, type Suggestion } from "@/lib/api";

export default function SuggestionsBanner({ userId }: { userId: string }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSuggestions(userId)
      .then((s) => { setSuggestions(s); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [userId]);

  if (!loaded || dismissed || suggestions.length === 0) return null;

  return (
    <div className="bg-brand-subtle/60 border-b border-brand/20 px-4 py-3 shrink-0">
      <div className="flex items-start gap-3">
        <Lightbulb size={16} className="text-brand-text shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-semibold text-brand-text">
            Rappels de votre conseiller
          </p>
          {suggestions.map((s) => (
            <p key={s.id} className="text-xs text-blue-100 leading-relaxed">
              {s.content}
            </p>
          ))}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-brand/60 hover:text-brand-text transition-colors mt-0.5"
          aria-label="Fermer les suggestions"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
