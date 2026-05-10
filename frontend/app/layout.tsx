import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent SMB — Conseiller d'affaires IA",
  description: "Votre conseiller d'affaires IA avec mémoire persistante. Bilingue FR/EN.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
