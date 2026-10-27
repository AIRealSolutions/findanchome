-- Shared deal workspace (/dashboard/deals/[id]/workspace): the broker and their clients share a to-do list,
-- a calendar of key dates, and a newsfeed of what happened during the listing or purchase.
-- Clients are invited by email (fanc_deal_members), sign in with an emailed link at /join, and their login is
-- linked to the invite by fanc_claim_invites(). Clients never read fanc_deals directly (it holds commission
-- fields); they get a safe view of the deal from fanc_workspace_deals().
-- Run after control_center.sql.

-- ───────────────────────── Members ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_deal_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.fanc_deals (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email TEXT NOT NULL CHECK (email = lower(email) AND char_length(email) BETWEEN 3 AND 320),
  name TEXT CHECK (char_length(name) <= 200),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  invited_by UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  last_seen_at TIMESTAMPTZ,
  UNIQUE (deal_id, email)
);
CREATE INDEX IF NOT EXISTS idx_fanc_deal_members_user ON public.fanc_deal_members (user_id);
CREATE INDEX IF NOT EXISTS idx_fanc_deal_members_email ON public.fanc_deal_members (email);

CREATE OR REPLACE FUNCTION private.fanc_is_deal_member(deal UUID)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.fanc_deal_members m WHERE m.deal_id = deal AND m.user_id = auth.uid()) $$;
REVOKE ALL ON FUNCTION private.fanc_is_deal_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.fanc_is_deal_member(UUID) TO authenticated;

-- ───────────────────────── Shared to-do ─────────────────────────
ALTER TABLE public.fanc_deal_tasks
  ADD COLUMN IF NOT EXISTS shared BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS assignee TEXT NOT NULL DEFAULT 'broker' CHECK (assignee IN ('broker', 'client')),
  ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL;

-- Clients may add tasks (always shared, theirs to do) and tick shared ones off, nothing else.
CREATE OR REPLACE FUNCTION private.fanc_deal_task_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR private.fanc_is_staff() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.shared := true;
    NEW.assignee := 'client';
    NEW.created_by := auth.uid();
    NEW.anchor := NULL;
    NEW.offset_days := 0;
    NEW.done_at := NULL;
  ELSIF (to_jsonb(NEW) - 'done_at') IS DISTINCT FROM (to_jsonb(OLD) - 'done_at')
        -- COALESCE: tasks from before this migration have no creator, and NULL must not count as "theirs".
        AND NOT COALESCE(OLD.created_by = auth.uid() AND NEW.shared AND NEW.assignee = OLD.assignee AND NEW.deal_id = OLD.deal_id
                         AND NEW.created_by = OLD.created_by, false) THEN
    RAISE EXCEPTION 'Clients can only tick off shared tasks or edit their own' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.fanc_deal_task_guard() FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE TRIGGER fanc_deal_task_guard
  BEFORE INSERT OR UPDATE ON public.fanc_deal_tasks
  FOR EACH ROW EXECUTE FUNCTION private.fanc_deal_task_guard();

