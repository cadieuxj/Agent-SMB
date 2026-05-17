"use client";

import { useRouter } from "next/navigation";
import { LayoutDashboard, MessageSquare, Layers, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "dashboard" | "chat" | "memory" | "settings";

interface MobileBottomTabsProps {
  activeTab?: TabId;
  language?: "fr" | "en";
  // Optional overrides — used by ChatInterface for in-page state changes
  onChatClick?: () => void;
  onMemoryClick?: () => void;
  onSettingsClick?: () => void;
}

const TABS = [
  { id: "dashboard" as TabId, href: "/dashboard", icon: LayoutDashboard, labelFr: "Tableau",  labelEn: "Home" },
  { id: "chat"      as TabId, href: "/chat",      icon: MessageSquare,   labelFr: "Chat",     labelEn: "Chat" },
  { id: "memory"    as TabId, href: "/memory",    icon: Layers,          labelFr: "Mémoire",  labelEn: "Memory" },
  { id: "settings"  as TabId, href: "/settings",  icon: Settings,        labelFr: "Profil",   labelEn: "Profile" },
];

export default function MobileBottomTabs({
  activeTab = "chat",
  language = "fr",
  onChatClick,
  onMemoryClick,
  onSettingsClick,
}: MobileBottomTabsProps) {
  const router = useRouter();

  function getHandler(tab: (typeof TABS)[number]) {
    if (tab.id === "chat" && onChatClick) return onChatClick;
    if (tab.id === "memory" && onMemoryClick) return onMemoryClick;
    if (tab.id === "settings" && onSettingsClick) return onSettingsClick;
    return () => router.push(tab.href);
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-surface-raised border-t border-gray-800 flex lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigation principale"
    >
      {TABS.map((tab) => {
        const { id, icon: Icon, labelFr, labelEn } = tab;
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={getHandler(tab)}
            aria-pressed={active}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors min-h-[56px]",
              active ? "text-brand-text" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
            {language === "fr" ? labelFr : labelEn}
          </button>
        );
      })}
    </nav>
  );
}
