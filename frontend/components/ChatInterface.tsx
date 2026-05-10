"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, Send, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/client";
import {
  sendMessage,
  getConversations,
  getConversationMessages,
  getProfile,
  type ChatResponse,
  type Conversation,
  type Message,
  type Profile,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileBottomTabs from "@/components/layout/MobileBottomTabs";
import MobileDrawer from "@/components/layout/MobileDrawer";
import MemoryPanel from "./MemoryPanel";
import SuggestionsBanner from "./SuggestionsBanner";
import ProfileSetup from "./ProfileSetup";

const AGENT_BADGE: Record<string, { label: string; variant: "tax" | "cashflow" | "brand" }> = {
  tax:       { label: "Fiscalité",  variant: "tax" },
  cash_flow: { label: "Trésorerie", variant: "cashflow" },
};

export default function ChatInterface({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | undefined>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showMemory, setShowMemory] = useState(false);
  const [memoryRefresh, setMemoryRefresh] = useState(0);
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getProfile(userId).then((p) => {
      setProfile(p);
      setProfileLoading(false);
      if (!p || !p.business_name) setShowProfileSetup(true);
      if (p?.language) setLanguage(p.language as "fr" | "en");
    });
    loadConversations();
  }, [userId]);

  async function loadConversations() {
    const convs = await getConversations(userId);
    setConversations(convs);
  }

  async function selectConversation(conv: Conversation) {
    setActiveConvId(conv.id);
    setError("");
    setDrawerOpen(false);
    const msgs = await getConversationMessages(userId, conv.id);
    setMessages(msgs);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setError("");

    const optimisticUser: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      agent_used: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setInput("");
    setLoading(true);

    try {
      const res: ChatResponse = await sendMessage(
        userId,
        userEmail,
        text,
        activeConvId,
        language
      );

      if (!activeConvId) {
        setActiveConvId(res.conversation_id);
        await loadConversations();
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.reply,
        agent_used: res.agent,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setMemoryRefresh((n) => n + 1);
      setTimeout(() => setMemoryRefresh((n) => n + 1), 12000);
    } catch {
      setError(
        language === "fr"
          ? "Connexion interrompue — votre message n'a pas été envoyé. Réessayez."
          : "Connection lost — your message was not sent. Please retry."
      );
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function startNewConversation() {
    setMessages([]);
    setActiveConvId(undefined);
    setError("");
    setDrawerOpen(false);
    inputRef.current?.focus();
  }

  function handleProfileComplete(p: Profile) {
    setProfile(p);
    setShowProfileSetup(false);
    if (p.language) setLanguage(p.language as "fr" | "en");
  }

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500 text-sm">
        {language === "fr" ? "Chargement…" : "Loading…"}
      </div>
    );
  }

  const sidebarProps = {
    userEmail,
    profile,
    conversations,
    activeConvId,
    onSelectConversation: selectConversation,
    onNewConversation: startNewConversation,
    language,
    onLanguageChange: setLanguage,
    showMemory,
    onToggleMemory: () => setShowMemory((v) => !v),
    onOpenProfile: () => setShowProfileSetup(true),
    onSignOut: handleSignOut,
  };

  return (
    <>
      {showProfileSetup && (
        <ProfileSetup
          userId={userId}
          userEmail={userEmail}
          onComplete={handleProfileComplete}
          initialProfile={profile}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <AppSidebar className="hidden lg:flex" {...sidebarProps} />

        {/* Mobile drawer */}
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <AppSidebar {...sidebarProps} />
        </MobileDrawer>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 pb-14 lg:pb-0">
          {/* Mobile header */}
          <div className="flex lg:hidden items-center h-12 px-4 border-b border-gray-800 shrink-0 bg-surface-raised">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
            <span className="ml-3 font-semibold text-sm text-white truncate">
              {profile?.business_name ?? "Agent SMB"}
            </span>
          </div>

          <SuggestionsBanner userId={userId} />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-gray-600">
                <MessageSquare size={40} strokeWidth={1.5} />
                <p className="text-sm max-w-xs text-gray-500">
                  {language === "fr"
                    ? `Bonjour${profile?.full_name ? ` ${profile.full_name.split(" ")[0]}` : ""} ! Parlez-moi de votre entreprise.`
                    : `Hello${profile?.full_name ? ` ${profile.full_name.split(" ")[0]}` : ""}! Tell me about your business.`}
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-brand text-white rounded-br-sm text-sm leading-relaxed whitespace-pre-wrap"
                      : "bg-surface-overlay text-gray-100 rounded-bl-sm"
                  )}
                >
                  {msg.role === "assistant" && msg.agent_used && AGENT_BADGE[msg.agent_used] && (
                    <div className="mb-1.5">
                      <Badge variant={AGENT_BADGE[msg.agent_used].variant} size="sm">
                        {AGENT_BADGE[msg.agent_used].label}
                      </Badge>
                    </div>
                  )}
                  {msg.role === "assistant" ? (
                    <div className="markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-overlay rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Error bar */}
          {error && (
            <div className="mx-4 mb-2 px-4 py-2 bg-red-950 border border-red-800 rounded-lg text-xs text-red-300 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-300 ml-3"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-800 p-4 shrink-0">
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  language === "fr"
                    ? "Écrivez votre message… (Entrée pour envoyer)"
                    : "Type your message… (Enter to send)"
                }
                rows={1}
                className="flex-1 bg-surface-overlay border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent max-h-36 scrollbar-thin"
                style={{ minHeight: "44px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 144) + "px";
                }}
                aria-label={language === "fr" ? "Message" : "Message"}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="shrink-0 bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl p-3 transition-colors"
                aria-label={language === "fr" ? "Envoyer" : "Send"}
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              {language === "fr" ? "Maj+Entrée pour nouvelle ligne" : "Shift+Enter for new line"}
            </p>
          </div>
        </div>

        {/* Memory panel (desktop) */}
        {showMemory && <MemoryPanel userId={userId} refreshKey={memoryRefresh} />}
      </div>

      {/* Mobile bottom tabs */}
      <MobileBottomTabs
        activeTab={showMemory ? "memory" : "chat"}
        onChatClick={startNewConversation}
        onMemoryClick={() => setShowMemory((v) => !v)}
        onSettingsClick={() => setShowProfileSetup(true)}
        language={language}
      />
    </>
  );
}
