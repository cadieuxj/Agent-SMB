"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
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
      <div className="text-center space-y-3" role="status" aria-live="polite">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
            <Mail size={22} className="text-brand-text" />
          </div>
        </div>
        <p className="font-semibold text-white">Vérifiez votre courriel</p>
        <p className="text-sm text-gray-400">
          Nous avons envoyé un lien de connexion à{" "}
          <strong className="text-white">{email}</strong>.
          Cliquez sur le lien pour accéder à votre espace.
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
      <Input
        type="email"
        label="Adresse courriel"
        id="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="vous@votreentreprise.com"
        autoComplete="email"
        error={error || undefined}
        leadingIcon={<Mail size={15} />}
      />

      <Button
        type="submit"
        size="lg"
        loading={loading}
        disabled={!email}
        className="w-full"
      >
        Recevoir un lien de connexion
      </Button>

      <p className="text-center text-xs text-gray-500">
        Pas de mot de passe — connexion par lien magique uniquement.
      </p>
    </form>
  );
}
