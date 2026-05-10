import AuthForm from "@/components/AuthForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo + headline */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-2xl">
            🧠
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Agent SMB</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Votre conseiller d&apos;affaires IA qui se souvient de votre entreprise.
            <br />
            Bilingue · Canada · TPS/TVQ · RPC/RRQ
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
          <AuthForm />
        </div>

        <p className="text-center text-xs text-gray-600">
          Vos données restent privées. Aucun partage avec des tiers.
        </p>
      </div>
    </main>
  );
}
