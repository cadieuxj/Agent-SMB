import Link from "next/link";
import { Brain, ShieldCheck, Lock, BadgeCheck, FileCheck } from "lucide-react";

export const metadata = {
  title: "Politique de confidentialité — Agent SMB",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Politique de confidentialité</h1>
            <p className="text-xs text-gray-500">Privacy Policy · En vigueur depuis le 16 mai 2026</p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: ShieldCheck, label: "Données au Canada" },
            { icon: Lock,        label: "Chiffrement TLS" },
            { icon: BadgeCheck,  label: "Conforme Loi 25" },
            { icon: FileCheck,   label: "Aucun partage" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-surface-raised border border-gray-800">
              <Icon size={15} className="text-success" />
              <span className="text-[10px] text-gray-500 text-center leading-tight font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-gray-300 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">1. Qui nous sommes</h2>
            <p>
              Agent SMB est un conseiller d&apos;affaires IA bilingue développé par <strong className="text-white">Cadieux AI Labs</strong> (Canada).
              Nous offrons un service d&apos;assistance aux petites et moyennes entreprises canadiennes pour la gestion fiscale, la trésorerie et la conformité.
            </p>
          </section>

          <section className="space-y-3 bg-success/5 border border-success/20 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <h2 className="text-base font-bold text-white">Engagement de confidentialité</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-white">Vos conversations ne sont jamais utilisées pour entraîner des modèles d&apos;IA.</strong>{" "}
              Ni par Agent SMB, ni par Anthropic (via notre accord contractuel). Vos données servent uniquement à vous répondre.
            </p>
            <p className="text-xs text-gray-500 italic">
              Your conversations are never used to train AI models — not by Agent SMB, not by Anthropic.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. Données collectées</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-white">Données d&apos;identification :</strong> adresse courriel, nom complet (optionnel)</li>
              <li><strong className="text-white">Profil d&apos;entreprise :</strong> nom, type, province, chiffre d&apos;affaires, inscription TPS/TVQ</li>
              <li><strong className="text-white">Conversations :</strong> messages échangés avec l&apos;assistant IA</li>
              <li><strong className="text-white">Mémoires IA :</strong> faits clés extraits automatiquement de vos conversations</li>
              <li><strong className="text-white">Données techniques :</strong> adresse IP, type de navigateur, cookies d&apos;authentification</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">3. Finalités du traitement</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Fournir le service de conseiller IA personnalisé</li>
              <li>Mémoriser le contexte de votre entreprise entre les sessions</li>
              <li>Générer des rappels fiscaux et des suggestions proactives</li>
              <li>Améliorer la qualité du service</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">4. Tiers recevant vos données</h2>
            <div className="bg-surface-raised border border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-white">Anthropic (États-Unis)</span>
                <span className="text-gray-400 text-xs">Vos messages sont traités par l&apos;API Claude d&apos;Anthropic pour générer les réponses de l&apos;assistant. Données transmises : contenu de vos messages et contexte d&apos;entreprise.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-white">Mem0 (États-Unis)</span>
                <span className="text-gray-400 text-xs">Votre mémoire IA est persistée via l&apos;API Mem0. Données transmises : résumés de conversations et faits clés de votre entreprise.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-white">Supabase (Canada — région ca-central-1)</span>
                <span className="text-gray-400 text-xs">Base de données principale. Données stockées : profil, conversations, messages, suggestions. Serveurs hébergés au Canada.</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              ⚠️ En utilisant Agent SMB, vous consentez au transfert de certaines données vers des fournisseurs américains (Anthropic, Mem0) dans le cadre de la prestation du service. Ces transferts sont encadrés par des accords de traitement de données.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">5. Vos droits (Loi 25 / LPRPDE)</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-white">Accès :</strong> vous pouvez consulter toutes vos données dans l&apos;application (profil, conversations, mémoire)</li>
              <li><strong className="text-white">Rectification :</strong> modifiez votre profil dans Paramètres à tout moment</li>
              <li><strong className="text-white">Effacement :</strong> supprimez vos souvenirs individuellement dans la page Mémoire. Pour une suppression complète du compte, contactez-nous.</li>
              <li><strong className="text-white">Portabilité :</strong> exportez vos données via Paramètres → Exporter mes données (bientôt disponible)</li>
              <li><strong className="text-white">Consentement :</strong> vous pouvez retirer votre consentement en supprimant votre compte</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">6. Conservation des données</h2>
            <p>Vos données sont conservées tant que votre compte est actif. En cas de suppression du compte, toutes les données sont effacées dans un délai de 30 jours.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">7. Cookies</h2>
            <p>Nous utilisons des cookies strictement nécessaires pour l&apos;authentification (Supabase) et un cookie de préférence de langue. Aucun cookie de suivi ou publicitaire n&apos;est utilisé.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">8. Contact</h2>
            <p>
              Pour toute question concernant la confidentialité de vos données :<br />
              <strong className="text-white">Cadieux AI Labs</strong><br />
              <a href="mailto:privacy@cadieuxai.com" className="text-brand-text hover:text-brand">privacy@cadieuxai.com</a>
            </p>
          </section>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
