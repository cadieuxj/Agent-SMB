"use client";

import { MessageSquare, Layers, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomTabsProps {
  activeTab?: "chat" | "memory" | "settings";
  onChatClick: () => void;
  onMemoryClick: () => void;
  onSettingsClick: () => void;
  language?: "fr" | "en";
}

const tabs = [
  {
    id: "chat" as const,
    icon: MessageSquare,
    labelFr: "Chat",
    labelEn: "Chat",
    onClick: (cbs: MobileBottomTabsProps) => cbs.onChatClick(),
  },
  {
    id: "memory" as const,
    icon: Layers,
    labelFr: "Mémoire",
    labelEn: "Memory",
    onClick: (cbs: MobileBottomTabsProps) => cbs.onMemoryClick(),
  },
  {
    id: "settings" as const,
    icon: Settings,
    labelFr: "Profil",
    labelEn: "Profile",
    onClick: (cbs: MobileBottomTabsProps) => cbs.onSettingsClick(),
  },
];

export default function MobileBottomTabs({
  activeTab = "chat",
  onChatClick,
  onMemoryClick,
  onSettingsClick,
  language = "fr",
}: MobileBottomTabsProps) {
  const callbacks = { activeTab, onChatClick, onMemoryClick, onSettingsClick, language };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-surface-raised border-t border-gray-800 flex lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigation principale"
    >
      {tabs.map(({ id, icon: Icon, labelFr, labelEn, onClick }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onClick(callbacks)}
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
