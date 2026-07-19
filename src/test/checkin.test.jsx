import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const VISITANTES = [
  { id: 1, nome: 'Ana Souza',  telefone: '(38) 90000-0001', experiencias: ['vr'],  check_in_realizado: false, horario_check_in: null, criado_em: new Date().toISOString() },
  { id: 2, nome: 'Bruno Lima', telefone: '(38) 90000-0002', experiencias: ['ps5'], check_in_realizado: false, horario_check_in: null, criado_em: new Date().toISOString() },
];

const updateSpy = vi.fn(() => Promise.resolve({ error: null }));

// Conta quantas vezes a tabela é relida. Cada releitura troca o corpo da tabela
// e é o que o usuário enxerga como piscada.
const refetchSpy = vi.fn();
let realtimeCallback = null;

vi.mock('../supabaseClient', () => {
  const resultado = () => {
    refetchSpy();
    return Promise.resolve({ data: VISITANTES, error: null });
  };

  return {
    isSupabaseConfigured: true,
    supabase: {
      from: () => ({
        select: () => ({
          order: () => ({ limit: resultado }),
          ilike: () => ({ order: () => ({ limit: resultado }) }),
        }),
        update: (...args) => ({ eq: () => updateSpy(...args) }),
      }),
      channel: () => ({
        on: (_evt, _cfg, cb) => {
          realtimeCallback = cb;
          return { subscribe: () => ({}) };
        },
      }),
      removeChannel: () => {},
    },
  };
});

import StaffCheckIn from '../pages/StaffCheckIn';

const LOADING_TEXT = 'Carregando dados do Supabase...';

const montar = async () => {
  const utils = render(<StaffCheckIn />);
  await waitFor(() => expect(screen.queryByText(LOADING_TEXT)).not.toBeInTheDocument());
  refetchSpy.mockClear();
  return utils;
};

beforeEach(() => {
  updateSpy.mockClear();
  refetchSpy.mockClear();
  realtimeCallback = null;
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('StaffCheckIn — check-in sem piscar', () => {
  it('mostra o carregamento apenas na primeira renderização', () => {
    render(<StaffCheckIn />);
    expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
  });

  it('o check-in não dispara releitura da tabela', async () => {
    const user = userEvent.setup();
    await montar();

    // Regressão: `handleCheckIn` chamava `loadData()` ao final, o que relia a
    // tabela e trocava o corpo dela pelo spinner — a primeira piscada.
    await user.click(screen.getAllByRole('button', { name: /dar entrada/i })[0]);
    await act(async () => { await Promise.resolve(); });

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(refetchSpy).not.toHaveBeenCalled();
  });

  it('a recarga do Realtime é silenciosa (não mostra spinner)', async () => {
    await montar();

    // Segunda origem da piscada: o UPDATE emite o evento Realtime, que também
    // chamava `loadData()` — por isso o usuário via DUAS piscadas por check-in.
    expect(realtimeCallback).toBeTypeOf('function');
    await act(async () => {
      realtimeCallback({ eventType: 'UPDATE' });
    });

    // A releitura acontece (para reconciliar), mas sem estado de carregamento.
    expect(refetchSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(LOADING_TEXT)).not.toBeInTheDocument();
  });

  it('marca a linha como confirmada imediatamente (update otimista)', async () => {
    const user = userEvent.setup();
    await montar();

    expect(screen.queryByText('Confirmado')).not.toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /dar entrada/i })[0]);

    expect(screen.getByText('Confirmado')).toBeInTheDocument();
  });

  it('desfaz o check-in otimista se a gravação falhar', async () => {
    const user = userEvent.setup();
    updateSpy.mockResolvedValueOnce({ error: { message: 'sem permissao' } });

    await montar();
    await user.click(screen.getAllByRole('button', { name: /dar entrada/i })[0]);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/não foi possível registrar/i);
    });
    expect(screen.queryByText('Confirmado')).not.toBeInTheDocument();
  });
});
