-- Enable pgvector for semantic search
create extension if not exists vector;

-- Users table (mirrors Supabase Auth, extended with business profile)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null,
  full_name    text,
  business_name text,
  business_type text,       -- restaurant, contractor, retail, salon, etc.
  province     text default 'QC',
  language     text default 'fr', -- fr | en
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Conversations
create table if not exists public.conversations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Messages within a conversation
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  agent_used      text,   -- which agent handled this (business_advisor, tax, cash_flow)
  created_at      timestamptz default now()
);

-- Memory snapshots — stores key facts extracted from conversations
-- Used for local fallback search alongside Mem0
create table if not exists public.memory_snapshots (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  mem0_id     text unique,            -- Mem0's memory ID for sync
  category    text not null,          -- decision | problem | goal | financial | seasonal | compliance
  content     text not null,
  embedding   vector(1536),           -- OpenAI/Supabase embedding for local pgvector search
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Proactive suggestions queue — agent-generated nudges surfaced on next login
create table if not exists public.suggestions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  source_type text,        -- memory_recall | tax_calendar | cash_flow_alert
  shown       boolean default false,
  created_at  timestamptz default now()
);

-- Indexes
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_messages_user on public.messages(user_id);
create index if not exists idx_memory_snapshots_user on public.memory_snapshots(user_id);
create index if not exists idx_memory_snapshots_category on public.memory_snapshots(category);
create index if not exists idx_suggestions_user_unshown on public.suggestions(user_id) where shown = false;

-- pgvector index for semantic memory search
create index if not exists idx_memory_embedding on public.memory_snapshots
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Row-level security
alter table public.profiles         enable row level security;
alter table public.conversations    enable row level security;
alter table public.messages         enable row level security;
alter table public.memory_snapshots enable row level security;
alter table public.suggestions      enable row level security;

-- RLS policies — users only see their own data
create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id);

create policy "conversations: own rows" on public.conversations
  for all using (auth.uid() = user_id);

create policy "messages: own rows" on public.messages
  for all using (auth.uid() = user_id);

create policy "memory_snapshots: own rows" on public.memory_snapshots
  for all using (auth.uid() = user_id);

create policy "suggestions: own rows" on public.suggestions
  for all using (auth.uid() = user_id);

-- Function: update updated_at automatically
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger trg_conversations_updated_at
  before update on public.conversations
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile row when a new Supabase Auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
