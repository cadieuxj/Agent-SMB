import Link from "next/link";
import { Brain, Inbox, ArrowRight } from "lucide-react";
import type { Memory } from "@/lib/api";

interface MemorySnapshotProps {
  memories: Memory[];
  language?: "fr" | "en";
}

export default function MemorySnapshot({ memories, language = "fr" }: MemorySnapshotProps) {
  const t = language === "en";
  const top = memories.slice(0, 3);

  return (
    <div className="bg-surface-raised border border-gray-800 rounded-xl p-5 space-y-4 card-glow transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-agent-advisor" />
          <h3 className="text-sm font-semibold text-white">
            {t ? "Memory" : "Mémoire"}
          </h3>
        </div>
        <Link
          href="/memory"
          className="text-xs text-gray-500 hover:text-brand-text transition-colors flex items-center gap-1"
        >
          {t ? "See all" : "Voir tout"}
          <ArrowRight size={12} />
        </Link>
      </div>

      {top.length === 0 ? (
        <div className="flex items-center gap-2 py-2">
          <Inbox size={16} className="text-gray-600" />
          <p className="text-sm text-gray-500">
            {t ? "No memories yet." : "Aucun souvenir pour l'instant."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {top.map((m) => (
            <li key={m.id} className="text-sm text-gray-300 leading-relaxed line-clamp-2 py-1 border-b border-gray-800 last:border-0">
              {m.memory}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
