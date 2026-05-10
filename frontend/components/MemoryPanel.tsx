"use client";

import { useEffect, useState } from "react";
import { Layers, X, Inbox } from "lucide-react";
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    getMemories(userId)
      .then(setMemories)
      .catch((err) => {
        setMemories([]);
        setFetchError(err?.message ?? "Impossible de charger les souvenirs.");
      })
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
    <aside className="w-72 shrink-0 bg-surface-raised border-l border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-semibold text-white text-sm flex items-center gap-2">
          <Layers size={15} className="text-gray-400" aria-hidden />
          Mémoire
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

        {!loading && fetchError && (
          <div className="text-center py-8 text-red-400 text-xs space-y-2 px-2">
            <p className="text-2xl">⚠️</p>
            <p className="font-medium">Erreur de chargement</p>
            <p className="text-red-500 break-all">{fetchError}</p>
          </div>
        )}

        {!loading && !fetchError && memories.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-xs space-y-3">
            <Inbox size={32} className="mx-auto text-gray-700" strokeWidth={1.5} />
            <p>
              Aucun souvenir encore.
              <br />
              Commencez à chatter pour construire votre profil.
            </p>
          </div>
        )}

        {!loading &&
          memories.map((m) => (
            <div
              key={m.id}
              className="group relative bg-surface-overlay hover:bg-gray-750 rounded-xl p-3 text-xs text-gray-300 leading-relaxed border border-gray-700/50"
            >
              <p>{m.memory}</p>
              <button
                onClick={() => handleDelete(m.id)}
                disabled={deletingId === m.id}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-opacity disabled:opacity-50"
                aria-label="Supprimer ce souvenir"
              >
                {deletingId === m.id ? (
                  <span className="text-[10px]">…</span>
                ) : (
                  <X size={13} />
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
