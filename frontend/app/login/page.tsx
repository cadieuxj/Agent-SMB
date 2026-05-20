import { Brain, ShieldCheck, Lock, BadgeCheck, FileCheck } from "lucide-react";
import AuthForm from "@/components/AuthForm";
import CookieNotice from "@/components/CookieNotice";
import Link from "next/link";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Données au Canada" },
  { icon: Lock,        label: "Chiffrement" },
  { icon: BadgeCheck,  label: "Conforme ARC/CRA" },
  { icon: FileCheck,   label: "Aucun partage" },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface-base">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand hover:bg-brand-dark transition-colors">
            <Brain className="text-white" size={26} />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">Agent SMB</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Votre conseiller d&apos;affaires IA qui se souvient de votre entreprise.
            <br />
            Bilingue · Canada · TPS/TVQ · RPC/RRQ
          </p>
        </div>

        <div className="bg-surface-raised border border-gray-800 rounded-2xl p-8 space-y-6">
          <AuthForm />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-surface-raised border border-gray-800"
            >
              <Icon size={16} className="text-success" />
              <span className="text-[10px] text-gray-500 text-center leading-tight font-medium">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-600">
          Vos données restent privées.{" "}
          <a href="/privacy" className="underline hover:text-gray-400 transition-colors">
            Politique de confidentialité
          </a>
        </p>

        <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
          <span>🇨🇦</span>
          <span className="text-gray-400 font-medium">Français</span>
          <span className="mx-1">·</span>
          <span className="text-gray-600 hover:text-gray-400 cursor-pointer transition-colors">English</span>
        </div>
      </div>
      <CookieNotice />
    </main>
  );
}
