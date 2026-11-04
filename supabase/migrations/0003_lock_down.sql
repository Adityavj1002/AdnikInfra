-- Lock the database down to the website's server. Run once in Supabase → SQL editor, after
-- 0001 and 0002. Safe to run again.
--
-- The website reaches these tables only from its server, with the secret (service role) key,
-- which bypasses row-level security. Nothing is meant for the public keys: RLS with no policies
-- already returns no rows to them; this also takes away their table privileges, so the public
-- REST and GraphQL APIs refuse outright and don't even list the tables.

do $$
declare
  t text;
begin
  foreach t in array array['admins', 'admin_sessions', 'listings', 'listing_events', 'subscribers', 'campaigns', 'site_settings', 'project_content']
  loop
    execute format('alter table public.%I enable row level security', t);
    -- Applies RLS to the table owner too; the service role still bypasses it by design.
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant all on table public.%I to service_role', t);
  end loop;
end $$;

revoke all on all sequences in schema public from anon, authenticated;
grant usage, select on all sequences in schema public to service_role;

-- The trigger function: a fixed search path (no lookup can be hijacked), callable by no one directly.
alter function public.touch_updated_at() set search_path = '';
revoke all on function public.touch_updated_at() from public, anon, authenticated;
