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
    <html lang="fr" className={`h-full ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint — default is LIGHT for new users */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('agentsmb_theme');
              if (t === 'dark') {
                // user explicitly chose dark — keep it
              } else if (t === 'system') {
                if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                  document.documentElement.classList.add('theme-light');
                }
              } else {
                // no preference saved OR t === 'light' → default to light
                document.documentElement.classList.add('theme-light');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="h-full font-sans">{children}</body>
    </html>
  );
}
