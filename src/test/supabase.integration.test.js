import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

/**
 * Testes de integração contra o banco REAL.
 *
 * Ficam desligados por padrão: eles gravam de verdade na tabela `visitantes` e
 * o papel anônimo não tem permissão de apagar o que inseriu (por design), então
 * cada execução deixaria lixo. Para rodar:
 *
 *   RUN_DB_TESTS=1 npm test
 *
 * O que estes testes verificam é a POSTURA DE SEGURANÇA, não a funcionalidade:
 * um visitante anônimo pode se inscrever e não pode fazer mais nada. A versão
 * anterior deste arquivo afirmava o contrário — que o anônimo conseguia ler,
 * atualizar e apagar — e passava justamente porque o RLS estava desprotegido.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  url && anonKey && !url.includes('your-project-id') && !anonKey.includes('your-')
);

const habilitado = process.env.RUN_DB_TESTS === '1' && isConfigured;
const suite = habilitado ? describe : describe.skip;

const RLS_VIOLATION = '42501';

suite('Supabase — contrato de segurança (banco real)', () => {
  let supabase;

  beforeAll(() => {
    supabase = createClient(url, anonKey);
  });

  it('as chaves estão configuradas', () => {
    expect(isConfigured).toBe(true);
  });

  it('anônimo consegue se inscrever', async () => {
    const { error } = await supabase.from('visitantes').insert([{
      nome: 'Visitante Teste Integracao',
      telefone: '(38) 99999-9999',
      experiencias: ['vr', 'ps5'],
    }]);

    expect(error).toBeNull();
  });

  it('anônimo NÃO consegue ler a lista de inscritos', async () => {
    // A tabela tem registros (o teste acima insere), mas o RLS filtra tudo.
    // Em SELECT o Postgres não devolve erro: apenas não retorna linhas.
    const { data, error } = await supabase.from('visitantes').select('*').limit(10);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('anônimo NÃO consegue forjar um check-in na inscrição', async () => {
    const { error } = await supabase.from('visitantes').insert([{
      nome: 'Forjado',
      telefone: '(38) 90000-0000',
      experiencias: ['vr'],
      check_in_realizado: true,
    }]);

    expect(error?.code).toBe(RLS_VIOLATION);
  });

  it('anônimo NÃO consegue atualizar registros', async () => {
    const { error, count } = await supabase
      .from('visitantes')
      .update({ check_in_realizado: true }, { count: 'exact' })
      .eq('nome', 'Visitante Teste Integracao');

    // Sem policy de UPDATE o RLS não deixa nenhuma linha ser alcançada.
    expect(error === null ? count : 0).toBe(0);
  });

  it('anônimo NÃO consegue apagar registros', async () => {
    const { error, count } = await supabase
      .from('visitantes')
      .delete({ count: 'exact' })
      .eq('nome', 'Visitante Teste Integracao');

    expect(error === null ? count : 0).toBe(0);
  });
});
