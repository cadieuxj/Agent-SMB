import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agent SMB — Conseiller d'affaires IA",
  description: "Votre conseiller d'affaires IA avec mémoire persistante. Bilingue FR/EN.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`h-full ${inter.variable}`}>
      <body className="h-full font-sans">{children}</body>
    </html>
  );
}
