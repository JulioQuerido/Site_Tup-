/**
 * Popula a tabela `visitantes` com dados aleatórios para teste.
 *
 *   node scripts/seed.mjs            # insere 120 visitantes
 *   node scripts/seed.mjs 300        # insere 300
 *   node scripts/seed.mjs --limpar   # apaga tudo antes de inserir
 *
 * Requer que `supabase/schema.sql` já tenha sido aplicado (a policy
 * "anon pode se inscrever" é o que permite a escrita).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l.trim() && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const NOMES = ['Gabriel', 'Lucas', 'Mariana', 'Beatriz', 'Rafael', 'Ana', 'Pedro', 'Juliana', 'Matheus', 'Larissa', 'Thiago', 'Camila', 'Bruno', 'Fernanda', 'Diego', 'Isabela', 'Vinícius', 'Amanda', 'Felipe', 'Letícia'];
const SOBRENOMES = ['Silva', 'Oliveira', 'Costa', 'Santos', 'Souza', 'Lima', 'Pereira', 'Almeida', 'Ferreira', 'Rodrigues', 'Martins', 'Barbosa'];
const EXPERIENCIAS = ['vr', 'manga', 'ps5', 'videoke'];

// Pesos: PS5 e VR sao mais procurados que manga/videoke — deixa o grafico
// com uma distribuicao plausivel em vez de uniforme.
const PESOS = { vr: 0.55, manga: 0.30, ps5: 0.60, videoke: 0.25 };

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const int = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function sortearExperiencias() {
  const escolhidas = EXPERIENCIAS.filter(e => Math.random() < PESOS[e]);
  return escolhidas.length ? escolhidas : [pick(EXPERIENCIAS)];
}

/** Distribui as inscrições nos últimos 7 dias, concentradas no horário do evento. */
function sortearData() {
  const diasAtras = int(0, 6);
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  d.setHours(int(10, 21), int(0, 59), int(0, 59), 0);
  return d.toISOString();
}

const total = Number(process.argv.find(a => /^\d+$/.test(a))) || 120;
const limpar = process.argv.includes('--limpar');

if (limpar) {
  // O anon nao tem permissao de DELETE (por design — so o admin apaga).
  console.log('Para limpar a tabela, rode no SQL Editor do Supabase:');
  console.log('  truncate table public.visitantes;\n');
  process.exit(0);
}

// A policy de RLS so permite ao anonimo inserir inscricoes SEM check-in
// (`check_in_realizado is not true`), o que e o comportamento correto: quem
// confirma entrada e a equipe, pelo painel. Os check-ins simulados saem num
// arquivo .sql separado, para rodar com privilegio de admin.
const registros = Array.from({ length: total }, () => ({
  nome: `${pick(NOMES)} ${pick(SOBRENOMES)}`,
  telefone: `(38) 9${int(1000, 9999)}-${int(1000, 9999)}`,
  experiencias: sortearExperiencias(),
  criado_em: sortearData(),
}));

// Insere em lotes para nao estourar limite de payload.
// Sem `.select()`: RETURNING exige permissao de leitura, que o anon nao tem.
let inseridos = 0;
for (let i = 0; i < registros.length; i += 50) {
  const lote = registros.slice(i, i + 50);
  const { error } = await supabase.from('visitantes').insert(lote);
  if (error) {
    console.error(`\nERRO no lote ${i / 50 + 1}: ${error.code} — ${error.message}`);
    if (error.code === '42501') {
      console.error('\nRLS bloqueou a escrita. Rode supabase/schema.sql no SQL Editor primeiro.');
    }
    process.exit(1);
  }
  inseridos += lote.length;
  process.stdout.write(`\rInseridos: ${inseridos}/${total}`);
}

console.log(`\n\n${inseridos} visitantes inseridos.`);

// Resumo do que foi gravado, para conferir contra o dashboard.
const contagem = Object.fromEntries(EXPERIENCIAS.map(e => [e, 0]));
registros.forEach(r => r.experiencias.forEach(e => contagem[e]++));
const totalSelecoes = Object.values(contagem).reduce((a, b) => a + b, 0);

console.log('\n--- Confira estes números no dashboard ---');
console.log(`Inscritos           : ${inseridos}`);
console.log(`Aguardando check-in : ${inseridos}  (nenhum check-in ainda)`);
console.log(`Total de seleções   : ${totalSelecoes}`);
console.log(`Atrações/visitante  : ${(totalSelecoes / inseridos).toFixed(2)}`);
console.log('Seleções por experiência:');
EXPERIENCIAS.forEach(e => console.log(`  ${e.padEnd(8)} ${contagem[e]}`));

// Gera o SQL que simula os check-ins (precisa rodar como admin no SQL Editor).
const sqlPath = 'supabase/simular_checkins.sql';
writeFileSync(sqlPath, `-- Marca ~65% dos visitantes como tendo feito check-in, com um atraso
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
`);

console.log(`\nPara simular check-ins, rode ${sqlPath} no SQL Editor.`);
