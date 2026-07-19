import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  buildBracket,
  seedBracket,
  advanceWinner,
  assignPlayer,
  nextSlot,
  roundName,
  getChampion,
  assignedNames,
  shuffle,
  addTournamentEntry,
  getTournamentEntries,
  getCapacity,
  setCapacity,
  isFull,
  seedTestPlayers,
  saveBracket,
  loadBracket,
  clearBracket,
  CAPACITIES,
  bracketSize,
  byeCount,
  BYE,
} from '../utils/tournament';

const JOGO = 'Street Fighter 6';
const jogadores = (n) =>
  Array.from({ length: n }, (_, i) => ({ id: String(i), nickname: `P${i + 1}`, name: `Jogador ${i + 1}` }));

beforeEach(() => localStorage.clear());

describe('buildBracket', () => {
  it.each([
    [2, 1, ['Final']],
    [4, 2, ['Semifinal', 'Final']],
    [8, 3, ['Quartas de Final', 'Semifinal', 'Final']],
    [16, 4, ['Oitavas de Final', 'Quartas de Final', 'Semifinal', 'Final']],
  ])('capacidade %i gera %i fases', (capacity, fases, nomes) => {
    const b = buildBracket(capacity);
    expect(b.rounds).toHaveLength(fases);
    expect(b.rounds.map(r => r.name)).toEqual(nomes);
    expect(b.rounds[0].matches).toHaveLength(capacity / 2);
    expect(b.rounds.at(-1).matches).toHaveLength(1);
  });

  it('aceita capacidade par que não é potência de 2, arredondando a chave', () => {
    // 6 jogadores não formam chave fechada: 3 partidas dariam 3 vencedores.
    // A chave sobe para 8 e os 2 excedentes viram BYE.
    const b = buildBracket(6);
    expect(b.capacity).toBe(6);
    expect(b.rounds[0].matches).toHaveLength(4);
    expect(b.rounds.map(r => r.name)).toEqual(['Quartas de Final', 'Semifinal', 'Final']);
  });

  it('rejeita capacidade ímpar', () => {
    expect(() => buildBracket(7)).toThrow(/inválida/i);
  });

  it('rejeita capacidade fora do intervalo', () => {
    expect(() => buildBracket(0)).toThrow(/inválida/i);
    expect(() => buildBracket(34)).toThrow(/inválida/i);
  });

  it('começa com todos os slots vazios', () => {
    const b = buildBracket(8);
    expect(b.rounds.flatMap(r => r.matches).every(m => !m.p1 && !m.p2 && !m.winner)).toBe(true);
  });
});

describe('roundName', () => {
  it('nomeia as fases conhecidas', () => {
    expect(roundName(1)).toBe('Final');
    expect(roundName(2)).toBe('Semifinal');
    expect(roundName(8)).toBe('Oitavas de Final');
  });
});

describe('nextSlot', () => {
  it('roteia pares para o mesmo destino, em posições opostas', () => {
    const b = buildBracket(8);
    expect(nextSlot(b, 0, 0)).toEqual({ round: 1, index: 0, position: 'p1' });
    expect(nextSlot(b, 0, 1)).toEqual({ round: 1, index: 0, position: 'p2' });
    expect(nextSlot(b, 0, 2)).toEqual({ round: 1, index: 1, position: 'p1' });
  });

  it('devolve null na final', () => {
    const b = buildBracket(8);
    expect(nextSlot(b, 2, 0)).toBeNull();
  });
});

