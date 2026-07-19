import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addBooking,
  getBookings,
  checkInBooking,
  undoCheckInBooking,
  normalizeVisitor,
  escapeLikePattern,
} from '../utils/storage';

beforeEach(() => localStorage.clear());

describe('escapeLikePattern', () => {
  it('escapa curingas para que sejam buscados literalmente', () => {
    expect(escapeLikePattern('100%')).toBe('100\\%');
    expect(escapeLikePattern('a_b')).toBe('a\\_b');
    expect(escapeLikePattern('c\\d')).toBe('c\\\\d');
  });

  it('deixa texto comum intacto', () => {
    expect(escapeLikePattern('Gabriel Silva')).toBe('Gabriel Silva');
  });
});

describe('normalizeVisitor', () => {
  it('mapeia as colunas em português vindas do Supabase', () => {
    const v = normalizeVisitor({
      id: 7,
      nome: 'Ana Souza',
      telefone: '(38) 99999-0000',
      experiencias: ['vr', 'ps5'],
      check_in_realizado: true,
      horario_check_in: '2026-07-18T12:00:00.000Z',
      criado_em: '2026-07-18T11:00:00.000Z',
    });

    expect(v).toMatchObject({
      id: 7,
      name: 'Ana Souza',
      whatsapp: '(38) 99999-0000',
      experiences: ['vr', 'ps5'],
      check_in_realizado: true,
      created_at: '2026-07-18T11:00:00.000Z',
    });
  });

  it('aceita o formato local em inglês', () => {
    const v = normalizeVisitor({ id: 'TUPA-1', name: 'Bruno Lima', whatsapp: '123', experiences: ['vr'] });
    expect(v.name).toBe('Bruno Lima');
    expect(v.experiences).toEqual(['vr']);
    expect(v.check_in_realizado).toBe(false);
  });

  it('aceita experiências como string separada por vírgula', () => {
    expect(normalizeVisitor({ experiencias: 'vr, ps5' }).experiences).toEqual(['vr', 'ps5']);
  });

  it('devolve array vazio quando não há experiências', () => {
    expect(normalizeVisitor({ nome: 'X' }).experiences).toEqual([]);
    expect(normalizeVisitor(null)).toBeNull();
  });
});

describe('getBookings', () => {
  it('devolve lista vazia quando o localStorage tem JSON inválido', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem('tupa_bookings_initialized', 'true');
    localStorage.setItem('tupa_bookings', '{ isso nao e json');
    expect(getBookings()).toEqual([]);
  });

  it('devolve lista vazia quando o valor armazenado não é um array', () => {
    localStorage.setItem('tupa_bookings_initialized', 'true');
    localStorage.setItem('tupa_bookings', '{"foo":1}');
    expect(getBookings()).toEqual([]);
  });
});

describe('addBooking', () => {
  it('insere no topo da lista, sem check-in', () => {
    const booking = addBooking('Ana Souza', '(38) 99999-0000', ['vr']);
    const stored = getBookings();
    expect(stored[0]).toMatchObject({ id: booking.id, name: 'Ana Souza' });
    expect(stored[0].check_in_realizado).toBe(false);
    expect(stored[0].horario_check_in).toBeNull();
  });
});

describe('checkInBooking / undoCheckInBooking', () => {
  it('marca apenas o agendamento correspondente', () => {
    localStorage.setItem('tupa_bookings_initialized', 'true');
    localStorage.setItem('tupa_bookings', '[]');
    const a = addBooking('Ana Souza', '1', ['vr']);
    addBooking('Bruno Lima', '2', ['ps5']);

    checkInBooking(a.id, '2026-07-18T12:00:00.000Z');

    const stored = getBookings();
    expect(stored.find(b => b.id === a.id).check_in_realizado).toBe(true);
    expect(stored.filter(b => b.check_in_realizado)).toHaveLength(1);
  });

  it('desfaz o check-in', () => {
    localStorage.setItem('tupa_bookings_initialized', 'true');
    localStorage.setItem('tupa_bookings', '[]');
    const a = addBooking('Ana Souza', '1', ['vr']);

    checkInBooking(a.id);
    undoCheckInBooking(a.id);

    const stored = getBookings().find(b => b.id === a.id);
    expect(stored.check_in_realizado).toBe(false);
    expect(stored.horario_check_in).toBeNull();
  });
});
