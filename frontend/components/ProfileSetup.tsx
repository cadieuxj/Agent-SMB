"use client";

import { useState } from "react";
import { updateProfile, type Profile } from "@/lib/api";

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant / Café" },
  { value: "retail", label: "Commerce de détail" },
  { value: "contractor", label: "Entrepreneur / Construction" },
  { value: "salon", label: "Salon / Spa / Beauté" },
  { value: "professional", label: "Services professionnels" },
  { value: "other", label: "Autre" },
];

const PROVINCES = [
  { value: "QC", label: "Québec" },
  { value: "ON", label: "Ontario" },
  { value: "BC", label: "Colombie-Britannique" },
  { value: "AB", label: "Alberta" },
  { value: "MB", label: "Manitoba" },
  { value: "SK", label: "Saskatchewan" },
  { value: "NS", label: "Nouvelle-Écosse" },
  { value: "NB", label: "Nouveau-Brunswick" },
  { value: "NL", label: "Terre-Neuve" },
  { value: "PE", label: "Île-du-Prince-Édouard" },
];

export default function ProfileSetup({
  userId,
  onComplete,
}: {
  userId: string;
  onComplete: (profile: Profile) => void;
}) {
  const [form, setForm] = useState({
    full_name: "",
    business_name: "",
    business_type: "",
    province: "QC",
    language: "fr",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.business_name || !form.business_type) {
      setError("Veuillez remplir le nom et le type d'entreprise.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const profile = await updateProfile(userId, form);
      onComplete(profile);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Configurez votre profil</h2>
          <p className="text-sm text-gray-400">
            Ces informations permettent à votre conseiller de mieux vous aider dès le départ.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">Votre nom</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              placeholder="Jean-Pierre Tremblay"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Nom de l&apos;entreprise <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.business_name}
              onChange={(e) => set("business_name", e.target.value)}
              placeholder="Restaurant Chez Marie"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Type d&apos;entreprise <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={form.business_type}
              onChange={(e) => set("business_type", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="">Sélectionnez…</option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Province</label>
              <select
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                {PROVINCES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Langue</label>
              <select
                value={form.language}
                onChange={(e) => set("language", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? "Sauvegarde…" : "Commencer →"}
          </button>
        </form>
      </div>
    </div>
  );
}