describe('seedBracket', () => {
  it('distribui 16 jogadores nas 8 partidas da primeira fase', () => {
    const b = seedBracket(jogadores(16), 16);
    const primeira = b.rounds[0].matches;
    expect(primeira).toHaveLength(8);
    expect(primeira.every(m => m.p1 && m.p2 && m.p2 !== BYE)).toBe(true);
    expect(assignedNames(b).size).toBe(16);
  });

  it('dá BYE e avança automaticamente quando o número é ímpar', () => {
    const b = seedBracket(jogadores(7), 8);
    const comBye = b.rounds[0].matches.find(m => m.p2 === BYE);

    expect(comBye).toBeDefined();
    expect(comBye.winner).toBe(comBye.p1);

    const destino = nextSlot(b, 0, comBye.index);
    expect(b.rounds[destino.round].matches[destino.index][destino.position]).toBe(comBye.p1);
  });

  it('descarta jogadores acima da capacidade', () => {
    const b = seedBracket(jogadores(20), 8);
    expect(assignedNames(b).size).toBe(8);
  });

  it('distribui BYEs no topo em vez de deixar partidas vazias', () => {
    // 6 numa chave de 8: as 2 primeiras partidas recebem BYE, as 2 últimas
    // são disputas normais. Nenhuma partida fica totalmente vazia.
    const b = seedBracket(jogadores(6), 6);
    const primeira = b.rounds[0].matches;

    expect(primeira).toHaveLength(4);
    expect(primeira.filter(m => m.p2 === BYE)).toHaveLength(2);
    expect(primeira.every(m => m.p1)).toBe(true);
    expect(assignedNames(b).size).toBe(6);
  });

  it('quem recebe BYE já aparece na fase seguinte', () => {
    const b = seedBracket(jogadores(6), 6);
    const naSegunda = b.rounds[1].matches.flatMap(m => [m.p1, m.p2]).filter(Boolean);
    expect(naSegunda).toHaveLength(2);
  });

  it('capacidade 10 monta chave de 16 com 6 BYEs', () => {
    const b = seedBracket(jogadores(10), 10);
    expect(b.rounds[0].matches).toHaveLength(8);
    expect(b.rounds[0].matches.filter(m => m.p2 === BYE)).toHaveLength(6);
    expect(assignedNames(b).size).toBe(10);
  });

  it('não altera a lista original', () => {
    const lista = jogadores(4);
    const copia = [...lista];
    seedBracket(lista, 4);
    expect(lista).toEqual(copia);
  });
});

describe('advanceWinner', () => {
  it('promove o vencedor para a fase seguinte', () => {
    let b = seedBracket(jogadores(8), 8, () => 0);
    const nome = b.rounds[0].matches[0].p1;

    b = advanceWinner(b, 0, 0, nome);

    expect(b.rounds[0].matches[0].winner).toBe(nome);
    expect(b.rounds[1].matches[0].p1).toBe(nome);
  });

  it('não muta o objeto anterior', () => {
    const antes = seedBracket(jogadores(8), 8, () => 0);
    const snapshot = JSON.parse(JSON.stringify(antes));
    advanceWinner(antes, 0, 0, antes.rounds[0].matches[0].p1);
    expect(antes).toEqual(snapshot);
  });

  it('ignora nome que não está na partida', () => {
    const b = seedBracket(jogadores(8), 8, () => 0);
    expect(advanceWinner(b, 0, 0, 'Estranho')).toBe(b);
  });

  it('ignora BYE e slot vazio', () => {
    const b = buildBracket(8);
    expect(advanceWinner(b, 0, 0, BYE)).toBe(b);
    expect(advanceWinner(b, 0, 0, null)).toBe(b);
  });

  it('trocar o vencedor limpa o nome antigo das fases seguintes', () => {
    let b = seedBracket(jogadores(8), 8, () => 0);
    const { p1, p2 } = b.rounds[0].matches[0];

    b = advanceWinner(b, 0, 0, p1);
    expect(b.rounds[1].matches[0].p1).toBe(p1);

    b = advanceWinner(b, 0, 0, p2);
    expect(b.rounds[1].matches[0].p1).toBe(p2);
  });

  it('trocar o vencedor limpa a propagação em cascata', () => {
    let b = seedBracket(jogadores(8), 8, () => 0);
    const { p1, p2 } = b.rounds[0].matches[0];

    b = advanceWinner(b, 0, 0, p1);
    b = advanceWinner(b, 0, 1, b.rounds[0].matches[1].p1);
    b = advanceWinner(b, 1, 0, p1);   // semifinal
    b = advanceWinner(b, 2, 0, p1);   // final
    expect(getChampion(b)).toBe(p1);

    // Corrige o resultado da primeira fase: o campeão não pode continuar lá.
    b = advanceWinner(b, 0, 0, p2);
    expect(getChampion(b)).toBeNull();
    expect(b.rounds[1].matches[0].winner).toBeNull();
    expect(b.rounds[1].matches[0].p1).toBe(p2);
  });
});

