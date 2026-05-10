"use client";

import { useEffect, useState } from "react";
import { getMemories, deleteMemory, type Memory } from "@/lib/api";

export default function MemoryPanel({
  userId,
  refreshKey,
}: {
  userId: string;
  refreshKey: number;
}) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getMemories(userId)
      .then(setMemories)
      .catch(() => setMemories([]))
      .finally(() => setLoading(false));
  }, [userId, refreshKey]);

  async function handleDelete(memoryId: string) {
    setDeletingId(memoryId);
    try {
      await deleteMemory(userId, memoryId);
      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    } catch {
      // silently ignore
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <aside className="w-72 shrink-0 bg-gray-900 border-l border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-semibold text-white text-sm flex items-center gap-2">
          🧩 Mémoire
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Ce que je me souviens de votre entreprise
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-8 text-gray-600 text-xs">
            Chargement…
          </div>
        )}

        {!loading && memories.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-xs space-y-2">
            <p className="text-3xl">🫙</p>
            <p>Aucun souvenir encore.<br />Commencez à chatter pour construire votre profil.</p>
          </div>
        )}

        {!loading &&
          memories.map((m) => (
            <div
              key={m.id}
              className="group relative bg-gray-800 hover:bg-gray-750 rounded-xl p-3 text-xs text-gray-300 leading-relaxed border border-gray-700/50"
            >
              <p>{m.memory}</p>
              <button
                onClick={() => handleDelete(m.id)}
                disabled={deletingId === m.id}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-opacity disabled:opacity-50"
                title="Supprimer ce souvenir"
              >
                {deletingId === m.id ? (
                  <span className="text-[10px]">…</span>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          ))}
      </div>

      <div className="p-3 border-t border-gray-800">
        <p className="text-[10px] text-gray-600 text-center">
          {memories.length} souvenir{memories.length !== 1 ? "s" : ""} · Géré par Mem0
        </p>
      </div>
    </aside>
  );
}
