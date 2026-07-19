// Camada de fallback local, usada quando o Supabase nao esta disponivel.
//
// Os contadores fixos que existiam aqui (1402 atendidos, 340 em VR, etc.)
// foram removidos: eles eram numeros do mockup somados aos dados reais, o que
// fazia o dashboard reportar valores inflados. Agora tudo que sai daqui
// corresponde a registros que existem de fato.
const SEED_DATA_KEY = 'tupa_bookings_initialized';
const BOOKINGS_KEY = 'tupa_bookings';

export const EXPERIENCE_KEYS = ['vr', 'manga', 'ps5', 'videoke'];

/**
 * Escapa curingas de LIKE/ILIKE do Postgres para que `%` e `_` digitados
 * pelo usuario sejam tratados como texto literal na busca.
 */
export function escapeLikePattern(term) {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) ?? fallback : fallback;
  } catch (e) {
    console.warn(`Valor inválido em localStorage["${key}"], usando padrão.`, e);
    return fallback;
  }
}

/**
 * Normaliza um visitante vindo do Supabase (colunas em português) ou do
 * localStorage (chaves em inglês) para uma forma única.
 */
export function normalizeVisitor(v) {
  if (!v) return null;

  const rawExps = v.experiencias ?? v.experiences;
  let experiences = [];
  if (Array.isArray(rawExps)) {
    experiences = rawExps;
  } else if (typeof rawExps === 'string') {
    experiences = rawExps.split(',').map(s => s.trim()).filter(Boolean);
  }

  return {
    id: v.id,
    name: v.nome ?? v.name ?? '',
    whatsapp: v.telefone ?? v.whatsapp ?? '',
    experiences,
    check_in_realizado: v.check_in_realizado ?? false,
    horario_check_in: v.horario_check_in ?? null,
    created_at: v.criado_em ?? v.created_at ?? null,
  };
}

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const int = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Gera dados de demonstração para quando não há banco configurado. */
export function initializeStorage() {
  if (localStorage.getItem(SEED_DATA_KEY)) return;

  const nomes = ['Gabriel', 'Lucas', 'Mariana', 'Beatriz', 'Rafael', 'Ana', 'Pedro', 'Juliana'];
  const sobrenomes = ['Silva', 'Oliveira', 'Costa', 'Santos', 'Souza', 'Lima'];
  const pesos = { vr: 0.55, manga: 0.30, ps5: 0.60, videoke: 0.25 };

  const mockBookings = Array.from({ length: 60 }, (_, i) => {
    const experiences = EXPERIENCE_KEYS.filter(e => Math.random() < pesos[e]);
    const criadoEm = new Date();
    criadoEm.setDate(criadoEm.getDate() - int(0, 6));
    criadoEm.setHours(int(10, 21), int(0, 59), 0, 0);

    const fezCheckIn = Math.random() < 0.65;

    return {
      id: `TUPA-${100000 + i}`,
      name: `${pick(nomes)} ${pick(sobrenomes)}`,
      whatsapp: `(38) 9${int(1000, 9999)}-${int(1000, 9999)}`,
      experiences: experiences.length ? experiences : [pick(EXPERIENCE_KEYS)],
      check_in_realizado: fezCheckIn,
      horario_check_in: fezCheckIn
        ? new Date(criadoEm.getTime() + int(5, 90) * 60000).toISOString()
        : null,
      created_at: criadoEm.toISOString(),
    };
  });

  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(mockBookings));
  localStorage.setItem(SEED_DATA_KEY, 'true');
}

export function getBookings() {
  initializeStorage();
  const bookings = readJSON(BOOKINGS_KEY, []);
  return Array.isArray(bookings) ? bookings : [];
}

export function saveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function addBooking(name, whatsapp, experiences) {
  const bookings = getBookings();
  const newBooking = {
    id: `TUPA-${Math.floor(100000 + Math.random() * 900000)}`,
    name,
    whatsapp,
    experiences,
    check_in_realizado: false,
    horario_check_in: null,
    created_at: new Date().toISOString(),
  };

  bookings.unshift(newBooking);
  saveBookings(bookings);
  return newBooking;
}

/** Marca um agendamento local como check-in realizado. */
export function checkInBooking(id, timestamp = new Date().toISOString()) {
  const updated = getBookings().map(b =>
    b.id === id ? { ...b, check_in_realizado: true, horario_check_in: timestamp } : b
  );
  saveBookings(updated);
  return updated;
}

/** Desfaz um check-in feito por engano. */
export function undoCheckInBooking(id) {
  const updated = getBookings().map(b =>
    b.id === id ? { ...b, check_in_realizado: false, horario_check_in: null } : b
  );
  saveBookings(updated);
  return updated;
}
