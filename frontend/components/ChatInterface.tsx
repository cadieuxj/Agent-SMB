"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import MemoryPanel from "./MemoryPanel";
import SuggestionsBanner from "./SuggestionsBanner";
import ProfileSetup from "./ProfileSetup";

const AGENT_LABELS: Record<string, string> = {
  tax: "Fiscalité",
  cash_flow: "Trésorerie",
  general: "Conseiller",
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

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load profile + conversations on mount
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
    } catch (err: any) {
      setError("Erreur de connexion — veuillez réessayer.");
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
        Chargement…
      </div>
    );
  }

  return (
    <>
      {showProfileSetup && (
        <ProfileSetup userId={userId} userEmail={userEmail} onComplete={handleProfileComplete} initialProfile={profile} />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🧠</span>
              <span className="font-bold text-white text-sm">Agent SMB</span>
            </div>
            {profile?.business_name ? (
              <p className="text-xs text-blue-400 font-medium truncate">{profile.business_name}</p>
            ) : null}
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>

          <div className="p-3 space-y-1">
            <button
              onClick={startNewConversation}
              className="w-full text-left text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 font-medium transition-colors"
            >
              + Nouvelle conversation
            </button>

            {/* Language toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-700 text-xs mt-2">
              <button
                onClick={() => setLanguage("fr")}
                className={`flex-1 py-1.5 font-medium transition-colors ${
                  language === "fr" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`flex-1 py-1.5 font-medium transition-colors ${
                  language === "en" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-2 space-y-0.5">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-colors ${
                  activeConvId === conv.id
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                }`}
              >
                {conv.title ?? "Conversation"}
              </button>
            ))}
          </div>

          {/* Bottom actions */}
          <div className="p-3 border-t border-gray-800 space-y-1">
            <button
              onClick={() => setShowProfileSetup(true)}
              className="w-full text-left text-xs text-gray-400 hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              ⚙️ Mon profil
            </button>
            <button
              onClick={() => setShowMemory((v) => !v)}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                showMemory ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              🧩 {showMemory ? "Masquer la mémoire" : "Voir la mémoire"}
            </button>
            <button
              onClick={handleSignOut}
              className="w-full text-left text-xs text-gray-500 hover:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              ↩ Déconnexion
            </button>
          </div>
        </aside>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <SuggestionsBanner userId={userId} />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-gray-600">
                <span className="text-5xl">💬</span>
                <p className="text-sm max-w-xs">
                  {language === "fr"
                    ? `Bonjour${profile?.full_name ? ` ${profile.full_name.split(" ")[0]}` : ""} ! Parlez-moi de votre entreprise.`
                    : `Hello${profile?.full_name ? ` ${profile.full_name.split(" ")[0]}` : ""}! Tell me about your business.`}
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-800 text-gray-100 rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" && msg.agent_used && msg.agent_used !== "general" && (
                    <p className="text-xs text-gray-400 mb-1 font-medium">
                      {AGENT_LABELS[msg.agent_used] ?? msg.agent_used}
                    </p>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
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
              <button onClick={() => setError("")} className="text-red-500 hover:text-red-300 ml-3">✕</button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-800 p-4">
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
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent max-h-36 scrollbar-thin"
                style={{ minHeight: "44px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 144) + "px";
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl p-3 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">Maj+Entrée pour nouvelle ligne</p>
          </div>
        </div>

        {/* Memory panel */}
        {showMemory && <MemoryPanel userId={userId} refreshKey={memoryRefresh} />}
      </div>
    </>
  );
}
