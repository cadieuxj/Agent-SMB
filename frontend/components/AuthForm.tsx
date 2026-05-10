"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">📬</div>
        <p className="font-semibold text-white">Vérifiez votre courriel</p>
        <p className="text-sm text-gray-400">
          Nous avons envoyé un lien de connexion à <strong className="text-white">{email}</strong>.
          Cliquez sur le lien pour accéder à votre tableau de bord.
        </p>
        <button
          onClick={() => { setSent(false); setEmail(""); }}
          className="text-xs text-gray-500 hover:text-gray-300 mt-4 underline"
        >
          Utiliser une autre adresse
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Adresse courriel
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@votreentreprise.com"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
      >
        {loading ? "Envoi en cours…" : "Recevoir un lien de connexion"}
      </button>

      <p className="text-center text-xs text-gray-500">
        Pas de mot de passe — connexion par lien magique uniquement.
      </p>
    </form>
  );
}
