import { createClient } from "@/lib/supabase/client";

const BASE = "/api/backend";

/** Fetch the current session's JWT and return it as an Authorization header. */
async function authHeader(): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {}
  return {};
}

export interface ChatResponse {
  reply: string;
  agent: string;
  intent: string;
  conversation_id: string;
}

export interface Memory {
  id: string;
  memory: string;
  created_at: string;
}

export interface Suggestion {
  id: string;
  content: string;
  source_type: string | null;
  created_at: string;
}

export interface Deadline {
  date: string;
  title: string;
  title_fr: string;
  urgency: string;
  days_until: number;
  authority: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent_used: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  business_name: string | null;
  business_type: string | null;
  province: string;
  language: string;
  sales_tax_registered: boolean | null;
  revenue_range: string | null;
}

export async function sendMessage(
  userId: string,
  email: string,
  message: string,
  conversationId?: string,
  language = "fr",
  forcedAgent?: string,
): Promise<ChatResponse> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify({
      user_id: userId,
      email,
      message,
      conversation_id: conversationId,
      language,
      forced_agent: forcedAgent ?? null,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMemories(userId: string): Promise<Memory[]> {
  const res = await fetch(`${BASE}/memories/${userId}`, { headers: await authHeader() });
  if (!res.ok) throw new Error(`Backend ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.memories ?? [];
}

export async function deleteMemory(userId: string, memoryId: string): Promise<void> {
  const res = await fetch(`${BASE}/memories/${userId}/${memoryId}`, {
    method: "DELETE",
    headers: await authHeader(),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function getSuggestions(userId: string): Promise<Suggestion[]> {
  const res = await fetch(`${BASE}/suggestions/${userId}`, { headers: await authHeader() });
  if (!res.ok) return [];
  const data = await res.json();
  return data.suggestions ?? [];
}

export async function getDeadlines(userId: string): Promise<Deadline[]> {
  const res = await fetch(`${BASE}/suggestions/${userId}/deadlines`, { headers: await authHeader() });
  if (!res.ok) return [];
  return res.json();
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const res = await fetch(`${BASE}/conversations/${userId}`, { headers: await authHeader() });
  if (!res.ok) return [];
  return res.json();
}

export async function getConversationMessages(userId: string, conversationId: string): Promise<Message[]> {
  const res = await fetch(`${BASE}/conversations/${userId}/${conversationId}/messages`, {
    headers: await authHeader(),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const res = await fetch(`${BASE}/profiles/${userId}`, { headers: await authHeader() });
  if (!res.ok) return null;
  return res.json();
}

export async function updateProfile(userId: string, data: Partial<Omit<Profile, "id">>): Promise<Profile> {
  const res = await fetch(`${BASE}/profiles/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteAccount(userId: string): Promise<void> {
  const res = await fetch(`${BASE}/profiles/${userId}`, {
    method: "DELETE",
    headers: await authHeader(),
  });
  if (!res.ok) throw new Error(await res.text());
}

export interface NotificationPrefs {
  deadline_email: boolean;
  reminder_days_before: number;
}

export async function getNotificationPrefs(userId: string): Promise<NotificationPrefs> {
  const res = await fetch(`${BASE}/notifications/${userId}/preferences`, {
    headers: await authHeader(),
  });
  if (!res.ok) return { deadline_email: false, reminder_days_before: 7 };
  return res.json();
}

export async function saveNotificationPrefs(userId: string, prefs: NotificationPrefs): Promise<void> {
  const res = await fetch(`${BASE}/notifications/${userId}/preferences`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(prefs),
  });
  if (!res.ok) throw new Error(await res.text());
}
