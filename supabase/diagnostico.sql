-- Diagnóstico do RLS da tabela `visitantes`.
-- Rode no SQL Editor do Supabase e me mande o resultado das 4 consultas.

-- 1. O RLS está ligado?
select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename = 'visitantes';

-- 2. Quais policies existem, e são permissivas ou restritivas?
--    `permissive = RESTRICTIVE` em qualquer linha explica um bloqueio total.
select policyname, cmd, permissive, roles, qual as using_expr, with_check
from pg_policies
where schemaname = 'public' and tablename = 'visitantes'
order by cmd, policyname;

-- 3. A role `anon` tem GRANT na tabela?
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'visitantes'
  and grantee in ('anon', 'authenticated')
order by grantee, privilege_type;

-- 4. As colunas têm os defaults esperados?
select column_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'visitantes'
order by ordinal_position;