describe('assignPlayer', () => {
  it('coloca um jogador manualmente na primeira fase', () => {
    let b = buildBracket(8);
    b = assignPlayer(b, 0, 2, 'p1', 'Coringa');
    expect(b.rounds[0].matches[2].p1).toBe('Coringa');
  });

  it('remove o jogador ao passar null', () => {
    let b = assignPlayer(buildBracket(8), 0, 0, 'p1', 'Coringa');
    b = assignPlayer(b, 0, 0, 'p1', null);
    expect(b.rounds[0].matches[0].p1).toBeNull();
  });

  it('NÃO permite editar quartas, semi ou final', () => {
    const b = buildBracket(8);
    expect(assignPlayer(b, 1, 0, 'p1', 'Coringa')).toBe(b);
    expect(assignPlayer(b, 2, 0, 'p1', 'Coringa')).toBe(b);
  });

  it('move o jogador se ele já estava em outro slot', () => {
    let b = assignPlayer(buildBracket(8), 0, 0, 'p1', 'Coringa');
    b = assignPlayer(b, 0, 3, 'p2', 'Coringa');

    expect(b.rounds[0].matches[0].p1).toBeNull();
    expect(b.rounds[0].matches[3].p2).toBe('Coringa');
    expect(assignedNames(b).size).toBe(1);
  });

  it('invalida o resultado ao trocar quem ocupava o slot', () => {
    let b = seedBracket(jogadores(8), 8, () => 0);
    const antigo = b.rounds[0].matches[0].p1;

    b = advanceWinner(b, 0, 0, antigo);
    expect(b.rounds[1].matches[0].p1).toBe(antigo);

    b = assignPlayer(b, 0, 0, 'p1', 'Substituto');
    expect(b.rounds[0].matches[0].winner).toBeNull();
    expect(b.rounds[1].matches[0].p1).toBeNull();
  });
});

describe('capacidade e limite de inscrições', () => {
  it('usa o padrão quando nada foi configurado', () => {
    expect(getCapacity(JOGO)).toBe(8);
  });

  it('persiste a capacidade por jogo', () => {
    setCapacity(JOGO, 16);
    expect(getCapacity(JOGO)).toBe(16);
    expect(getCapacity('Tekken 8')).toBe(8);
  });

  it('aceita qualquer número par no intervalo', () => {
    expect(() => setCapacity(JOGO, 10)).not.toThrow();
    expect(getCapacity(JOGO)).toBe(10);
  });

  it('rejeita ímpar e valores fora do intervalo', () => {
    expect(() => setCapacity(JOGO, 7)).toThrow(/par/i);
    expect(() => setCapacity(JOGO, 0)).toThrow(/par/i);
    expect(() => setCapacity(JOGO, 40)).toThrow(/par/i);
  });

  it('recusa inscrição quando o limite é atingido', () => {
    setCapacity(JOGO, 2);
    addTournamentEntry({ fullName: 'A A', nickname: 'A', whatsapp: '1', game: JOGO });
    addTournamentEntry({ fullName: 'B B', nickname: 'B', whatsapp: '2', game: JOGO });

    expect(isFull(JOGO)).toBe(true);
    expect(() => addTournamentEntry({ fullName: 'C C', nickname: 'C', whatsapp: '3', game: JOGO }))
      .toThrow(/limite de 2/i);
    expect(getTournamentEntries(JOGO)).toHaveLength(2);
  });

  it('o limite é por jogo', () => {
    setCapacity(JOGO, 2);
    addTournamentEntry({ fullName: 'A A', nickname: 'A', whatsapp: '1', game: JOGO });
    addTournamentEntry({ fullName: 'B B', nickname: 'B', whatsapp: '2', game: JOGO });

    expect(() => addTournamentEntry({ fullName: 'C C', nickname: 'C', whatsapp: '3', game: 'Tekken 8' }))
      .not.toThrow();
  });
});

