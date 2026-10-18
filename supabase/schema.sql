create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id smallint primary key check (id = 1),
  content jsonb not null,
  updated_by uuid references public.admin_users (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;

revoke all on public.admin_users from anon, authenticated;
revoke all on public.site_content from anon, authenticated;

create or replace function public.set_site_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
before update on public.site_content
for each row execute function public.set_site_content_updated_at();
