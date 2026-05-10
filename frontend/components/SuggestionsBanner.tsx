"use client";

import { useEffect, useState } from "react";
import { getSuggestions, type Suggestion } from "@/lib/api";

export default function SuggestionsBanner({ userId }: { userId: string }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSuggestions(userId)
      .then((s) => {
        setSuggestions(s);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [userId]);

  if (!loaded || dismissed || suggestions.length === 0) return null;

  return (
    <div className="bg-blue-950/60 border-b border-blue-800/50 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-lg shrink-0 mt-0.5">💡</span>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-semibold text-blue-300">
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
          className="shrink-0 text-blue-500 hover:text-blue-300 transition-colors mt-0.5"
          title="Fermer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
