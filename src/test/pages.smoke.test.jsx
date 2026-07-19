import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Todas as chamadas ao Supabase falham: exercita os caminhos de fallback local,
// que sao os mais propensos a passar despercebidos.
vi.mock('../supabaseClient', () => {
  const rejection = () => Promise.reject(new Error('offline'));
  const builder = {
    select: () => builder,
    eq: () => builder,
    ilike: () => builder,
    order: () => builder,
    limit: () => rejection(),
    insert: () => builder,
    update: () => rejection(),
    then: (resolve, reject) => rejection().then(resolve, reject),
  };

  return {
    isSupabaseConfigured: false,
    supabase: {
      from: () => builder,
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'offline' } }),
        updateUser: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({}),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
      removeChannel: () => {},
    },
  };
});

import AdminLogin from '../pages/AdminLogin';
import ChangePassword from '../pages/ChangePassword';
import StaffCheckIn from '../pages/StaffCheckIn';
import ChampionshipManager from '../pages/ChampionshipManager';
import StandBooking from '../pages/StandBooking';
import MetricsDashboard from '../pages/MetricsDashboard';
import ChampionshipPortal from '../pages/ChampionshipPortal';

const pages = [
  ['AdminLogin', AdminLogin],
  ['ChangePassword', ChangePassword],
  ['StaffCheckIn', StaffCheckIn],
  ['ChampionshipManager', ChampionshipManager],
  ['StandBooking', StandBooking],
  ['MetricsDashboard', MetricsDashboard],
  ['ChampionshipPortal', ChampionshipPortal],
];

describe('smoke: todas as páginas renderizam sem lançar', () => {
  beforeEach(() => {
    // Silencia os console.warn esperados do caminho de fallback.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it.each(pages)('%s renderiza', async (_name, Page) => {
    expect(() => render(<Page />)).not.toThrow();
  });
});

describe('StaffCheckIn', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('lista os visitantes vindos do fallback local', async () => {
    render(<StaffCheckIn />);

    // Regressao do bug em que a tabela referenciava uma variavel inexistente
    // (`filteredVisitors`), quebrando a pagina inteira em runtime.
    await waitFor(() => {
      expect(screen.getByText('Check-in de Participantes')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText('Carregando dados do Supabase...')).not.toBeInTheDocument();
    });
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });
});
