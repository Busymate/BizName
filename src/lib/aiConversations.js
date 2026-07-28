import { supabase } from './supabaseClient';

// Persistent chat history for the dedicated AI Business Assistant page.
// Each conversation is one row in `ai_conversations` (see
// server/migrations/003_ai_assistant.sql); messages live as a JSONB
// array on that row, RLS restricts everything to the owner.

export async function listConversations({ search = '' } = {}) {
  let query = supabase
    .from('ai_conversations')
    .select('id, title, pinned, created_at, updated_at, messages')
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let rows = data || [];
  // Client-side search across title + message content — conversation
  // counts here are small enough (dozens, not thousands) that a
  // server-side full-text search would be overkill.
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    rows = rows.filter((c) => {
      if (c.title.toLowerCase().includes(q)) return true;
      return (c.messages || []).some((m) => (m.content || '').toLowerCase().includes(q));
    });
  }
  return rows;
}

export async function getConversation(id) {
  const { data, error } = await supabase.from('ai_conversations').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createConversation(firstMessageText) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('login_required');

  const title = firstMessageText ? firstMessageText.slice(0, 60) : 'New chat';
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({ user_id: user.id, title, messages: [] })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveMessages(id, messages) {
  const { data, error } = await supabase
    .from('ai_conversations')
    .update({ messages })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function renameConversation(id, title) {
  const trimmed = (title || '').trim();
  if (!trimmed) throw new Error('Title cannot be empty.');
  const { data, error } = await supabase.from('ai_conversations').update({ title: trimmed }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function togglePinConversation(id, pinned) {
  const { data, error } = await supabase.from('ai_conversations').update({ pinned }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteConversation(id) {
  const { error } = await supabase.from('ai_conversations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function clearConversationMessages(id) {
  return saveMessages(id, []);
}

// Plain-text export — one file per conversation, readable without any
// special tooling. Markdown-flavored (## for role headers) so it still
// looks reasonable if opened as .md.
export function exportConversation(conversation) {
  const lines = [`# ${conversation.title}`, ''];
  for (const m of conversation.messages || []) {
    lines.push(`## ${m.role === 'user' ? 'You' : 'BizName AI'}`, m.content, '');
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conversation.title.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 50) || 'conversation'}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
