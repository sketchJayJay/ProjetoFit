create extension if not exists pgcrypto;

create table if not exists public.app_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_app_snapshots_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_app_snapshots_updated_at on public.app_snapshots;
create trigger trg_app_snapshots_updated_at
before update on public.app_snapshots
for each row execute procedure public.handle_app_snapshots_updated_at();

alter table public.app_snapshots enable row level security;

drop policy if exists "Users can view own app snapshot" on public.app_snapshots;
create policy "Users can view own app snapshot"
on public.app_snapshots
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own app snapshot" on public.app_snapshots;
create policy "Users can insert own app snapshot"
on public.app_snapshots
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own app snapshot" on public.app_snapshots;
create policy "Users can update own app snapshot"
on public.app_snapshots
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Opcional para armazenar fotos de evolução no futuro
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload own progress photos" on storage.objects;
create policy "Authenticated users can upload own progress photos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Authenticated users can read own progress photos" on storage.objects;
create policy "Authenticated users can read own progress photos"
on storage.objects
for select
to authenticated
using (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Authenticated users can update own progress photos" on storage.objects;
create policy "Authenticated users can update own progress photos"
on storage.objects
for update
to authenticated
using (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Authenticated users can delete own progress photos" on storage.objects;
create policy "Authenticated users can delete own progress photos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);
