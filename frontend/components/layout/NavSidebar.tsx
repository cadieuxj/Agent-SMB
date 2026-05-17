"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, LayoutDashboard, MessageSquare, Layers, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, labelFr: "Tableau de bord", labelEn: "Dashboard" },
  { href: "/chat",      icon: MessageSquare,   labelFr: "Chat",            labelEn: "Chat" },
  { href: "/memory",    icon: Layers,          labelFr: "Mémoire",         labelEn: "Memory" },
  { href: "/settings",  icon: Settings,        labelFr: "Paramètres",      labelEn: "Settings" },
];

interface NavSidebarProps {
  className?: string;
  profile: Profile | null;
  userEmail: string;
  language?: "fr" | "en";
}

export default function NavSidebar({ className, profile, userEmail, language = "fr" }: NavSidebarProps) {
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <aside className={cn("w-60 shrink-0 bg-surface-raised border-r border-gray-800 flex flex-col", className)}>
      <div className="p-4 border-b border-gray-800" style={{ background: "linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 2px 8px rgba(99,102,241,0.4)" }}>
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">Agent SMB</span>
        </div>
        {profile?.business_name && (
          <p className="text-xs text-brand-text font-medium truncate pl-0.5">{profile.business_name}</p>
        )}
        <p className="text-xs text-gray-500 truncate pl-0.5">{userEmail}</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, labelFr, labelEn }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-surface-overlay text-white font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              )}
            >
              <Icon size={15} />
              {language === "fr" ? labelFr : labelEn}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <LogOut size={14} />
          {language === "fr" ? "Déconnexion" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
