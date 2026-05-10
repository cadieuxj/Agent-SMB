const BASE = "/api/backend";

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
}

export async function sendMessage(
  userId: string,
  email: string,
  message: string,
  conversationId?: string,
  language = "fr"
): Promise<ChatResponse> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, email, message, conversation_id: conversationId, language }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMemories(userId: string): Promise<Memory[]> {
  const res = await fetch(`${BASE}/memories/${userId}`);
  if (!res.ok) throw new Error(`Backend ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.memories ?? [];
}

export async function deleteMemory(userId: string, memoryId: string): Promise<void> {
  const res = await fetch(`${BASE}/memories/${userId}/${memoryId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

export async function getSuggestions(userId: string): Promise<Suggestion[]> {
  const res = await fetch(`${BASE}/suggestions/${userId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.suggestions ?? [];
}

export async function getDeadlines(userId: string): Promise<Deadline[]> {
  const res = await fetch(`${BASE}/suggestions/${userId}/deadlines`);
  if (!res.ok) return [];
  return res.json();
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const res = await fetch(`${BASE}/conversations/${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getConversationMessages(userId: string, conversationId: string): Promise<Message[]> {
  const res = await fetch(`${BASE}/conversations/${userId}/${conversationId}/messages`);
  if (!res.ok) return [];
  return res.json();
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const res = await fetch(`${BASE}/profiles/${userId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateProfile(userId: string, data: Partial<Omit<Profile, "id">>): Promise<Profile> {
  const res = await fetch(`${BASE}/profiles/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
