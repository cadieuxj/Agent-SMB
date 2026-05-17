"use client";

import { useState, useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consented, setConsented] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function startCooldown() {
    setResendCooldown(30);
    timerRef.current = setInterval(() => {
      setResendCooldown((n) => {
        if (n <= 1) { clearInterval(timerRef.current!); return 0; }
        return n - 1;
      });
    }, 1000);
  }

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
      startCooldown();
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    startCooldown();
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
        <div className="flex flex-col items-center gap-2 mt-4">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            className="text-xs text-brand-text hover:text-brand disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {resendCooldown > 0
              ? `Renvoyer le lien (${resendCooldown}s)`
              : "Renvoyer le lien"}
          </button>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
          >
            Utiliser une autre adresse
          </button>
        </div>
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

      {/* Consent — Law 25 / PIPEDA */}
      <label className="flex items-start gap-2.5 cursor-pointer group">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-brand shrink-0"
        />
        <span className="text-xs text-gray-400 leading-relaxed">
          J&apos;accepte la{" "}
          <a href="/privacy" target="_blank" className="underline text-brand-text hover:text-brand">
            politique de confidentialité
          </a>
          , y compris le traitement de mes données par Anthropic et Mem0.
        </span>
      </label>

      <Button
        type="submit"
        size="lg"
        loading={loading}
        disabled={!email || !consented}
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
