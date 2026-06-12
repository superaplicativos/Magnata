-- =====================================================================
-- Magnata Brasil — configuração do banco no Supabase
-- Cole tudo isto no Supabase: SQL Editor > New query > Run
-- =====================================================================

-- 1) Tabela chave-valor que guarda partidas e chat
create table if not exists kv (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

-- 2) Segurança de linha (RLS) + políticas públicas (jogo casual, sem login)
alter table kv enable row level security;

drop policy if exists "leitura publica" on kv;
drop policy if exists "escrita publica" on kv;
drop policy if exists "update publico"  on kv;

create policy "leitura publica" on kv for select using (true);
create policy "escrita publica" on kv for insert with check (true);
create policy "update publico"  on kv for update using (true) with check (true);

-- 3) Habilita REALTIME na tabela kv (multiplayer instantâneo)
--    (adiciona a tabela à publicação que o Realtime escuta)
alter publication supabase_realtime add table kv;

-- 4) Garante que o Realtime envie a linha completa nos eventos de UPDATE
alter table kv replica identity full;
