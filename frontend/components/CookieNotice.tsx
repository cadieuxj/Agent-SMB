"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "agentsmb_cookie_notice_dismissed";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {}
  }, []);

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="max-w-2xl mx-auto bg-surface-raised border border-gray-700 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
        <p className="flex-1 text-xs text-gray-400 leading-relaxed">
          🍪 Ce site utilise des cookies d&apos;authentification nécessaires au fonctionnement du service.{" "}
          <a href="/privacy" className="underline text-brand-text hover:text-brand">
            Politique de confidentialité
          </a>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 text-xs font-semibold text-white bg-brand hover:bg-brand-dark px-3 py-1.5 rounded-lg transition-colors"
        >
          OK
        </button>
        <button onClick={dismiss} className="shrink-0 text-gray-500 hover:text-gray-300" aria-label="Fermer">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
