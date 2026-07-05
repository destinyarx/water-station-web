-- =============================================================
-- Feature 011 — AquaFlow AI Assistant
-- Authoritative migration for ai_conversations + ai_messages.
-- Run once in the Supabase dashboard SQL editor.
--
-- Ownership model is deliberately NOT the shared-org-queue pattern used by
-- deliveries/maintenance: conversations are personal to their creator and the
-- whole module is owner-only. See docs/adr/0007 and docs/adr/0008.
-- =============================================================

-- Conversations: one AI chat thread, owned by a single user.
create table if not exists public.ai_conversations (
  id          bigint generated always as identity primary key,
  org_id      integer      not null references public.organizations(organization_code),
  created_by  varchar(255) not null references public.users(clerk_id),
  title       varchar(200) not null default 'New chat',
  created_at  timestamp    not null default now(),
  updated_at  timestamp
  -- no deleted_at: conversations are hard-deleted (cascades to messages)
);

-- Messages: one turn in a conversation. Ownership is inherited from the parent
-- conversation via conversation_id (no denormalized org_id/created_by).
create table if not exists public.ai_messages (
  id              bigint generated always as identity primary key,
  conversation_id bigint not null references public.ai_conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,                 -- actual text sent to / received from the assistant
  display_text    text,                          -- overrides what's shown in the bubble (ready-made prompt title)
  card_type       text check (card_type in ('insight', 'flag', 'ranked')),  -- null = plain text
  card_data       jsonb,                         -- structured payload matching card_type
  created_at      timestamp not null default now()
);

-- Indexes
create index if not exists ai_conversations_owner_idx
  on public.ai_conversations (org_id, created_by, updated_at desc);

create index if not exists ai_messages_conversation_idx
  on public.ai_messages (conversation_id, created_at);

-- Row Level Security
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

-- helpers (from Clerk JWT claims):
--   (auth.jwt() ->> 'organization')::int  = caller's org_id
--   (auth.jwt() ->> 'sub')                = caller's clerk_id
--   (auth.jwt() ->> 'is_owner')::boolean  = caller is the station owner

-- ---------- ai_conversations ----------
-- Every op requires: same org + same creator + owner claim.
create policy "ai_conversations_select"
  on public.ai_conversations for select
  using (
    org_id = (auth.jwt() ->> 'organization')::int
    and created_by = (auth.jwt() ->> 'sub')
    and (auth.jwt() ->> 'is_owner')::boolean = true
  );

create policy "ai_conversations_insert"
  on public.ai_conversations for insert
  with check (
    org_id = (auth.jwt() ->> 'organization')::int
    and created_by = (auth.jwt() ->> 'sub')
    and (auth.jwt() ->> 'is_owner')::boolean = true
  );

create policy "ai_conversations_update"
  on public.ai_conversations for update
  using (
    org_id = (auth.jwt() ->> 'organization')::int
    and created_by = (auth.jwt() ->> 'sub')
    and (auth.jwt() ->> 'is_owner')::boolean = true
  )
  with check (
    org_id = (auth.jwt() ->> 'organization')::int
    and created_by = (auth.jwt() ->> 'sub')
    and (auth.jwt() ->> 'is_owner')::boolean = true
  );

create policy "ai_conversations_delete"
  on public.ai_conversations for delete
  using (
    org_id = (auth.jwt() ->> 'organization')::int
    and created_by = (auth.jwt() ->> 'sub')
    and (auth.jwt() ->> 'is_owner')::boolean = true
  );

-- ---------- ai_messages ----------
-- Ownership inherited: a message is reachable only if its parent conversation
-- passes the same org + creator + owner check.
create policy "ai_messages_select"
  on public.ai_messages for select
  using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = ai_messages.conversation_id
        and c.org_id = (auth.jwt() ->> 'organization')::int
        and c.created_by = (auth.jwt() ->> 'sub')
        and (auth.jwt() ->> 'is_owner')::boolean = true
    )
  );

create policy "ai_messages_insert"
  on public.ai_messages for insert
  with check (
    exists (
      select 1 from public.ai_conversations c
      where c.id = ai_messages.conversation_id
        and c.org_id = (auth.jwt() ->> 'organization')::int
        and c.created_by = (auth.jwt() ->> 'sub')
        and (auth.jwt() ->> 'is_owner')::boolean = true
    )
  );

create policy "ai_messages_delete"
  on public.ai_messages for delete
  using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = ai_messages.conversation_id
        and c.org_id = (auth.jwt() ->> 'organization')::int
        and c.created_by = (auth.jwt() ->> 'sub')
        and (auth.jwt() ->> 'is_owner')::boolean = true
    )
  );
