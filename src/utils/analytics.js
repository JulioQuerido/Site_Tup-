/**
 * Métricas derivadas dos visitantes.
 *
 * Todas as funções aqui são puras e operam sobre registros já normalizados por
 * `normalizeVisitor`. Nada nesta camada inventa número: se o banco tem 37
 * inscritos, o dashboard mostra 37. Os offsets fixos que existiam antes
 * (1402 atendidos, 340 em VR, fila de espera `length + 8`) foram removidos —
 * eles somavam dados de mockup aos dados reais.
 */

export const EXPERIENCE_KEYS = ['vr', 'manga', 'ps5', 'videoke'];

export const EXPERIENCE_LABELS = {
  vr: 'Realidade Virtual',
  manga: 'Oficina de Mangá',
  ps5: 'Área Gamer PS5',
  videoke: 'Videokê',
};

export const EXPERIENCE_SHORT = {
  vr: 'VR',
  manga: 'Mangá',
  ps5: 'PS5',
  videoke: 'Videokê',
};

/**
 * Paleta categórica dos gráficos.
 *
 * Validada com o script do skill `dataviz` para a superfície escura:
 * banda de luminosidade, piso de croma, separação para daltonismo
 * (pior par adjacente ΔE 39.4 em tritanopia, mínimo exigido 12) e contraste.
 * A paleta anterior eram quatro tons de azul com ΔE 4.1 — indistinguíveis
 * para deuteranopia e quase indistinguíveis para todo mundo.
 *
 * A ordem é fixa: a cor segue a experiência, nunca a posição no ranking.
 */
export const EXPERIENCE_COLORS = {
  vr: '#0ea5c4',
  ps5: '#b88310',
  videoke: '#9061d9',
  manga: '#3f8f3a',
};

const pct = (part, whole) => (whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10);

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Contagem de inscritos e check-ins por experiência, com taxa de comparecimento. */
export function byExperience(visitors) {
  const stats = Object.fromEntries(
    EXPERIENCE_KEYS.map(k => [k, { inscritos: 0, checkIns: 0 }])
  );

  visitors.forEach(v => {
    (v.experiences || []).forEach(exp => {
      if (!stats[exp]) return;
      stats[exp].inscritos += 1;
      if (v.check_in_realizado) stats[exp].checkIns += 1;
    });
  });

  return EXPERIENCE_KEYS.map(key => ({
    key,
    name: EXPERIENCE_LABELS[key],
    short: EXPERIENCE_SHORT[key],
    color: EXPERIENCE_COLORS[key],
    inscritos: stats[key].inscritos,
    checkIns: stats[key].checkIns,
    taxaCheckIn: pct(stats[key].checkIns, stats[key].inscritos),
  }));
}

/** Série diária de inscrições e check-ins nos últimos `days` dias. */
export function byDay(visitors, days = 7, now = new Date()) {
  const buckets = [];
  const base = startOfDay(now);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    buckets.push({
      date: d,
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      inscritos: 0,
      checkIns: 0,
    });
  }

  const indexOf = new Map(buckets.map((b, i) => [b.date.getTime(), i]));

  visitors.forEach(v => {
    if (!v.created_at) return;
    const key = startOfDay(v.created_at).getTime();
    const i = indexOf.get(key);
    if (i === undefined) return;
    buckets[i].inscritos += 1;
    if (v.check_in_realizado) buckets[i].checkIns += 1;
  });

  return buckets.map(({ date: _date, ...rest }) => rest);
}

/** Distribuição de inscrições por hora do dia — identifica o pico de fluxo. */
export function byHour(visitors) {
  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${String(h).padStart(2, '0')}h`,
    inscritos: 0,
  }));

  visitors.forEach(v => {
    if (!v.created_at) return;
    const h = new Date(v.created_at).getHours();
    if (Number.isNaN(h)) return;
    hours[h].inscritos += 1;
  });

  return hours;
}

/** Quantos visitantes escolheram 1, 2, 3 ou 4 experiências. */
export function byBasketSize(visitors) {
  const sizes = Object.fromEntries([1, 2, 3, 4].map(n => [n, 0]));

  visitors.forEach(v => {
    const n = (v.experiences || []).length;
    if (sizes[n] !== undefined) sizes[n] += 1;
  });

  return [1, 2, 3, 4].map(n => ({
    size: n,
    label: n === 1 ? '1 atração' : `${n} atrações`,
    visitantes: sizes[n],
  }));
}

/** Mediana, em minutos, entre a inscrição e o check-in. */
export function medianCheckInDelay(visitors) {
  const delays = visitors
    .filter(v => v.check_in_realizado && v.horario_check_in && v.created_at)
    .map(v => (new Date(v.horario_check_in) - new Date(v.created_at)) / 60000)
    .filter(m => Number.isFinite(m) && m >= 0)
    .sort((a, b) => a - b);

  if (!delays.length) return null;

  const mid = Math.floor(delays.length / 2);
  const median = delays.length % 2 ? delays[mid] : (delays[mid - 1] + delays[mid]) / 2;
  return Math.round(median);
}

/** Resumo completo consumido pelo dashboard. */
export function summarize(visitors, now = new Date()) {
  const total = visitors.length;
  const checkIns = visitors.filter(v => v.check_in_realizado).length;
  const totalSelecoes = visitors.reduce((acc, v) => acc + (v.experiences || []).length, 0);

  return {
    total,
    checkIns,
    aguardando: total - checkIns,
    taxaCheckIn: pct(checkIns, total),
    totalSelecoes,
    mediaExperiencias: total === 0 ? 0 : Math.round((totalSelecoes / total) * 100) / 100,
    medianaCheckInMin: medianCheckInDelay(visitors),
    porExperiencia: byExperience(visitors),
    porDia: byDay(visitors, 7, now),
    porHora: byHour(visitors),
    porCesta: byBasketSize(visitors),
  };
}

/** Horário com maior volume de inscrições (para o destaque no dashboard). */
export function peakHour(hourSeries) {
  const peak = hourSeries.reduce(
    (best, cur) => (cur.inscritos > best.inscritos ? cur : best),
    { inscritos: -1 }
  );
  return peak.inscritos > 0 ? peak : null;
}
