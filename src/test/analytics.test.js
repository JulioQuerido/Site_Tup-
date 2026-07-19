import { describe, it, expect } from 'vitest';
import {
  summarize,
  byExperience,
  byDay,
  byHour,
  byBasketSize,
  medianCheckInDelay,
  peakHour,
  EXPERIENCE_COLORS,
} from '../utils/analytics';

const AGORA = new Date('2026-07-18T20:00:00.000Z');

const visitante = (over = {}) => ({
  id: Math.random(),
  name: 'Teste',
  whatsapp: '1',
  experiences: ['vr'],
  check_in_realizado: false,
  horario_check_in: null,
  created_at: AGORA.toISOString(),
  ...over,
});

describe('summarize', () => {
  it('não infla os totais com números de mockup', () => {
    // Regressão: o dashboard somava 1402 "atendidos" e 340/240/380/180 por
    // atração aos dados reais, reportando números que não existiam no banco.
    const s = summarize([visitante(), visitante()], AGORA);
    expect(s.total).toBe(2);
    expect(s.porExperiencia.find(e => e.key === 'vr').inscritos).toBe(2);
    expect(s.porExperiencia.find(e => e.key === 'ps5').inscritos).toBe(0);
  });

  it('devolve zeros para lista vazia sem dividir por zero', () => {
    const s = summarize([], AGORA);
    expect(s).toMatchObject({ total: 0, checkIns: 0, aguardando: 0, taxaCheckIn: 0, mediaExperiencias: 0 });
    expect(s.medianaCheckInMin).toBeNull();
  });

  it('calcula check-ins, pendentes e taxa', () => {
    const s = summarize(
      [
        visitante({ check_in_realizado: true }),
        visitante({ check_in_realizado: true }),
        visitante(),
        visitante(),
      ],
      AGORA
    );
    expect(s.checkIns).toBe(2);
    expect(s.aguardando).toBe(2);
    expect(s.taxaCheckIn).toBe(50);
  });

  it('calcula a média de atrações por visitante', () => {
    const s = summarize(
      [visitante({ experiences: ['vr', 'ps5'] }), visitante({ experiences: ['manga'] })],
      AGORA
    );
    expect(s.totalSelecoes).toBe(3);
    expect(s.mediaExperiencias).toBe(1.5);
  });
});

describe('byExperience', () => {
  it('conta inscritos e check-ins por atração', () => {
    const rows = byExperience([
      visitante({ experiences: ['vr', 'ps5'], check_in_realizado: true }),
      visitante({ experiences: ['vr'] }),
    ]);

    const vr = rows.find(r => r.key === 'vr');
    expect(vr.inscritos).toBe(2);
    expect(vr.checkIns).toBe(1);
    expect(vr.taxaCheckIn).toBe(50);
  });

  it('ignora chaves desconhecidas e devolve sempre as 4 atrações', () => {
    const rows = byExperience([visitante({ experiences: ['xpto'] })]);
    expect(rows).toHaveLength(4);
    expect(rows.every(r => r.inscritos === 0)).toBe(true);
  });

  it('atribui uma cor fixa por atração, não por posição', () => {
    const rows = byExperience([visitante()]);
    rows.forEach(r => expect(r.color).toBe(EXPERIENCE_COLORS[r.key]));
  });

  it('taxa é 0 quando não há inscritos, sem NaN', () => {
    const rows = byExperience([]);
    expect(rows.every(r => r.taxaCheckIn === 0)).toBe(true);
  });
});

describe('byDay', () => {
  it('devolve exatamente 7 dias, incluindo os vazios', () => {
    const series = byDay([visitante()], 7, AGORA);
    expect(series).toHaveLength(7);
    expect(series.at(-1).inscritos).toBe(1);
    expect(series[0].inscritos).toBe(0);
  });

  it('descarta registros fora da janela', () => {
    const antigo = new Date(AGORA);
    antigo.setDate(antigo.getDate() - 30);
    const series = byDay([visitante({ created_at: antigo.toISOString() })], 7, AGORA);
    expect(series.reduce((a, b) => a + b.inscritos, 0)).toBe(0);
  });

  it('ignora registros sem data', () => {
    expect(() => byDay([visitante({ created_at: null })], 7, AGORA)).not.toThrow();
  });
});

describe('byHour', () => {
  it('cobre as 24 horas', () => {
    expect(byHour([])).toHaveLength(24);
  });

  it('agrupa pela hora local do registro', () => {
    const d = new Date('2026-07-18T14:30:00');
    const series = byHour([visitante({ created_at: d.toISOString() })]);
    expect(series[14].inscritos).toBe(1);
  });
});

describe('byBasketSize', () => {
  it('conta visitantes por quantidade de atrações escolhidas', () => {
    const rows = byBasketSize([
      visitante({ experiences: ['vr'] }),
      visitante({ experiences: ['vr', 'ps5'] }),
      visitante({ experiences: ['vr', 'ps5', 'manga'] }),
    ]);
    expect(rows.find(r => r.size === 1).visitantes).toBe(1);
    expect(rows.find(r => r.size === 2).visitantes).toBe(1);
    expect(rows.find(r => r.size === 4).visitantes).toBe(0);
  });
});

describe('medianCheckInDelay', () => {
  it('calcula a mediana em minutos', () => {
    const base = new Date('2026-07-18T10:00:00.000Z');
    const comAtraso = (min) =>
      visitante({
        check_in_realizado: true,
        created_at: base.toISOString(),
        horario_check_in: new Date(base.getTime() + min * 60000).toISOString(),
      });

    expect(medianCheckInDelay([comAtraso(10), comAtraso(20), comAtraso(60)])).toBe(20);
  });

  it('devolve null quando ninguém fez check-in', () => {
    expect(medianCheckInDelay([visitante()])).toBeNull();
  });

  it('descarta intervalos negativos', () => {
    const base = new Date('2026-07-18T10:00:00.000Z');
    const invalido = visitante({
      check_in_realizado: true,
      created_at: base.toISOString(),
      horario_check_in: new Date(base.getTime() - 60000).toISOString(),
    });
    expect(medianCheckInDelay([invalido])).toBeNull();
  });
});

describe('peakHour', () => {
  it('devolve null quando não há movimento', () => {
    expect(peakHour(byHour([]))).toBeNull();
  });

  it('encontra a hora de maior volume', () => {
    const d = (h) => new Date(`2026-07-18T${String(h).padStart(2, '0')}:00:00`).toISOString();
    const series = byHour([
      visitante({ created_at: d(15) }),
      visitante({ created_at: d(15) }),
      visitante({ created_at: d(9) }),
    ]);
    expect(peakHour(series).hour).toBe(15);
    expect(peakHour(series).inscritos).toBe(2);
  });
});