describe('persistência do chaveamento', () => {
  it('sobrevive a um reload (salva e recarrega)', () => {
    setCapacity(JOGO, 8);
    let b = seedBracket(jogadores(8), 8, () => 0);
    const campeao = b.rounds[0].matches[0].p1;
    b = advanceWinner(b, 0, 0, campeao);
    saveBracket(JOGO, b);

    // Regressão: o chaveamento vivia só no state do React e sumia ao recarregar.
    const recarregado = loadBracket(JOGO, 8);
    expect(recarregado.rounds[0].matches[0].winner).toBe(campeao);
    expect(recarregado.rounds[1].matches[0].p1).toBe(campeao);
  });

  it('devolve chave vazia quando não há nada salvo', () => {
    const b = loadBracket(JOGO, 8);
    expect(b.rounds[0].matches.every(m => !m.p1)).toBe(true);
  });

  it('descarta chave salva com capacidade diferente da atual', () => {
    saveBracket(JOGO, seedBracket(jogadores(8), 8, () => 0));
    const b = loadBracket(JOGO, 16);
    expect(b.capacity).toBe(16);
    expect(b.rounds[0].matches).toHaveLength(8);
    expect(b.rounds[0].matches.every(m => !m.p1)).toBe(true);
  });

  it('descarta valor corrompido sem quebrar', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem('tupa_tournament_brackets', 'nao e json');
    expect(() => loadBracket(JOGO, 8)).not.toThrow();
  });

  it('guarda chaves separadas por jogo', () => {
    saveBracket(JOGO, seedBracket(jogadores(8), 8, () => 0));
    expect(loadBracket('Tekken 8', 8).rounds[0].matches.every(m => !m.p1)).toBe(true);
  });

  it('clearBracket remove só o jogo indicado', () => {
    saveBracket(JOGO, seedBracket(jogadores(8), 8, () => 0));
    saveBracket('Tekken 8', seedBracket(jogadores(8), 8, () => 0));

    clearBracket(JOGO);

    expect(loadBracket(JOGO, 8).rounds[0].matches.every(m => !m.p1)).toBe(true);
    expect(loadBracket('Tekken 8', 8).rounds[0].matches[0].p1).toBeTruthy();
  });
});

describe('seedTestPlayers', () => {
  it('insere 16 jogadores de teste', () => {
    const novos = seedTestPlayers(JOGO, 16);
    expect(novos).toHaveLength(16);
    expect(getTournamentEntries(JOGO)).toHaveLength(16);
    expect(new Set(novos.map(p => p.nickname)).size).toBe(16);
  });

  it('substitui os inscritos do jogo, preservando os outros', () => {
    addTournamentEntry({ fullName: 'X X', nickname: 'X', whatsapp: '1', game: 'Tekken 8' });
    seedTestPlayers(JOGO, 16);

    expect(getTournamentEntries(JOGO)).toHaveLength(16);
    expect(getTournamentEntries('Tekken 8')).toHaveLength(1);
  });

  it('enche exatamente uma chave de 16', () => {
    setCapacity(JOGO, 16);
    const b = seedBracket(seedTestPlayers(JOGO, 16), 16);
    expect(assignedNames(b).size).toBe(16);
    expect(b.rounds[0].matches.every(m => m.p1 && m.p2 !== BYE)).toBe(true);
  });
});

describe('shuffle', () => {
  it('preserva todos os elementos', () => {
    const lista = jogadores(16);
    expect(shuffle(lista).map(p => p.id).sort()).toEqual(lista.map(p => p.id).sort());
  });
});

describe('CAPACITIES', () => {
  it('são todas pares e dentro do intervalo', () => {
    CAPACITIES.forEach(c => {
      expect(c % 2).toBe(0);
      expect(c).toBeGreaterThanOrEqual(2);
      expect(c).toBeLessThanOrEqual(32);
    });
  });

  it('toda capacidade da lista monta uma chave fechada', () => {
    // Cada fase precisa ter metade das partidas da anterior, até chegar em 1.
    CAPACITIES.forEach(c => {
      const b = buildBracket(c);
      b.rounds.forEach((r, i) => {
        if (i > 0) expect(r.matches.length).toBe(b.rounds[i - 1].matches.length / 2);
      });
      expect(b.rounds.at(-1).matches).toHaveLength(1);
    });
  });
});

describe('bracketSize', () => {
  it('arredonda para a próxima potência de 2', () => {
    expect(bracketSize(2)).toBe(2);
    expect(bracketSize(6)).toBe(8);
    expect(bracketSize(8)).toBe(8);
    expect(bracketSize(10)).toBe(16);
    expect(bracketSize(32)).toBe(32);
  });

  it('byeCount é a diferença', () => {
    expect(byeCount(8)).toBe(0);
    expect(byeCount(6)).toBe(2);
    expect(byeCount(10)).toBe(6);
  });
});
