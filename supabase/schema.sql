-- =============================================================================
-- Tupã Hub — schema e políticas de segurança (RLS)
--
-- Este arquivo reflete o schema REAL do projeto (colunas em português),
-- verificado contra o banco em 18/07/2026. Rode no SQL Editor do Supabase.
--
-- IMPORTANTE: a chave anon/publishable fica exposta no bundle JavaScript (isso
-- é normal e esperado). O que impede acesso indevido são as policies abaixo.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabelas (use `create table if not exists` — as tabelas já existem)
-- -----------------------------------------------------------------------------

create table if not exists public.visitantes (
  id                 bigint generated always as identity primary key,
  nome               text        not null check (length(trim(nome)) > 0),
  telefone           text        not null,
  experiencias       text[]      not null default '{}',
  check_in_realizado boolean     not null default false,
  horario_check_in   timestamptz,
  criado_em          timestamptz not null default now()
);

create table if not exists public.participantes_campeonato (
  id        bigint generated always as identity primary key,
  nome      text        not null,
  jogo      text        not null,
  criado_em timestamptz not null default now()
);

-- O app exibe o nick dos jogadores no chaveamento, mas a coluna não existe.
-- Veja a seção "AJUSTES PENDENTES" no final do arquivo.
alter table public.participantes_campeonato
  add column if not exists nickname text;

-- -----------------------------------------------------------------------------
-- Índices
-- -----------------------------------------------------------------------------

create index if not exists visitantes_criado_em_idx
  on public.visitantes (criado_em desc);

-- Acelera o filtro `.ilike('nome', '%termo%')` da tela de check-in.
create extension if not exists pg_trgm;
create index if not exists visitantes_nome_trgm_idx
  on public.visitantes using gin (nome gin_trgm_ops);

create index if not exists participantes_jogo_idx
  on public.participantes_campeonato (jogo);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.visitantes               enable row level security;
alter table public.participantes_campeonato enable row level security;

-- -----------------------------------------------------------------------------
-- Helper: identifica o administrador
-- Troque o e-mail se o admin mudar (precisa bater com VITE_ADMIN_EMAIL).
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'julioczquerido@gmail.com';
$$;

-- -----------------------------------------------------------------------------
-- Policies: visitantes
--
-- CORRIGE O BUG ATUAL: hoje o INSERT anônimo está bloqueado (erro 42501), então
-- o formulário de agendamento NUNCA grava no banco — cai silenciosamente no
-- localStorage. A policy abaixo libera a inscrição pública.
--
-- Leitura continua restrita ao admin: a lista contém telefone dos visitantes
-- (dado pessoal sob LGPD) e não pode ser pública.
-- -----------------------------------------------------------------------------

-- Remove TODAS as policies existentes destas tabelas, inclusive as criadas
-- antes por outro nome. Sem isso, uma policy antiga de SELECT permissiva
-- continua liberando a leitura pública mesmo depois deste arquivo rodar.
do $$
declare pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('visitantes', 'participantes_campeonato')
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- As colunas de check-in precisam de default. Se a tabela foi criada sem eles,
-- `check_in_realizado` chega NULL no INSERT e a checagem abaixo falharia:
-- em SQL, `NULL = false` resulta em NULL, não em true, e o RLS exige true.
alter table public.visitantes
  alter column check_in_realizado set default false;

update public.visitantes set check_in_realizado = false where check_in_realizado is null;

alter table public.visitantes
  alter column check_in_realizado set not null;

create policy "anon pode se inscrever"
  on public.visitantes for insert
  to anon, authenticated
  -- `is not true` é seguro contra NULL, diferente de `= false`.
  with check (
    check_in_realizado is not true
    and horario_check_in is null
  );

create policy "admin le inscritos"
  on public.visitantes for select
  to authenticated
  using (public.is_admin());

create policy "admin atualiza check-in"
  on public.visitantes for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin remove inscritos"
  on public.visitantes for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Policies: participantes_campeonato
-- O chaveamento é público; a edição não é.
-- -----------------------------------------------------------------------------

create policy "chaveamento publico"
  on public.participantes_campeonato for select
  to anon, authenticated
  using (true);

create policy "anon pode se inscrever"
  on public.participantes_campeonato for insert
  to anon, authenticated
  with check (true);

create policy "admin gerencia inscritos"
  on public.participantes_campeonato for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Realtime
-- -----------------------------------------------------------------------------

-- Ignora o erro caso a tabela ja esteja publicada (permite re-rodar o arquivo).
do $$
begin
  begin
    alter publication supabase_realtime add table public.visitantes;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.participantes_campeonato;
  exception when duplicate_object then null;
  end;
end $$;

-- -----------------------------------------------------------------------------
-- Verificação
-- -----------------------------------------------------------------------------
-- select tablename, rowsecurity from pg_tables
--   where schemaname = 'public'
--     and tablename in ('visitantes', 'participantes_campeonato');
--
-- select tablename, policyname, cmd, roles from pg_policies
--   where schemaname = 'public' order by tablename, cmd;

-- =============================================================================
-- AJUSTES PENDENTES NO CÓDIGO (ver relatório)
--
-- 1. ChampionshipManager.jsx faz `.eq('game', ...)` — a coluna chama `jogo`.
-- 2. ChampionshipManager.jsx lê `player.nickname` — a coluna foi adicionada
--    acima, mas ficará NULL até o portal passar a gravar de fato.
-- 3. ChampionshipPortal.jsx não grava no Supabase: simula um POST para a API
--    do Challonge e descarta a inscrição.
-- =============================================================================