-- ───────────────────────── Newsfeed ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_deal_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.fanc_deals (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_id UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  author_name TEXT CHECK (char_length(author_name) <= 200),
  author_role TEXT NOT NULL DEFAULT 'client' CHECK (author_role IN ('broker', 'client', 'system')),
  kind TEXT NOT NULL DEFAULT 'update' CHECK (kind IN (
    'update', 'showing', 'offer', 'inspection', 'appraisal', 'repair', 'document', 'marketing', 'question', 'milestone')),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  link_url TEXT CHECK (char_length(link_url) <= 1000 AND link_url ~* '^https?://'),
  internal BOOLEAN NOT NULL DEFAULT false,   -- broker-only note, hidden from clients
  parent_id UUID REFERENCES public.fanc_deal_posts (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_fanc_deal_posts_deal ON public.fanc_deal_posts (deal_id, created_at DESC);

-- Who wrote it comes from the session, not the client.
CREATE OR REPLACE FUNCTION private.fanc_deal_post_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  NEW.author_id := auth.uid();
  IF private.fanc_is_staff() THEN
    NEW.author_role := CASE WHEN NEW.author_role = 'system' THEN 'system' ELSE 'broker' END;
  ELSE
    NEW.author_role := 'client';
    NEW.internal := false;
    IF NEW.kind = 'milestone' THEN NEW.kind := 'update'; END IF;
  END IF;
  IF NEW.parent_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.fanc_deal_posts p WHERE p.id = NEW.parent_id AND p.deal_id = NEW.deal_id
  ) THEN
    RAISE EXCEPTION 'A comment must belong to a post on the same deal' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.fanc_deal_post_guard() FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE TRIGGER fanc_deal_post_guard
  BEFORE INSERT ON public.fanc_deal_posts
  FOR EACH ROW EXECUTE FUNCTION private.fanc_deal_post_guard();

-- ───────────────────────── Access ─────────────────────────
ALTER TABLE public.fanc_deal_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_deal_posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Members
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_deal_members' AND policyname = 'Brokers and admins have full access') THEN
    CREATE POLICY "Brokers and admins have full access" ON public.fanc_deal_members FOR ALL TO authenticated
      USING (private.fanc_is_staff()) WITH CHECK (private.fanc_is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_deal_members' AND policyname = 'Members see who else is on their deal') THEN
    CREATE POLICY "Members see who else is on their deal" ON public.fanc_deal_members FOR SELECT TO authenticated
      USING (private.fanc_is_deal_member(deal_id));
  END IF;

  -- Tasks: clients see and work the shared ones on their deals.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_deal_tasks' AND policyname = 'Members see shared tasks') THEN
    CREATE POLICY "Members see shared tasks" ON public.fanc_deal_tasks FOR SELECT TO authenticated
      USING (shared AND private.fanc_is_deal_member(deal_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_deal_tasks' AND policyname = 'Members add tasks') THEN
    CREATE POLICY "Members add tasks" ON public.fanc_deal_tasks FOR INSERT TO authenticated
      WITH CHECK (shared AND private.fanc_is_deal_member(deal_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_deal_tasks' AND policyname = 'Members update shared tasks') THEN
    CREATE POLICY "Members update shared tasks" ON public.fanc_deal_tasks FOR UPDATE TO authenticated
      USING (shared AND private.fanc_is_deal_member(deal_id)) WITH CHECK (shared AND private.fanc_is_deal_member(deal_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_deal_tasks' AND policyname = 'Members delete their own tasks') THEN
    CREATE POLICY "Members delete their own tasks" ON public.fanc_deal_tasks FOR DELETE TO authenticated
      USING (created_by = auth.uid() AND private.fanc_is_deal_member(deal_id));
  END IF;

  -- Posts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_deal_posts' AND policyname = 'Brokers and admins have full access') THEN
    CREATE POLICY "Brokers and admins have full access" ON public.fanc_deal_posts FOR ALL TO authenticated
      USING (private.fanc_is_staff()) WITH CHECK (private.fanc_is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_deal_posts' AND policyname = 'Members read the feed') THEN
    CREATE POLICY "Members read the feed" ON public.fanc_deal_posts FOR SELECT TO authenticated
      USING (NOT internal AND private.fanc_is_deal_member(deal_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_deal_posts' AND policyname = 'Members post to the feed') THEN
    CREATE POLICY "Members post to the feed" ON public.fanc_deal_posts FOR INSERT TO authenticated
      WITH CHECK (NOT internal AND author_role = 'client' AND private.fanc_is_deal_member(deal_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_deal_posts' AND policyname = 'Members delete their own posts') THEN
    CREATE POLICY "Members delete their own posts" ON public.fanc_deal_posts FOR DELETE TO authenticated
      USING (author_id = auth.uid() AND private.fanc_is_deal_member(deal_id));
  END IF;
END $$;

REVOKE ALL ON public.fanc_deal_members, public.fanc_deal_posts FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fanc_deal_members, public.fanc_deal_posts TO authenticated;

-- ───────────────────────── Functions ─────────────────────────

-- The workspace view of a deal: no commission, split or private notes. Staff see any deal; clients their own.
CREATE OR REPLACE FUNCTION public.fanc_workspace_deals(only_deal UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID, side TEXT, stage TEXT, property_address TEXT, city TEXT, zip_code TEXT, mls_number TEXT, is_hud BOOLEAN,
  list_price NUMERIC, contract_price NUMERIC, effective_date DATE, emd_due_date DATE, inspection_date DATE,
  due_diligence_date DATE, appraisal_date DATE, closing_date DATE, lender TEXT, closing_attorney TEXT, other_agent TEXT,
  updated_at TIMESTAMPTZ, client_first_name TEXT, client_last_name TEXT,
  broker_id UUID, broker_name TEXT, broker_phone TEXT, broker_email TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT d.id, d.side, d.stage, d.property_address, d.city::text, d.zip_code::text, d.mls_number::text, d.is_hud,
         d.list_price, d.contract_price, d.effective_date, d.emd_due_date, d.inspection_date, d.due_diligence_date,
         d.appraisal_date, d.closing_date, d.lender, d.closing_attorney, d.other_agent, d.updated_at,
         c.first_name::text, c.last_name::text,
         d.broker_id, NULLIF(concat_ws(' ', p.first_name, p.last_name), ''), p.phone::text, u.email::text
  FROM public.fanc_deals d
  JOIN public.fanc_clients c ON c.id = d.client_id
  LEFT JOIN public.fanc_user_profiles p ON p.id = d.broker_id
  LEFT JOIN auth.users u ON u.id = d.broker_id
  WHERE (only_deal IS NULL OR d.id = only_deal)
    AND (private.fanc_is_staff() OR private.fanc_is_deal_member(d.id))
  ORDER BY d.updated_at DESC
$$;
REVOKE ALL ON FUNCTION public.fanc_workspace_deals(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fanc_workspace_deals(UUID) TO authenticated;

-- After signing in: create the client's profile if needed and link every invite sent to their email.
CREATE OR REPLACE FUNCTION public.fanc_claim_invites()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  me UUID := auth.uid();
  my_email TEXT := lower(auth.jwt() ->> 'email');
  fname TEXT;
  n integer;
BEGIN
  IF me IS NULL OR my_email IS NULL THEN RETURN 0; END IF;
  UPDATE public.fanc_deal_members SET user_id = me, last_seen_at = NOW()
  WHERE email = my_email AND (user_id IS NULL OR user_id = me);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n > 0 AND NOT EXISTS (SELECT 1 FROM public.fanc_user_profiles WHERE id = me) THEN
    SELECT split_part(m.name, ' ', 1) INTO fname FROM public.fanc_deal_members m WHERE m.user_id = me AND m.name IS NOT NULL LIMIT 1;
    INSERT INTO public.fanc_user_profiles (id, role, first_name, is_active) VALUES (me, 'client', fname, true);
  END IF;
  RETURN n;
END;
$$;
REVOKE ALL ON FUNCTION public.fanc_claim_invites() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fanc_claim_invites() TO authenticated;

-- /join only emails a sign-in link to invited addresses (the page says the same thing either way).
CREATE OR REPLACE FUNCTION public.fanc_invite_exists(addr TEXT)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.fanc_deal_members WHERE email = lower(trim(addr))) $$;
REVOKE ALL ON FUNCTION public.fanc_invite_exists(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fanc_invite_exists(TEXT) TO anon, authenticated;
