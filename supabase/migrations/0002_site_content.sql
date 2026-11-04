-- Site content an admin edits without a deploy. Run once in Supabase → SQL editor, after
-- 0001_marketplace.sql. Server-only, like every other table: RLS on, no policies.

-- Settings by key. Today: 'featured_project' = the slug of the home-page featured project.
create table if not exists site_settings (
  key text primary key check (char_length(key) between 1 and 64),
  value text not null check (char_length(value) <= 200),
  updated_by uuid references admins (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Admin edits to a project (Admin → Projects): one JSON record per project, validated by the
-- website before use. Without a row, the site shows the project as bundled with the code.
create table if not exists project_content (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  data jsonb not null check (pg_column_size(data) < 200000),
  updated_by uuid references admins (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;
alter table project_content enable row level security;
