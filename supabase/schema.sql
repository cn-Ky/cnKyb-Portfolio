-- Supabase > SQL Editor'a yapıştırıp çalıştır
create table profile (
  id int primary key default 1 check (id = 1),
  name text not null default 'Ky', role text not null default 'Full-Stack Geliştirici',
  tagline text not null default 'Yağmur dinmiyordu. Kod da öyle.',
  bio text not null default 'Next.js, React ve TypeScript ile temiz, hızlı arayüzler yazıyorum. Projeni anlat, gerisini ben hallederim.',
  email text not null default '', github text not null default 'https://github.com/cn-Ky',
  available boolean not null default true);
insert into profile (id) values (1);

create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 120), caption text not null default '' check (char_length(caption) <= 600),
  tags text[] not null default '{}', url text not null default '', repo text not null default '', image text not null default '',
  created_at timestamptz not null default now());

create table messages (
  id uuid primary key default gen_random_uuid(),
  name text not null default '' check (char_length(name) <= 100),
  email text not null check (email ~ '^\S+@\S+\.\S+$' and char_length(email) <= 200),
  budget text not null default '' check (char_length(budget) <= 60),
  text text not null check (char_length(text) between 1 and 3000),
  read boolean not null default false, created_at timestamptz not null default now());

alter table profile enable row level security;
alter table projects enable row level security;
alter table messages enable row level security;

-- Herkes okuyabilir
create policy "profile herkese acik" on profile for select using (true);
create policy "projects herkese acik" on projects for select using (true);
-- Sadece giriş yapmış admin yazabilir (Auth > Sign ups kapalı olmalı!)
create policy "profile admin" on profile for update to authenticated using (true) with check (true);
create policy "projects admin" on projects for all to authenticated using (true) with check (true);
-- Ziyaretçi mesaj bırakabilir ama okuyamaz; admin okur/günceller/siler
create policy "mesaj gonder" on messages for insert to anon, authenticated with check (read = false);
create policy "mesaj admin" on messages for all to authenticated using (true) with check (true);

-- Proje görselleri için herkese açık bucket
insert into storage.buckets (id, name, public) values ('project-images', 'project-images', true);
create policy "gorsel oku" on storage.objects for select using (bucket_id = 'project-images');
create policy "gorsel yaz" on storage.objects for insert to authenticated with check (bucket_id = 'project-images');
create policy "gorsel sil" on storage.objects for delete to authenticated using (bucket_id = 'project-images');
