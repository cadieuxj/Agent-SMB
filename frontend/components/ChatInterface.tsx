"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, Send, MessageSquare, Copy, Check, Zap, X, LayoutDashboard, ChevronDown, ChevronUp, Download, SlidersHorizontal } from "lucide-react";
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
import UpgradeModal from "./UpgradeModal";

const FREE_LIMIT = 50;

const STARTER_PROMPTS: Record<string, { fr: string[]; en: string[] }> = {
  restaurant: {
    fr: ["Comment calculer la TVQ sur mes ventes de repas?", "Quelles dépenses de restaurant puis-je déduire?", "Comment déclarer les pourboires de mes employés?"],
    en: ["How do I calculate HST on meal sales?", "What restaurant expenses can I deduct?", "How do I report employee tips to CRA?"],
  },
  retail: {
    fr: ["Dois-je facturer la TPS/TVQ sur tous mes produits?", "Comment gérer mon inventaire pour les impôts?", "Quelles déductions s'appliquent à mon commerce?"],
    en: ["Do I charge GST/HST on all my products?", "How do I handle inventory for taxes?", "What deductions apply to my retail business?"],
  },
  contractor: {
    fr: ["Suis-je mieux incorporé (T2) ou travailleur autonome (T2125)?", "Quelles dépenses de chantier puis-je déduire?", "Comment gérer mes acomptes provisionnels?"],
    en: ["Am I better off incorporated (T2) or sole proprietor (T2125)?", "What job-site expenses can I deduct?", "How do I handle quarterly installment payments?"],
  },
  salon: {
    fr: ["Dois-je charger la TVQ sur mes services beauté?", "Comment déduire mes équipements de salon?", "Mes employés à commission: comment les déclarer?"],
    en: ["Do I charge GST/HST on beauty services?", "How do I deduct my salon equipment?", "How do I report commission-based employees?"],
  },
  professional: {
    fr: ["Dois-je m'incorporer pour optimiser mes impôts?", "Quelles dépenses de bureau à domicile puis-je déduire?", "Comment optimiser mon salaire vs dividendes?"],
    en: ["Should I incorporate to reduce my taxes?", "What home office expenses can I deduct?", "How do I optimize salary vs dividends?"],
  },
  other: {
    fr: ["Quelles sont mes obligations fiscales cette année?", "Analyse ma trésorerie ce trimestre", "Quels crédits d'impôt puis-je réclamer?"],
    en: ["What are my tax obligations this year?", "Analyze my cash flow this quarter", "What tax credits can I claim?"],
  },
};

function getStarterPrompts(businessType: string | null, language: string): string[] {
  const key = businessType ?? "other";
  const prompts = STARTER_PROMPTS[key] ?? STARTER_PROMPTS.other;
  return language === "en" ? prompts.en : prompts.fr;
}

const AGENT_BADGE: Record<string, { label: string; variant: "tax" | "cashflow" | "brand" }> = {
  tax:       { label: "Fiscalité",  variant: "tax" },
  cash_flow: { label: "Trésorerie", variant: "cashflow" },
};

