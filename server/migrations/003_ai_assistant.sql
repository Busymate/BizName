-- =========================================================
-- 003_ai_assistant.sql
-- Adds: ai_conversations — persistent chat history for the dedicated
-- AI Business Assistant page (src/pages/AIAssistant.jsx). Each row is
-- one conversation; messages are stored as a JSONB array on the row
-- rather than a separate messages table, since a single conversation
-- here is small (a few dozen messages at most) and this keeps
-- "rename", "delete", "pin", "export a conversation" all single-row
-- operations instead of needing joins/transactions.
-- =========================================================

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'New chat',
  messages jsonb not null default '[]'::jsonb,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_conversations enable row level security;

create policy "ai_conversations_select_own" on public.ai_conversations
  for select using (auth.uid() = user_id);
create policy "ai_conversations_insert_own" on public.ai_conversations
  for insert with check (auth.uid() = user_id);
create policy "ai_conversations_update_own" on public.ai_conversations
  for update using (auth.uid() = user_id);
create policy "ai_conversations_delete_own" on public.ai_conversations
  for delete using (auth.uid() = user_id);

create index if not exists idx_ai_conversations_user_updated
  on public.ai_conversations (user_id, updated_at desc);

-- Keeps `updated_at` accurate without every client write remembering to
-- set it — matters here because the conversation list is sorted by
-- updated_at (most recently active chat first), the same pattern a
-- ChatGPT-style sidebar uses.
create or replace function public.set_ai_conversation_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_ai_conversations_updated_at on public.ai_conversations;
create trigger trg_ai_conversations_updated_at
  before update on public.ai_conversations
  for each row execute function public.set_ai_conversation_updated_at();
