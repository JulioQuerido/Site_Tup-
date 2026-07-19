import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';

/**
 * Dataset conhecido: 10 visitantes, 6 com check-in. Contagem feita à mão:
 *
 *   vr      -> linhas 1,2,3,4,5,6,10 = 7 inscritos, 4 com check-in
 *   ps5     -> linhas 1,2,5,7,8      = 5 inscritos, 4 com check-in
 *   manga   -> linhas 3,4,9          = 3 inscritos, 2 com check-in
 *   videoke -> linhas 5,8            = 2 inscritos, 1 com check-in
 *
 *   total de seleções = 7+5+3+2 = 17  ->  média 1.70 por visitante
 *   taxa de check-in geral = 6/10 = 60%
 */
const DATASET = [
  { id: 1,  nome: 'A A', experiencias: ['vr', 'ps5'],            check_in_realizado: true },
  { id: 2,  nome: 'B B', experiencias: ['vr', 'ps5'],            check_in_realizado: true },
  { id: 3,  nome: 'C C', experiencias: ['vr', 'manga'],          check_in_realizado: true },
  { id: 4,  nome: 'D D', experiencias: ['vr', 'manga'],          check_in_realizado: true },
  { id: 5,  nome: 'E E', experiencias: ['vr', 'ps5', 'videoke'], check_in_realizado: false },
  { id: 6,  nome: 'F F', experiencias: ['vr'],                   check_in_realizado: false },
  { id: 7,  nome: 'G G', experiencias: ['ps5'],                  check_in_realizado: true },
  { id: 8,  nome: 'H H', experiencias: ['ps5', 'videoke'],       check_in_realizado: true },
  { id: 9,  nome: 'I I', experiencias: ['manga'],                check_in_realizado: false },
  { id: 10, nome: 'J J', experiencias: ['vr'],                   check_in_realizado: false },
].map(v => ({
  ...v,
  telefone: '(38) 90000-0000',
  criado_em: new Date().toISOString(),
  horario_check_in: v.check_in_realizado ? new Date(Date.now() + 1800000).toISOString() : null,
}));

vi.mock('../supabaseClient', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: DATASET, error: null }),
        }),
      }),
    }),
    channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    removeChannel: () => {},
  },
}));

import MetricsDashboard from '../pages/MetricsDashboard';

// recharts nao mede layout em jsdom; silencia o aviso de largura zero.
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

// O rótulo de um StatTile é o único com `tracking-widest`. Sem essa restrição,
// "Inscritos" também casaria com a legenda do gráfico de barras.
const tile = (label) => {
  const el = screen
    .getAllByText(label)
    .find(n => n.className?.includes?.('tracking-widest'));
  if (!el) throw new Error(`StatTile "${label}" não encontrado`);
  return el.parentElement;
};

describe('MetricsDashboard — números exibidos', () => {
  it('mostra os totais reais do banco, sem offset de mockup', async () => {
    render(<MetricsDashboard />);

    // O bug anterior somava 1402 ao total: com 10 registros, exibia 1412.
    await waitFor(() => {
      expect(within(tile('Inscritos')).getByText('10')).toBeInTheDocument();
    });

    expect(screen.queryByText('1412')).not.toBeInTheDocument();
    expect(screen.queryByText('1402')).not.toBeInTheDocument();
  });

  it('mostra check-ins e pendentes corretos', async () => {
    render(<MetricsDashboard />);

    await waitFor(() => {
      expect(within(tile('Check-ins realizados')).getByText('6')).toBeInTheDocument();
    });
    expect(within(tile('Aguardando check-in')).getByText('4')).toBeInTheDocument();
    expect(screen.getByText('60% dos inscritos compareceram')).toBeInTheDocument();
  });

  it('mostra a média de atrações por visitante', async () => {
    render(<MetricsDashboard />);

    await waitFor(() => {
      expect(within(tile('Atrações por visitante')).getByText('1.70')).toBeInTheDocument();
    });
    expect(screen.getByText('17 seleções de atração no total')).toBeInTheDocument();
  });

  it('mostra a taxa de comparecimento por atração', async () => {
    render(<MetricsDashboard />);

    // O texto "4/7" é montado por nós separados no JSX, daí o matcher por conteúdo.
    const razao = (texto) => (_content, el) =>
      el?.tagName === 'SPAN' && el.textContent.trim() === texto;

    await waitFor(() => expect(screen.getByText(razao('4/7'))).toBeInTheDocument());
    expect(screen.getByText(razao('4/5'))).toBeInTheDocument();
    expect(screen.getByText(razao('2/3'))).toBeInTheDocument();
    expect(screen.getByText(razao('1/2'))).toBeInTheDocument();
  });

  it('indica que os dados vêm do Supabase', async () => {
    render(<MetricsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Dados ao vivo do Supabase')).toBeInTheDocument();
    });
  });
});
