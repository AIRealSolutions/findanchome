-- Messages: interoffice and client conversations with files (October 2026)
-- 1. Conversations, their members (staff, and clients invited by email) and messages. Attachments live in the
--    private message-files storage bucket under <conversation id>/, listed on the message.
-- 2. Members read and post; admins can read every conversation (oversight). Brokers and admins start conversations
--    and add people. Members only change their own read marker and email-alert setting.
-- 3. Adding someone by email links their login right away if they have one; clients without one get a profile when
--    they first sign in through the invite link (fanc_claim_invites).
-- 4. Live updates through Supabase Realtime.
-- Run after deletes.sql.

-- ───────────────────────── 1. Tables ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  brokerage_id UUID NOT NULL DEFAULT private.fanc_request_brokerage() REFERENCES public.fanc_brokerages (id),
  subject TEXT NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 200),
  created_by UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.fanc_clients (id) ON DELETE SET NULL,     -- the client record it's about, if any
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_preview TEXT
);
CREATE INDEX IF NOT EXISTS idx_fanc_conversations_last ON public.fanc_conversations (last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_fanc_conversations_client ON public.fanc_conversations (client_id);
CREATE INDEX IF NOT EXISTS idx_fanc_conversations_brokerage ON public.fanc_conversations (brokerage_id);
CREATE OR REPLACE TRIGGER update_fanc_conversations_updated_at
  BEFORE UPDATE ON public.fanc_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_fanc_updated_at_column();

CREATE TABLE IF NOT EXISTS public.fanc_conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  brokerage_id UUID NOT NULL DEFAULT private.fanc_request_brokerage() REFERENCES public.fanc_brokerages (id),
  conversation_id UUID NOT NULL REFERENCES public.fanc_conversations (id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,                 -- null until an invited client signs in
  email TEXT NOT NULL CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  name TEXT CHECK (char_length(name) <= 200),
  is_client BOOLEAN NOT NULL DEFAULT false,
  last_read_at TIMESTAMPTZ,
  notify BOOLEAN NOT NULL DEFAULT true,                                       -- email me about new messages
  added_by UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  UNIQUE (conversation_id, email)
);
CREATE INDEX IF NOT EXISTS idx_fanc_conversation_members_user ON public.fanc_conversation_members (user_id);
CREATE INDEX IF NOT EXISTS idx_fanc_conversation_members_email ON public.fanc_conversation_members (email) WHERE user_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_fanc_conversation_members_brokerage ON public.fanc_conversation_members (brokerage_id);

CREATE TABLE IF NOT EXISTS public.fanc_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  brokerage_id UUID NOT NULL DEFAULT private.fanc_request_brokerage() REFERENCES public.fanc_brokerages (id),
  conversation_id UUID NOT NULL REFERENCES public.fanc_conversations (id) ON DELETE CASCADE,
  author_id UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  author_name TEXT,
  body TEXT NOT NULL DEFAULT '' CHECK (char_length(body) <= 20000),
  -- [{ "path": "<conversation>/<id>/<file>", "name": "...", "type": "image/jpeg", "size": 12345 }]
  attachments JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(attachments) = 'array' AND jsonb_array_length(attachments) <= 20),
  CHECK (body <> '' OR jsonb_array_length(attachments) > 0)
);
CREATE INDEX IF NOT EXISTS idx_fanc_messages_conversation ON public.fanc_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_fanc_messages_brokerage ON public.fanc_messages (brokerage_id);

-- ───────────────────────── 2. Access ─────────────────────────
CREATE OR REPLACE FUNCTION private.fanc_is_conversation_member(conv uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.fanc_conversation_members m WHERE m.conversation_id = conv AND m.user_id = auth.uid()) $$;

