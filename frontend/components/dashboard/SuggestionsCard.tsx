import { Lightbulb, Inbox } from "lucide-react";
import type { Suggestion } from "@/lib/api";

interface SuggestionsCardProps {
  suggestions: Suggestion[];
  language?: "fr" | "en";
}

export default function SuggestionsCard({ suggestions, language = "fr" }: SuggestionsCardProps) {
  const t = language === "en";
  const visible = suggestions.slice(0, 2);

  return (
    <div className="bg-surface-raised border border-gray-800 rounded-xl p-5 space-y-4 card-glow transition-all">
      <div className="flex items-center gap-2">
        <Lightbulb size={16} className="text-brand-text" />
        <h3 className="text-sm font-semibold text-white">
          {t ? "Suggestions" : "Suggestions"}
        </h3>
      </div>

      {visible.length === 0 ? (
        <div className="flex items-center gap-2 py-2 text-gray-600">
          <Inbox size={16} />
          <p className="text-sm text-gray-500">
            {t ? "No suggestions yet — start a conversation!" : "Aucune suggestion — commencez une conversation !"}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((s) => (
            <li
              key={s.id}
              className="pl-3 border-l-2 border-l-brand/40 space-y-0.5"
            >
              <p className="text-sm text-gray-200 leading-relaxed">{s.content}</p>
              {s.source_type && (
                <p className="text-[10px] text-gray-600 uppercase tracking-wide">{s.source_type.replace(/_/g, " ")}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
