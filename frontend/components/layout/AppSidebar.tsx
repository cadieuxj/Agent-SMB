"use client";

import { Brain, Plus, LogOut, Settings, Layers, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { type Profile, type Conversation } from "@/lib/api";

const LANG_LABELS = { fr: "FR", en: "EN" } as const;

interface AppSidebarProps {
  className?: string;
  userEmail: string;
  profile: Profile | null;
  conversations: Conversation[];
  activeConvId: string | undefined;
  onSelectConversation: (conv: Conversation) => void;
  onNewConversation: () => void;
  language: "fr" | "en";
  onLanguageChange: (lang: "fr" | "en") => void;
  showMemory: boolean;
  onToggleMemory: () => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
}

export default function AppSidebar({
  className,
  userEmail,
  profile,
  conversations,
  activeConvId,
  onSelectConversation,
  onNewConversation,
  language,
  onLanguageChange,
  showMemory,
  onToggleMemory,
  onOpenProfile,
  onSignOut,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "w-60 shrink-0 bg-surface-raised border-r border-gray-800 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-brand/20 flex items-center justify-center shrink-0">
            <Brain size={16} className="text-brand-text" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">Agent SMB</span>
        </div>
        {profile?.business_name && (
          <p className="text-xs text-brand-text font-medium truncate pl-0.5">
            {profile.business_name}
          </p>
        )}
        <p className="text-xs text-gray-500 truncate pl-0.5">{userEmail}</p>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center gap-2 text-xs bg-brand hover:bg-brand-dark text-white rounded-lg px-3 py-2 font-medium transition-colors"
        >
          <Plus size={14} />
          {language === "fr" ? "Nouvelle conversation" : "New conversation"}
        </button>

        {/* Language toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-700 text-xs">
          {(["fr", "en"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={cn(
                "flex-1 py-1.5 font-medium transition-colors",
                language === lang
                  ? "bg-surface-overlay text-white"
                  : "text-gray-400 hover:text-white"
              )}
              aria-pressed={language === lang}
            >
              {LANG_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 space-y-0.5">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-colors",
              activeConvId === conv.id
                ? "bg-surface-overlay text-white"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            )}
          >
            <MessageSquare size={11} className="inline mr-1.5 opacity-50" />
            {conv.title ?? (language === "fr" ? "Conversation" : "Conversation")}
          </button>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="p-3 border-t border-gray-800 space-y-0.5">
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Settings size={14} />
          {language === "fr" ? "Mon profil" : "My profile"}
        </button>
        <button
          onClick={onToggleMemory}
          className={cn(
            "w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors",
            showMemory
              ? "bg-surface-overlay text-white"
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
          )}
          aria-pressed={showMemory}
        >
          <Layers size={14} />
          {showMemory
            ? (language === "fr" ? "Masquer la mémoire" : "Hide memory")
            : (language === "fr" ? "Voir la mémoire" : "View memory")}
        </button>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <LogOut size={14} />
          {language === "fr" ? "Déconnexion" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