-- Members, plus admins of the conversation's brokerage.
CREATE OR REPLACE FUNCTION private.fanc_can_see_conversation(conv uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT private.fanc_is_conversation_member(conv) OR (private.fanc_is_admin() AND EXISTS (
    SELECT 1 FROM public.fanc_conversations c WHERE c.id = conv AND c.brokerage_id = private.fanc_current_brokerage()))
$$;

-- For storage paths: the first folder is the conversation id.
CREATE OR REPLACE FUNCTION private.fanc_conversation_folder(path text)
RETURNS uuid LANGUAGE sql IMMUTABLE SET search_path = ''
AS $$
  SELECT CASE WHEN split_part(path, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
              THEN split_part(path, '/', 1)::uuid END
$$;

REVOKE ALL ON FUNCTION private.fanc_is_conversation_member(uuid), private.fanc_can_see_conversation(uuid),
  private.fanc_conversation_folder(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.fanc_is_conversation_member(uuid), private.fanc_can_see_conversation(uuid),
  private.fanc_conversation_folder(text) TO authenticated;

ALTER TABLE public.fanc_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_messages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['fanc_conversations', 'fanc_conversation_members', 'fanc_messages'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Tenant fence" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "Tenant fence" ON public.%I AS RESTRICTIVE FOR ALL TO public '
      'USING ((SELECT private.fanc_tenant_scope()) IS NULL OR brokerage_id = (SELECT private.fanc_tenant_scope())) '
      'WITH CHECK (CASE WHEN (SELECT private.fanc_tenant_scope()) IS NULL THEN private.fanc_brokerage_open(brokerage_id) '
      'ELSE brokerage_id = (SELECT private.fanc_tenant_scope()) END)', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Members and admins read conversations" ON public.fanc_conversations;
CREATE POLICY "Members and admins read conversations" ON public.fanc_conversations FOR SELECT TO authenticated
  USING (private.fanc_can_see_conversation(id));
DROP POLICY IF EXISTS "Staff start conversations" ON public.fanc_conversations;
CREATE POLICY "Staff start conversations" ON public.fanc_conversations FOR INSERT TO authenticated
  WITH CHECK (private.fanc_is_staff() AND created_by = auth.uid());
DROP POLICY IF EXISTS "Staff members rename conversations" ON public.fanc_conversations;
CREATE POLICY "Staff members rename conversations" ON public.fanc_conversations FOR UPDATE TO authenticated
  USING (private.fanc_is_staff() AND private.fanc_can_see_conversation(id))
  WITH CHECK (private.fanc_is_staff() AND private.fanc_can_see_conversation(id));
DROP POLICY IF EXISTS "Creators and admins delete conversations" ON public.fanc_conversations;
CREATE POLICY "Creators and admins delete conversations" ON public.fanc_conversations FOR DELETE TO authenticated
  USING (private.fanc_is_staff() AND (created_by = auth.uid() OR private.fanc_is_admin()));

DROP POLICY IF EXISTS "Members and admins see who is in a conversation" ON public.fanc_conversation_members;
CREATE POLICY "Members and admins see who is in a conversation" ON public.fanc_conversation_members FOR SELECT TO authenticated
  USING (private.fanc_can_see_conversation(conversation_id));
DROP POLICY IF EXISTS "Staff add people" ON public.fanc_conversation_members;
CREATE POLICY "Staff add people" ON public.fanc_conversation_members FOR INSERT TO authenticated
  WITH CHECK (private.fanc_is_staff() AND private.fanc_can_see_conversation(conversation_id));
DROP POLICY IF EXISTS "Staff remove people, anyone can leave" ON public.fanc_conversation_members;
CREATE POLICY "Staff remove people, anyone can leave" ON public.fanc_conversation_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR (private.fanc_is_staff() AND private.fanc_can_see_conversation(conversation_id)));
DROP POLICY IF EXISTS "Members update their own settings" ON public.fanc_conversation_members;
CREATE POLICY "Members update their own settings" ON public.fanc_conversation_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Members and admins read messages" ON public.fanc_messages;
CREATE POLICY "Members and admins read messages" ON public.fanc_messages FOR SELECT TO authenticated
  USING (private.fanc_can_see_conversation(conversation_id));
DROP POLICY IF EXISTS "Members post" ON public.fanc_messages;
CREATE POLICY "Members post" ON public.fanc_messages FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND private.fanc_is_conversation_member(conversation_id));
DROP POLICY IF EXISTS "Authors and admins delete messages" ON public.fanc_messages;
CREATE POLICY "Authors and admins delete messages" ON public.fanc_messages FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR (private.fanc_is_admin() AND private.fanc_can_see_conversation(conversation_id)));

REVOKE ALL ON public.fanc_conversations, public.fanc_conversation_members, public.fanc_messages FROM anon;
GRANT SELECT, INSERT, DELETE ON public.fanc_conversations, public.fanc_conversation_members, public.fanc_messages TO authenticated;
REVOKE UPDATE ON public.fanc_conversations, public.fanc_messages FROM authenticated;
GRANT UPDATE (subject, client_id) ON public.fanc_conversations TO authenticated;
-- Members change only their read marker and alert setting.
REVOKE UPDATE ON public.fanc_conversation_members FROM authenticated;
GRANT UPDATE (last_read_at, notify) ON public.fanc_conversation_members TO authenticated;

-- ───────────────────────── 3. Housekeeping triggers ─────────────────────────
-- Members and messages belong to their conversation's brokerage.
CREATE OR REPLACE TRIGGER fanc_inherit_brokerage BEFORE INSERT OR UPDATE OF conversation_id, brokerage_id ON public.fanc_conversation_members
  FOR EACH ROW EXECUTE FUNCTION private.fanc_inherit_brokerage('fanc_conversations', 'conversation_id');
CREATE OR REPLACE TRIGGER fanc_inherit_brokerage BEFORE INSERT OR UPDATE OF conversation_id, brokerage_id ON public.fanc_messages
  FOR EACH ROW EXECUTE FUNCTION private.fanc_inherit_brokerage('fanc_conversations', 'conversation_id');

-- Whoever starts a conversation is in it.
CREATE OR REPLACE FUNCTION private.fanc_conversation_creator()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.fanc_conversation_members (conversation_id, user_id, email, last_read_at, added_by)
    SELECT NEW.id, u.id, lower(u.email), NOW(), u.id FROM auth.users u WHERE u.id = NEW.created_by AND u.email IS NOT NULL
    ON CONFLICT (conversation_id, email) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE TRIGGER fanc_conversation_creator AFTER INSERT ON public.fanc_conversations
  FOR EACH ROW EXECUTE FUNCTION private.fanc_conversation_creator();

-- New members: link an existing login by email (or fill the email from the login), take a name, and mark clients.
CREATE OR REPLACE FUNCTION private.fanc_conversation_member_fill()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE p record;
BEGIN
  IF NEW.user_id IS NOT NULL AND (NEW.email IS NULL OR NEW.email = '') THEN
    NEW.email := (SELECT lower(u.email) FROM auth.users u WHERE u.id = NEW.user_id);
  END IF;
  NEW.email := lower(trim(NEW.email));
  IF NEW.user_id IS NULL THEN
    NEW.user_id := (SELECT u.id FROM auth.users u WHERE lower(u.email) = NEW.email LIMIT 1);
  END IF;
  SELECT pr.role, NULLIF(concat_ws(' ', pr.first_name, pr.last_name), '') AS full_name INTO p
  FROM public.fanc_user_profiles pr WHERE pr.id = NEW.user_id;
  NEW.is_client := COALESCE(p.role NOT IN ('broker', 'admin'), true);
  NEW.name := COALESCE(NULLIF(trim(NEW.name), ''), p.full_name);
  RETURN NEW;
END;
$$;
CREATE OR REPLACE TRIGGER fanc_conversation_member_fill BEFORE INSERT ON public.fanc_conversation_members
  FOR EACH ROW EXECUTE FUNCTION private.fanc_conversation_member_fill();

-- New messages: stamp the author's name, move the conversation to the top, and mark it read for the author.
CREATE OR REPLACE FUNCTION private.fanc_message_posted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND TG_WHEN = 'BEFORE' THEN
    NEW.author_name := COALESCE(
      (SELECT NULLIF(concat_ws(' ', p.first_name, p.last_name), '') FROM public.fanc_user_profiles p WHERE p.id = NEW.author_id),
      (SELECT m.name FROM public.fanc_conversation_members m WHERE m.conversation_id = NEW.conversation_id AND m.user_id = NEW.author_id),
      (SELECT u.email FROM auth.users u WHERE u.id = NEW.author_id),
      NEW.author_name);
    RETURN NEW;
  END IF;
  UPDATE public.fanc_conversations
  SET last_message_at = NEW.created_at,
      last_message_preview = left(CASE WHEN NEW.body <> '' THEN NEW.body
                                       ELSE '📎 ' || (NEW.attachments -> 0 ->> 'name') END, 160)
  WHERE id = NEW.conversation_id;
  UPDATE public.fanc_conversation_members SET last_read_at = NEW.created_at
  WHERE conversation_id = NEW.conversation_id AND user_id = NEW.author_id;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE TRIGGER fanc_message_author BEFORE INSERT ON public.fanc_messages
  FOR EACH ROW EXECUTE FUNCTION private.fanc_message_posted();
CREATE OR REPLACE TRIGGER fanc_message_posted AFTER INSERT ON public.fanc_messages
  FOR EACH ROW EXECUTE FUNCTION private.fanc_message_posted();

REVOKE ALL ON FUNCTION private.fanc_conversation_creator(), private.fanc_conversation_member_fill(),
  private.fanc_message_posted() FROM PUBLIC, anon, authenticated;

-- Invited clients: the join page accepts conversation invites too, and the first sign-in creates their profile.
CREATE OR REPLACE FUNCTION public.fanc_invite_exists(addr text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.fanc_deal_members WHERE email = lower(trim(addr)))
      OR EXISTS (SELECT 1 FROM public.fanc_conversation_members WHERE email = lower(trim(addr)))
$$;

CREATE OR REPLACE FUNCTION public.fanc_claim_invites()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  me UUID := auth.uid();
  my_email TEXT := lower(auth.jwt() ->> 'email');
  fname TEXT;
  n integer;
  c integer;
BEGIN
  IF me IS NULL OR my_email IS NULL THEN RETURN 0; END IF;
  UPDATE public.fanc_deal_members SET user_id = me, last_seen_at = NOW()
  WHERE email = my_email AND (user_id IS NULL OR user_id = me);
  GET DIAGNOSTICS n = ROW_COUNT;
  UPDATE public.fanc_conversation_members SET user_id = me WHERE email = my_email AND user_id IS NULL;
  GET DIAGNOSTICS c = ROW_COUNT;
  IF n + c > 0 AND NOT EXISTS (SELECT 1 FROM public.fanc_user_profiles WHERE id = me) THEN
    SELECT split_part(x.name, ' ', 1) INTO fname FROM (
      SELECT m.name FROM public.fanc_deal_members m WHERE m.user_id = me AND m.name IS NOT NULL
      UNION ALL
      SELECT m.name FROM public.fanc_conversation_members m WHERE m.user_id = me AND m.name IS NOT NULL
    ) x LIMIT 1;
    INSERT INTO public.fanc_user_profiles (id, role, first_name, is_active) VALUES (me, 'client', fname, true);
  END IF;
  RETURN n + c;
END;
$$;

-- ───────────────────────── Files ─────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('message-files', 'message-files', false, 26214400)          -- 25 MB per file
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Members read message files" ON storage.objects;
CREATE POLICY "Members read message files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'message-files' AND private.fanc_can_see_conversation(private.fanc_conversation_folder(name)));
DROP POLICY IF EXISTS "Members upload message files" ON storage.objects;
CREATE POLICY "Members upload message files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'message-files' AND private.fanc_is_conversation_member(private.fanc_conversation_folder(name)));
DROP POLICY IF EXISTS "Uploaders and admins delete message files" ON storage.objects;
CREATE POLICY "Uploaders and admins delete message files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'message-files' AND (owner_id = auth.uid()::text
         OR (private.fanc_is_admin() AND private.fanc_can_see_conversation(private.fanc_conversation_folder(name)))));

-- ───────────────────────── 4. Live updates ─────────────────────────
DO $$
DECLARE t text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH t IN ARRAY ARRAY['fanc_messages', 'fanc_conversations'] LOOP
      IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      END IF;
    END LOOP;
  END IF;
END $$;
