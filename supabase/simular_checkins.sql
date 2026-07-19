-- Marca ~65% dos visitantes como tendo feito check-in, com um atraso
-- aleatório de 5 a 90 minutos após a inscrição. Gerado por scripts/seed.mjs.
-- Rode no SQL Editor do Supabase (o anon não tem permissão de UPDATE).

update public.visitantes
set check_in_realizado = true,
    horario_check_in   = criado_em + (random() * interval '85 minutes') + interval '5 minutes'
where random() < 0.65
  and check_in_realizado = false;

-- Confira o resultado:
select count(*) filter (where check_in_realizado)       as com_check_in,
       count(*) filter (where not check_in_realizado)   as aguardando,
       count(*)                                         as total
from public.visitantes;
