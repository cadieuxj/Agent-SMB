"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, Send, MessageSquare, Copy, Check, Zap, X, LayoutDashboard, ChevronDown, ChevronUp, Download, SlidersHorizontal, Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/client";
import {
  sendMessage,
  getConversations,
  getConversationMessages,
  getProfile,
  updateProfile,
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
  const [showAdvisorTooltip, setShowAdvisorTooltip] = useState(false);
  const [showMoreExports, setShowMoreExports] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dismissedPaywallToast, setDismissedPaywallToast] = useState(false);
  const [accountantEmail, setAccountantEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Apply browser language as fallback before profile arrives (client-side only)
    const browserLang = navigator.language?.startsWith("fr") ? "fr" : "en";
    setLanguage(browserLang);

    getProfile(userId).then((p) => {
      setProfile(p);
      setProfileLoading(false);
      if (!p || !p.business_name) setShowProfileSetup(true);
      // Profile language always overrides browser default
      if (p?.language) setLanguage(p.language as "fr" | "en");
      if (p?.accountant_email) setAccountantEmail(p.accountant_email);
    });
    loadConversations();
    setMsgCount(parseInt(localStorage.getItem(`agentsmb_msgs_${userId}`) ?? "0", 10));
    setIsPro(localStorage.getItem(`agentsmb_pro_${userId}`) === "true");
    // Show advisor tooltip once on first chat visit
    if (!localStorage.getItem("agentsmb_advisor_tip_seen")) {
      setShowAdvisorTooltip(true);
    }
    // accountant_email is loaded from profile below
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

  /** Convert markdown to clean HTML for PDF rendering. */
  function mdToHtml(md: string): string {
    let html = md
      // Escape HTML entities first
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Headings
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      // Bold + italic
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Horizontal rule
      .replace(/^---$/gm, "<hr>")
      // Unordered lists
      .replace(/^[\-\*] (.+)$/gm, "<li>$1</li>")
      // Ordered lists
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

    // Wrap consecutive <li> in <ul>
    html = html.replace(/((<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

    // Tables: | col | col | → <table>
    html = html.replace(/^\|(.+)\|$/gm, (line) => {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      return "<tr>" + cells.map((c) => `<td>${c}</td>`).join("") + "</tr>";
    });
    // Remove separator rows (| --- | --- |)
    html = html.replace(/<tr>(<td>[-: ]+<\/td>)+<\/tr>/g, "");
    // Wrap first <tr> of each table block as <thead>
    html = html.replace(/((<tr>.*<\/tr>\n?)+)/g, (block) => {
      const rows = block.trim().split("\n");
      if (rows.length > 1) {
        return `<table><thead>${rows[0]}</thead><tbody>${rows.slice(1).join("")}</tbody></table>`;
      }
      return `<table><tbody>${block}</tbody></table>`;
    });

    // Double newlines → paragraph breaks
    html = html
      .split(/\n{2,}/)
      .map((chunk) => {
        chunk = chunk.trim();
        if (!chunk) return "";
        if (/^<(h[1-3]|ul|ol|table|hr|li)/.test(chunk)) return chunk;
        return `<p>${chunk.replace(/\n/g, "<br>")}</p>`;
      })
      .join("\n");

    return html;
  }

  function handleAccountantPdf() {
    if (!messages.length) return;
    const dateStr = new Date().toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA");
    const bizName = profile?.business_name ?? userEmail;
    const province = profile?.province ?? "QC";

    // Build clean Q&A pairs (pair consecutive user+assistant turns)
    const pairs: { question: string; answer: string; agent: string | null }[] = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === "user") {
        const next = messages[i + 1];
        if (next?.role === "assistant") {
          pairs.push({ question: messages[i].content, answer: next.content, agent: next.agent_used });
          i++;
        }
      }
    }

    const qaPairs = pairs.map((p, idx) => {
      const agentLabel = p.agent === "tax"
        ? (language === "fr" ? "Agent Fiscalité" : "Tax Agent")
        : p.agent === "cash_flow"
        ? (language === "fr" ? "Agent Trésorerie" : "Cash Flow Agent")
        : (language === "fr" ? "Conseiller général" : "General Advisor");
      return `
        <div style="margin:20px 0;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.05em;">
            Q${idx + 1} · ${language === "fr" ? "Question" : "Question"}
          </p>
          <p style="margin:0 0 14px;font-size:13px;color:#0f172a;font-weight:500;">${mdToHtml(p.question)}</p>
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#10b981;text-transform:uppercase;letter-spacing:0.05em;">
            ${language === "fr" ? "Réponse" : "Answer"} · ${agentLabel}
          </p>
          <div style="font-size:13px;color:#334155;line-height:1.7;">${mdToHtml(p.answer)}</div>
        </div>`;
    }).join("");

    const html = `<!DOCTYPE html><html lang="${language}"><head><meta charset="UTF-8">
      <title>${language === "fr" ? "Résumé comptable" : "Accountant Summary"} — Agent SMB</title>
      <style>
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:740px;margin:40px auto;padding:0 24px;color:#0f172a;}
        @media print{body{margin:0;}}
        h1{font-size:18px;font-weight:700;color:#0f172a;margin:16px 0 6px;}
        h2{font-size:15px;font-weight:700;color:#1e293b;margin:14px 0 4px;}
        h3{font-size:13px;font-weight:700;color:#334155;margin:12px 0 4px;}
        p{margin:0 0 8px;line-height:1.6;}
        strong{font-weight:700;color:#0f172a;}
        em{font-style:italic;}
        code{font-family:monospace;font-size:12px;background:#eef2ff;color:#4338ca;padding:1px 5px;border-radius:4px;}
        ul,ol{margin:6px 0 8px;padding-left:20px;}
        li{margin:2px 0;line-height:1.5;}
        table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12px;}
        td,th{border:1px solid #e2e8f0;padding:6px 10px;text-align:left;}
        thead td,th{background:#f1f5f9;font-weight:600;color:#0f172a;}
        hr{border:none;border-top:1px solid #e2e8f0;margin:12px 0;}
      </style></head>
      <body>
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:14px;padding-bottom:20px;border-bottom:3px solid #6366f1;margin-bottom:24px;">
          <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="color:white;font-weight:800;font-size:16px;">A</span></div>
          <div>
            <h1 style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">Agent SMB</h1>
            <p style="margin:2px 0 0;font-size:12px;color:#64748b;">
              ${language === "fr" ? "Résumé comptable" : "Accountant Summary"} · ${bizName} · ${province} · ${dateStr}
            </p>
          </div>
        </div>
        <!-- Q&A -->
        ${qaPairs || `<p style="color:#64748b;">${language === "fr" ? "Aucune question-réponse dans cette conversation." : "No Q&A pairs in this conversation."}</p>`}
        <!-- Footer -->
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;">
          <p style="margin:0;">
            ${language === "fr"
              ? "Généré par Agent SMB (CadieuxAI Inc.) · Données hébergées au Canada · Vos données ne sont pas utilisées pour entraîner l'IA."
              : "Generated by Agent SMB (CadieuxAI Inc.) · Data hosted in Canada · Your data is never used to train AI."}
          </p>
          <p style="margin:4px 0 0;">
            ${language === "fr"
              ? "Ce document est à titre informatif. Consultez un comptable ou un fiscaliste pour votre situation spécifique."
              : "This document is for informational purposes. Consult a CPA or tax professional for your specific situation."}
          </p>
        </div>
      </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  }

  function handleCopyToClipboard() {
    if (!messages.length) return;
    const bizName = profile?.business_name ?? userEmail;
    const dateStr = new Date().toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA");
    const text = [
      `Agent SMB — ${bizName} — ${dateStr}`,
      "",
      ...messages.map((m) => {
        const role = m.role === "user"
          ? (language === "fr" ? "Vous" : "You")
          : `Agent SMB${m.agent_used ? ` (${m.agent_used})` : ""}`;
        return `${role}:\n${m.content}`;
      }),
    ].join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
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
          <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#64748b;">${roleLabel}</p>
          <div style="font-size:13px;color:#0f172a;line-height:1.7;">${mdToHtml(m.content)}</div>
        </div>`;
      }).join("");
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Agent SMB</title>
        <style>
          body{font-family:-apple-system,sans-serif;max-width:720px;margin:40px auto;padding:0 24px;}
          @media print{body{margin:0;}}
          h1{font-size:17px;font-weight:700;margin:14px 0 4px;color:#0f172a;}
          h2{font-size:14px;font-weight:700;margin:12px 0 4px;color:#1e293b;}
          h3{font-size:13px;font-weight:600;margin:10px 0 4px;color:#334155;}
          p{margin:0 0 8px;} strong{font-weight:700;} em{font-style:italic;}
          code{font-family:monospace;font-size:11px;background:#eef2ff;color:#4338ca;padding:1px 4px;border-radius:3px;}
          ul,ol{margin:4px 0 8px;padding-left:18px;} li{margin:2px 0;}
          table{width:100%;border-collapse:collapse;margin:8px 0;font-size:12px;}
          td{border:1px solid #e2e8f0;padding:5px 8px;} hr{border:none;border-top:1px solid #e2e8f0;margin:10px 0;}
        </style></head>
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

      {/* Accountant email modal — all colours via inline style to bypass light-mode CSS cascade */}
      {showEmailModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEmailModal(false); }}
        >
          <div
            className="rounded-2xl w-full max-w-sm p-6 space-y-4 relative border"
            style={{ background: "#111827", borderColor: "#374151" }}
          >
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: "#6b7280" }}
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.15)" }}>
                <Mail size={18} style={{ color: "#818cf8" }} />
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ color: "#ffffff" }}>
                  {language === "fr" ? "Adresse de votre comptable" : "Your accountant's email"}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                  {language === "fr" ? "Sauvegardée pour les prochains envois" : "Saved for future sessions"}
                </p>
              </div>
            </div>
            <input
              type="email"
              autoFocus
              value={accountantEmail}
              onChange={(e) => setAccountantEmail(e.target.value)}
              placeholder={language === "fr" ? "comptable@cabinet.com" : "accountant@firm.com"}
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              style={{
                background: "#1e2433",
                color: "#f1f5f9",
                border: "1px solid #374151",
              }}
            />
            <button
              onClick={async () => {
                if (!accountantEmail) return;
                await updateProfile(userId, { accountant_email: accountantEmail }).catch(() => {});
                setShowEmailModal(false);
                const bizName = profile?.business_name ?? userEmail;
                const date = new Date().toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA");
                const subject = encodeURIComponent(language === "fr" ? `Résumé fiscal — ${bizName} — ${date}` : `Tax summary — ${bizName} — ${date}`);
                const body = encodeURIComponent(messages.map((m) => `${m.role === "user" ? (language === "fr" ? "Vous" : "You") : "Agent SMB"}: ${m.content}`).join("\n\n"));
                window.open(`mailto:${accountantEmail}?subject=${subject}&body=${body}`, "_blank");
              }}
              disabled={!accountantEmail}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#ffffff" }}
            >
              {language === "fr" ? "Sauvegarder et envoyer" : "Save & send"}
            </button>
          </div>
        </div>
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
          {/* Desktop header — expert mode + counter + export */}
          <div className="hidden lg:flex items-center justify-between h-10 px-4 border-b border-gray-800 shrink-0 bg-surface-raised">
            {/* Left: advisor selector (renamed from "Expert mode") */}
            <div className="relative">
              <button
                onClick={() => {
                  setExpertMode(v => !v);
                  if (showAdvisorTooltip) {
                    setShowAdvisorTooltip(false);
                    localStorage.setItem("agentsmb_advisor_tip_seen", "1");
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors",
                  expertMode ? "text-brand-text bg-brand/10" : "text-gray-500 hover:text-gray-300 hover:bg-surface-overlay"
                )}
              >
                <SlidersHorizontal size={13} />
                {language === "fr" ? "Choisir un conseiller" : "Choose advisor"}
              </button>
              {/* First-visit coach mark tooltip */}
              {showAdvisorTooltip && (
                <div className="absolute top-8 left-0 z-50 w-64 bg-surface-raised border border-brand/30 rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {language === "fr"
                      ? "L'IA choisit automatiquement le bon conseiller pour vous. Cliquez ici pour choisir vous-même."
                      : "AI picks the right advisor automatically. Click here to choose manually."}
                  </p>
                  <button
                    onClick={() => {
                      setShowAdvisorTooltip(false);
                      localStorage.setItem("agentsmb_advisor_tip_seen", "1");
                    }}
                    className="mt-2 text-[10px] text-brand-text hover:text-brand transition-colors"
                  >
                    {language === "fr" ? "Compris" : "Got it"}
                  </button>
                </div>
              )}
            </div>

            {/* Right: message counter + export + email */}
            <div className="flex items-center gap-2">
              {/* Persistent message counter */}
              {!isPro && (
                <span
                  title={language === "fr"
                    ? "Se réinitialise le 1er du mois. Passez à Pro pour illimité."
                    : "Resets the 1st of each month. Upgrade for unlimited."}
                  className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full border cursor-default",
                    msgCount / FREE_LIMIT >= 0.95
                      ? "text-danger border-danger/30 bg-danger/5"
                      : msgCount / FREE_LIMIT >= 0.8
                      ? "text-warning border-warning/30 bg-warning/5"
                      : "text-gray-500 border-gray-700 bg-surface-overlay"
                  )}
                >
                  {msgCount} / {FREE_LIMIT} {language === "fr" ? "msg" : "msg"}
                </span>
              )}

              {messages.length > 0 && (
                <div className="flex items-center gap-1.5 relative">
                  {/* Primary CTA — single accountant send button */}
                  <button
                    onClick={() => {
                      if (!accountantEmail) { setShowEmailModal(true); return; }
                      handleAccountantPdf();
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-warning border border-warning/30 bg-warning/5 hover:bg-warning/10 transition-colors px-3 py-1.5 rounded-lg"
                  >
                    <Mail size={13} />
                    {language === "en" ? "Send to Accountant" : "Envoyer au comptable"}
                  </button>

                  {/* Clipboard copy — always visible fallback */}
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-surface-overlay"
                    title={language === "en" ? "Copy conversation" : "Copier la conversation"}
                  >
                    <Copy size={13} />
                  </button>

                  {/* More options dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMoreExports((v) => !v)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-surface-overlay"
                      title={language === "en" ? "More export options" : "Plus d'options"}
                    >
                      <ChevronDown size={13} />
                    </button>
                    {showMoreExports && (
                      <div
                        className="absolute right-0 top-8 z-50 bg-surface-raised border border-gray-700 rounded-xl shadow-lg py-1 min-w-[140px]"
                        onMouseLeave={() => setShowMoreExports(false)}
                      >
                        <button onClick={() => { handleExport("md"); setShowMoreExports(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-surface-overlay transition-colors">
                          <Download size={12} /> Markdown (.md)
                        </button>
                        <button onClick={() => { handleExport("pdf"); setShowMoreExports(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-surface-overlay transition-colors">
                          <Download size={12} /> {language === "en" ? "Full PDF" : "PDF complet"}
                        </button>
                        <button onClick={() => { handleAccountantPdf(); setShowMoreExports(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-surface-overlay transition-colors">
                          <Download size={12} /> {language === "en" ? "Accountant PDF" : "PDF comptable"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile header */}
          <div className="flex lg:hidden items-center h-12 px-4 border-b border-gray-800 shrink-0 bg-surface-raised gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors shrink-0"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
            <span className="ml-1 font-semibold text-sm text-white truncate flex-1">
              {profile?.business_name ?? "Agent SMB"}
            </span>
            {!isPro && (
              <span className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-full border shrink-0",
                msgCount / FREE_LIMIT >= 0.95
                  ? "text-danger border-danger/30"
                  : msgCount / FREE_LIMIT >= 0.8
                  ? "text-warning border-warning/30"
                  : "text-gray-500 border-gray-700"
              )}>
                {msgCount}/{FREE_LIMIT}
              </span>
            )}
            <a
              href="/dashboard"
              className="text-xs text-gray-500 hover:text-brand-text transition-colors flex items-center gap-1 shrink-0"
            >
              <LayoutDashboard size={13} />
              {language === "fr" ? "Accueil" : "Home"}
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
                className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}
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
              {/* Handled-by badge — below bubble, inside flex-col outer wrapper */}
              {msg.role === "assistant" && (() => {
                const agentKey = msg.agent_used ?? "general";
                const cfg: Record<string, { label: string; labelEn: string; bg: string }> = {
                  tax:       { label: "Agent Fiscal",       labelEn: "Tax Agent",       bg: "#7c3aed" },
                  cash_flow: { label: "Agent Trésorerie",   labelEn: "Cash Flow Agent", bg: "#0284c7" },
                  general:   { label: "Conseiller général", labelEn: "General Advisor", bg: "#475569" },
                };
                const c = cfg[agentKey] ?? cfg.general;
                return (
                  <div className="flex items-center gap-1.5 ml-1 mt-0.5">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: c.bg, color: "#fff" }}
                    >
                      {language === "en" ? c.labelEn : c.label}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {language === "en" ? "· auto-routed" : "· routage automatique"}
                    </span>
                  </div>
                );
              })()}
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
                {language === "fr" ? "Passer à Pro — 49 $/mois CAD" : "Upgrade to Pro — $49 CAD/mo"}
              </button>
              <p className="text-xs text-gray-600">
                {language === "fr" ? "Annulez en tout temps" : "Cancel anytime"}
              </p>
            </div>
          ) : (
          <div className="border-t border-gray-800 p-4 shrink-0">
            {/* Industry context chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              {([
                { labelFr: "🍽️ Restaurant", labelEn: "🍽️ Restaurant",
                  msgFr: "Pour cette conversation, je gère un restaurant au Québec. J'ai des questions sur la TVQ sur les repas, les obligations de déclarer les pourboires de mes employés (Loi sur les pourboires RQ), et les déductions admissibles (alimentation vs fournitures).",
                  msgEn: "For this conversation, I run a restaurant. I have questions about GST/HST on meals, employee tip reporting requirements, and eligible deductions (food vs. supplies)." },
                { labelFr: "💅 Salon/Spa",  labelEn: "💅 Salon/Spa",
                  msgFr: "Pour cette conversation, je gère un salon de coiffure ou spa. J'ai des questions sur la location de chaises vs statut employé, la TVQ sur mes services et produits revendus, et les déductions pour équipements esthétiques.",
                  msgEn: "For this conversation, I run a salon or spa. I have questions about chair rental vs. employee classification, GST/HST on services and product resale, and equipment deductions." },
                { labelFr: "🔨 Entrepreneur", labelEn: "🔨 Contractor",
                  msgFr: "Pour cette conversation, je suis entrepreneur général ou sous-traitant. J'ai des questions sur la TPS/TVQ sur mes travaux, les dépenses de chantier déductibles, et mes acomptes provisionnels trimestriels.",
                  msgEn: "For this conversation, I am a general contractor or sub-contractor. I have questions about GST/HST on my work, deductible job-site expenses, and quarterly installment payments." },
                { labelFr: "👥 Avec employés", labelEn: "👥 With employees",
                  msgFr: "Pour cette conversation, j'ai des employés. J'ai des questions sur les retenues à la source (RPC/AE/impôt), les feuillets T4/RL-1, et mes obligations d'employeur envers la CNESST et le RQAP.",
                  msgEn: "For this conversation, I have employees. I have questions about payroll deductions (CPP/EI/tax), T4 slips, and my employer obligations for WSIB/CNESST." },
                { labelFr: "🌱 1re année", labelEn: "🌱 First year",
                  msgFr: "Pour cette conversation, je suis en ma première année d'activité. J'ai des questions sur quand je dois m'inscrire à la TPS/TVQ, mon premier rapport d'impôt, et comment structurer mon entreprise (travailleur autonome vs incorporation).",
                  msgEn: "For this conversation, I am in my first year of business. I have questions about when to register for GST/HST, my first tax return, and how to structure my business (sole proprietor vs. incorporation)." },
              ]).map(({ labelFr, labelEn, msgFr, msgEn }) => (
                <button
                  key={labelFr}
                  onClick={() => setInput(language === "fr" ? msgFr : msgEn)}
                  className="shrink-0 text-[11px] font-medium text-gray-400 hover:text-white bg-surface-overlay hover:bg-brand/10 hover:border-brand/30 border border-gray-700 rounded-full px-3 py-1 transition-colors"
                >
                  {language === "fr" ? labelFr : labelEn}
                </button>
              ))}
            </div>
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