export default function ChatInterface({
  userId,
  userEmail,
  initialMessage,
}: {
  userId: string;
  userEmail: string;
  initialMessage?: string;
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expertMode, setExpertMode] = useState(false);
  const [forcedAgent, setForcedAgent] = useState<"general" | "tax" | "cash_flow">("general");
  const [msgCount, setMsgCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dismissedPaywallToast, setDismissedPaywallToast] = useState(false);

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
    setMsgCount(parseInt(localStorage.getItem(`agentsmb_msgs_${userId}`) ?? "0", 10));
    setIsPro(localStorage.getItem(`agentsmb_pro_${userId}`) === "true");
  }, [userId]);

  // Auto-send initial message from onboarding activation
  const initialMessageSentRef = useRef(false);
  useEffect(() => {
    if (initialMessage && !profileLoading && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      setInput(initialMessage);
      setTimeout(() => {
        setInput("");
        const optimisticUser: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content: initialMessage,
          agent_used: null,
          created_at: new Date().toISOString(),
        };
        setMessages([optimisticUser]);
        setLoading(true);
        sendMessage(userId, userEmail, initialMessage, undefined, language)
          .then((res) => {
            setActiveConvId(res.conversation_id);
            loadConversations();
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "assistant",
                content: res.reply,
                agent_used: res.agent,
                created_at: new Date().toISOString(),
              },
            ]);
          })
          .catch(() => setMessages([]))
          .finally(() => setLoading(false));
      }, 300);
    }
  }, [initialMessage, profileLoading]);

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

  function handleUpgrade() {
    localStorage.setItem(`agentsmb_pro_${userId}`, "true");
    setIsPro(true);
    setShowUpgradeModal(false);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    if (!isPro && msgCount >= FREE_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }
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
        language,
        expertMode ? forcedAgent : undefined
      );

      if (!activeConvId) {
        setActiveConvId(res.conversation_id);
        await loadConversations();
      }

      const newCount = msgCount + 1;
      setMsgCount(newCount);
      localStorage.setItem(`agentsmb_msgs_${userId}`, String(newCount));

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

  function handleExport(format: "md" | "pdf" = "md") {
    if (!messages.length) return;
    const dateStr = new Date().toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA");
    const bizName = profile?.business_name ?? userEmail;

    if (format === "pdf") {
      const rows = messages.map((m) => {
        const isUser = m.role === "user";
        const roleLabel = isUser
          ? (language === "fr" ? "Vous" : "You")
          : `Agent SMB${m.agent_used ? ` · ${m.agent_used}` : ""}`;
        const bg = isUser ? "#eef2ff" : "#f8fafc";
        const border = isUser ? "#6366f1" : "#e2e8f0";
        return `<div style="margin:12px 0;padding:12px 16px;background:${bg};border-left:3px solid ${border};border-radius:4px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#64748b;">${roleLabel}</p>
          <p style="margin:0;font-size:13px;color:#0f172a;white-space:pre-wrap;">${m.content.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>
        </div>`;
      }).join("");
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Agent SMB</title>
        <style>body{font-family:-apple-system,sans-serif;max-width:720px;margin:40px auto;padding:0 24px;}
        @media print{body{margin:0;}}</style></head>
        <body>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #e2e8f0;">
            <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;">
              <span style="color:white;font-weight:800;font-size:14px;">A</span></div>
            <div><h1 style="margin:0;font-size:18px;color:#0f172a;">Agent SMB</h1>
            <p style="margin:0;font-size:12px;color:#64748b;">${bizName} · ${dateStr}</p></div>
          </div>
          ${rows}
          <p style="margin-top:32px;font-size:10px;color:#94a3b8;text-align:center;">
            Généré par Agent SMB · Vos données ne sont pas utilisées pour entraîner l'IA.
          </p>
        </body></html>`;
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 500);
      }
      return;
    }

    const lines = messages.map((m) => {
      const role = m.role === "user"
        ? (language === "fr" ? "Vous" : "You")
        : `Agent SMB${m.agent_used ? ` (${m.agent_used})` : ""}`;
      return `**${role}**\n${m.content}\n`;
    });
    const md = [
      `# Agent SMB — Conversation`,
      `> ${bizName} · ${dateStr}`,
      `> *Vos données ne sont pas utilisées pour entraîner l'IA.*`,
      "",
      ...lines,
    ].join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-smb-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopy(content: string, id: string) {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
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
          onClose={profile?.business_name ? () => setShowProfileSetup(false) : undefined}
          initialProfile={profile}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal
          language={language}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
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
          {/* Desktop header — expert mode + export */}
          <div className="hidden lg:flex items-center justify-between h-10 px-4 border-b border-gray-800 shrink-0 bg-surface-raised">
            {/* Expert mode toggle */}
            <button
              onClick={() => setExpertMode(v => !v)}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors",
                expertMode ? "text-brand-text bg-brand/10" : "text-gray-500 hover:text-gray-300 hover:bg-surface-overlay"
              )}
            >
              <SlidersHorizontal size={13} />
              {language === "fr" ? "Mode expert" : "Expert mode"}
            </button>

            {/* Export buttons */}
            {messages.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleExport("md")}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-surface-overlay"
                >
                  <Download size={13} /> .md
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-surface-overlay"
                >
                  <Download size={13} /> PDF
                </button>
              </div>
            )}
          </div>

          {/* Mobile header */}
          <div className="flex lg:hidden items-center h-12 px-4 border-b border-gray-800 shrink-0 bg-surface-raised">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
            <span className="ml-3 font-semibold text-sm text-white truncate flex-1">
              {profile?.business_name ?? "Agent SMB"}
            </span>
            <a
              href="/dashboard"
              className="text-xs text-gray-500 hover:text-brand-text transition-colors flex items-center gap-1 shrink-0"
            >
              <LayoutDashboard size={13} />
              {language === "fr" ? "Tableau" : "Home"}
            </a>
          </div>

          <SuggestionsBanner userId={userId} />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-6 px-2">
                <div className="text-center space-y-2">
                  <MessageSquare size={36} strokeWidth={1.5} className="mx-auto text-gray-700" />
                  <p className="text-sm text-gray-500 max-w-xs">
                    {language === "fr"
                      ? `Bonjour${profile?.full_name ? ` ${profile.full_name.split(" ")[0]}` : ""} ! Comment puis-je vous aider?`
                      : `Hello${profile?.full_name ? ` ${profile.full_name.split(" ")[0]}` : ""}! How can I help you?`}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-2xl">
                  {getStarterPrompts(profile?.business_type ?? null, language).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="text-left text-sm text-gray-400 bg-surface-raised border border-gray-700 rounded-xl px-4 py-3 hover:border-brand/50 hover:text-white hover:bg-brand/5 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "relative max-w-[75%] rounded-2xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-brand text-white rounded-br-sm text-sm leading-relaxed whitespace-pre-wrap"
                      : "group bg-surface-overlay text-gray-100 rounded-bl-sm"
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
                    <>
                      {/* Full content always — manual collapse only for very long responses (>2500 chars) */}
                      {expandedIds.has(msg.id) ? (
                        <div className="space-y-1">
                          <div className="markdown">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content.split('\n').slice(0, 6).join('\n') + '\n…'}
                            </ReactMarkdown>
                          </div>
                          <button
                            onClick={() => setExpandedIds(prev => { const s = new Set(prev); s.delete(msg.id); return s; })}
                            className="flex items-center gap-1.5 text-xs text-brand-text hover:text-brand transition-colors"
                          >
                            <ChevronDown size={13} />
                            {language === "fr" ? "Voir tout" : "Show all"}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="markdown">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                          {msg.content.length > 2500 && (
                            <button
                              onClick={() => setExpandedIds(prev => new Set([...prev, msg.id]))}
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                            >
                              <ChevronUp size={13} />
                              {language === "fr" ? "Réduire" : "Collapse"}
                            </button>
                          )}
                        </div>
                      )}
                      {/* Source footer for tax/cashflow agents */}
                      {msg.agent_used && (msg.agent_used === "tax" || msg.agent_used === "cash_flow") && (
                        <div className="mt-2 pt-2 border-t border-gray-700/50 flex items-center gap-2 flex-wrap">
                          <a
                            href={language === "fr"
                              ? "https://www.canada.ca/fr/agence-revenu.html"
                              : "https://www.canada.ca/en/revenue-agency.html"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-brand-text hover:text-brand transition-colors"
                          >
                            <span>🍁</span> ARC / CRA
                          </a>
                          {profile?.province === "QC" && (
                            <>
                              <span className="text-gray-700 text-[10px]">·</span>
                              <a
                                href="https://www.revenuquebec.ca"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-agent-tax hover:text-violet-300 transition-colors"
                              >
                                <span>🏛️</span> Revenu Québec
                              </a>
                            </>
                          )}
                          <span className="text-gray-700 text-[10px]">·</span>
                          <span className="text-[10px] text-gray-600">
                            {language === "fr" ? "Informationnel — vérifiez avec un CPA." : "Informational — verify with a CPA."}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-300 transition-all p-1 rounded"
                        aria-label={language === "fr" ? "Copier" : "Copy"}
                      >
                        {copiedId === msg.id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                      </button>
                    </>
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
              <button onClick={() => setError("")} className="text-red-500 hover:text-red-300 ml-3" aria-label="Fermer">
                <X size={13} />
              </button>
            </div>
          )}

          {/* Paywall amber toast (15–19 messages) */}
          {!isPro && msgCount >= 40 && msgCount < FREE_LIMIT && !dismissedPaywallToast && (
            <div className="mx-4 mb-2 px-4 py-2 bg-warning/10 border border-warning/30 rounded-lg text-xs text-warning flex items-center justify-between">
              <span>
                {language === "fr"
                  ? `Vous approchez de votre limite (${msgCount}/${FREE_LIMIT} messages). `
                  : `You're approaching your limit (${msgCount}/${FREE_LIMIT} messages). `}
                <button onClick={() => setShowUpgradeModal(true)} className="underline font-medium">
                  {language === "fr" ? "Passer à Pro →" : "Upgrade to Pro →"}
                </button>
              </span>
              <button onClick={() => setDismissedPaywallToast(true)} className="ml-3 text-warning/60 hover:text-warning">
                <X size={13} />
              </button>
            </div>
          )}

          {/* Expert mode agent selector */}
          {expertMode && !(!isPro && msgCount >= FREE_LIMIT) && (
            <div className="mx-4 mb-1 flex items-center gap-2">
              <span className="text-xs text-gray-500 shrink-0">
                {language === "fr" ? "Agent :" : "Agent:"}
              </span>
              {([
                { id: "general" as const,   labelFr: "Conseiller",  labelEn: "Advisor",   color: "text-agent-advisor" },
                { id: "tax" as const,        labelFr: "Fiscalité",   labelEn: "Tax",       color: "text-agent-tax" },
                { id: "cash_flow" as const,  labelFr: "Trésorerie",  labelEn: "Cash Flow", color: "text-agent-cashflow" },
              ]).map(({ id, labelFr, labelEn, color }) => (
                <button
                  key={id}
                  onClick={() => setForcedAgent(id)}
                  className={cn(
                    "text-xs px-3 py-1 rounded-full border transition-colors",
                    forcedAgent === id
                      ? `border-current bg-current/10 ${color} font-medium`
                      : "border-gray-700 text-gray-500 hover:text-gray-300"
                  )}
                >
                  {language === "fr" ? labelFr : labelEn}
                </button>
              ))}
            </div>
          )}

          {/* Input — blocked at limit */}
          {!isPro && msgCount >= FREE_LIMIT ? (
            <div className="border-t border-gray-800 p-5 shrink-0 text-center space-y-3">
              <p className="text-sm text-gray-400">
                {language === "fr"
                  ? `Vous avez atteint votre limite de ${FREE_LIMIT} messages gratuits.`
                  : `You've reached your limit of ${FREE_LIMIT} free messages.`}
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <Zap size={14} />
                {language === "fr" ? "Passer à Pro — 29 $/mois" : "Upgrade to Pro — $29/mo"}
              </button>
              <p className="text-xs text-gray-600">
                {language === "fr" ? "Annulez en tout temps" : "Cancel anytime"}
              </p>
            </div>
          ) : (
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
              {" · "}
              <span className="text-gray-700">
                {language === "fr"
                  ? "Vos données ne sont pas utilisées pour entraîner l'IA."
                  : "Your data is never used to train AI."}
              </span>
            </p>
          </div>
          )}
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
