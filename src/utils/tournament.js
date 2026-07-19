/**
 * Campeonatos — motor de chaveamento e persistência local.
 *
 * O módulo roda sem backend: inscrições, capacidade e o estado do chaveamento
 * ficam em localStorage. Quando for para produção, troque a camada de
 * persistência por chamadas à tabela `participantes_campeonato`; o motor de
 * chaveamento (buildBracket / advanceWinner / assignPlayer) é puro e continua
 * valendo.
 */
const ENTRIES_KEY = 'tupa_tournament_entries';
const CAPACITY_KEY = 'tupa_tournament_capacity';
const BRACKET_KEY = 'tupa_tournament_brackets';

/**
 * Fonte única dos nomes de modalidade. Portal público e painel do admin leem
 * daqui: um nome divergente faria a inscrição cair num jogo que o chaveamento
 * não lista, e o inscrito sumiria.
 */
export const GAMES = [
  'Street Fighter 6',
  'Tekken 8',
  'Naruto Ultimate Ninja Storm',
  'Dragon Ball FighterZ',
  'EA Sports FC 25',
];

/** Rótulos curtos para telas estreitas. */
export const GAME_SHORT = {
  'Street Fighter 6': 'SF6',
  'Tekken 8': 'Tekken 8',
  'Naruto Ultimate Ninja Storm': 'Naruto',
  'Dragon Ball FighterZ': 'DBFZ',
  'EA Sports FC 25': 'EA FC 25',
};

/**
 * Limites de inscrição aceitos: qualquer número PAR de 2 a 32.
 *
 * A chave em si sempre tem tamanho potência de 2 — com 6 jogadores, três
 * partidas na primeira fase dariam três vencedores, e três não formam a fase
 * seguinte. Então montamos a chave no próximo tamanho válido (8) e damos BYE
 * a quem sobra, como em torneio de verdade. `bracketSize()` faz essa conta.
 */
export const CAPACITIES = Array.from({ length: 16 }, (_, i) => (i + 1) * 2);
export const DEFAULT_CAPACITY = 8;
export const MIN_CAPACITY = 2;
export const MAX_CAPACITY = 32;

export const isValidCapacity = (n) =>
  Number.isInteger(n) && n >= MIN_CAPACITY && n <= MAX_CAPACITY && n % 2 === 0;

/** Tamanho real da chave: a menor potência de 2 que comporta a capacidade. */
export const bracketSize = (capacity) => 2 ** Math.ceil(Math.log2(capacity));

/** Quantos BYEs a chave terá para a capacidade informada. */
export const byeCount = (capacity) => bracketSize(capacity) - capacity;

export const EMPTY_SLOT = null;
export const BYE = 'BYE';

// ---------------------------------------------------------------------------
// Persistência
// ---------------------------------------------------------------------------

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    return parsed ?? fallback;
  } catch (e) {
    console.warn(`Valor inválido em localStorage["${key}"], usando padrão.`, e);
    return fallback;
  }
}

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// ---------------------------------------------------------------------------
// Inscrições
// ---------------------------------------------------------------------------

export function getTournamentEntries(game) {
  const entries = read(ENTRIES_KEY, []);
  const lista = Array.isArray(entries) ? entries : [];
  return game ? lista.filter(e => e.game === game) : lista;
}

/** Capacidade máxima de inscritos para um jogo. */
export function getCapacity(game) {
  const mapa = read(CAPACITY_KEY, {});
  return mapa[game] ?? DEFAULT_CAPACITY;
}

export function setCapacity(game, capacity) {
  if (!isValidCapacity(capacity)) {
    throw new Error(
      `Capacidade inválida: ${capacity}. Use um número par entre ${MIN_CAPACITY} e ${MAX_CAPACITY}.`
    );
  }
  write(CAPACITY_KEY, { ...read(CAPACITY_KEY, {}), [game]: capacity });
  return capacity;
}

export function isFull(game) {
  return getTournamentEntries(game).length >= getCapacity(game);
}

/**
 * Registra uma inscrição. Recusa se o limite do jogo já foi atingido —
 * a checagem fica aqui e não na tela, para o portal público e o painel do
 * admin obedecerem à mesma regra.
 */
export function addTournamentEntry({ fullName, nickname, whatsapp, game }) {
  if (isFull(game)) {
    const erro = new Error(`Inscrições encerradas: o limite de ${getCapacity(game)} participantes foi atingido.`);
    erro.code = 'TOURNAMENT_FULL';
    throw erro;
  }

  const entries = getTournamentEntries();
  const entry = {
    id: `REG-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
    name: fullName,
    nickname: nickname?.trim() || fullName.split(' ')[0],
    whatsapp,
    game,
    createdAt: new Date().toISOString(),
    time: new Date().toLocaleString('pt-BR'),
  };

  write(ENTRIES_KEY, [entry, ...entries]);
  return entry;
}

export function removeTournamentEntry(id) {
  write(ENTRIES_KEY, getTournamentEntries().filter(e => e.id !== id));
}

export function clearTournamentEntries(game) {
  write(ENTRIES_KEY, game ? getTournamentEntries().filter(e => e.game !== game) : []);
}

// ---------------------------------------------------------------------------
// Motor de chaveamento (funções puras)
// ---------------------------------------------------------------------------

/** Nome da fase a partir de quantas partidas ela tem. */
export function roundName(matchCount) {
  return {
    1: 'Final',
    2: 'Semifinal',
    4: 'Quartas de Final',
    8: 'Oitavas de Final',
    16: '16-avos de Final',
  }[matchCount] ?? `Fase de ${matchCount * 2}`;
}

const makeMatch = (round, index) => ({
  id: `r${round}m${index}`,
  round,
  index,
  p1: EMPTY_SLOT,
  p2: EMPTY_SLOT,
  winner: null,
});

/**
 * Monta a estrutura de fases vazia para uma chave de `capacity` jogadores.
 * 16 jogadores => oitavas (8 partidas), quartas (4), semi (2), final (1).
 */
export function buildBracket(capacity = DEFAULT_CAPACITY) {
  if (!isValidCapacity(capacity)) {
    throw new Error(`Capacidade inválida: ${capacity}.`);
  }

  const rounds = [];
  let matchCount = bracketSize(capacity) / 2;
  let round = 0;

  while (matchCount >= 1) {
    rounds.push({
      name: roundName(matchCount),
      matches: Array.from({ length: matchCount }, (_, i) => makeMatch(round, i)),
    });
    matchCount /= 2;
    round += 1;
  }

  return { capacity, rounds };
}

/** Para onde vai o vencedor de uma partida. `null` na final. */
export function nextSlot(bracket, round, index) {
  if (round >= bracket.rounds.length - 1) return null;
  return {
    round: round + 1,
    index: Math.floor(index / 2),
    position: index % 2 === 0 ? 'p1' : 'p2',
  };
}

// Clona apenas o necessário — as partidas não tocadas seguem sendo os mesmos
// objetos, o que mantém as comparações de referência do React baratas.
const cloneBracket = (bracket) => ({
  ...bracket,
  rounds: bracket.rounds.map(r => ({ ...r, matches: [...r.matches] })),
});

function setMatch(draft, round, index, patch) {
  const atual = draft.rounds[round].matches[index];
  draft.rounds[round].matches[index] = { ...atual, ...patch };
}

/**
 * Limpa a propagação de um vencedor que deixou de valer — sem isso, trocar o
 * resultado de uma partida deixaria o nome antigo preso nas fases seguintes.
 */
function clearDownstream(draft, round, index, nomeAntigo) {
  if (!nomeAntigo) return;

  let alvo = nextSlot(draft, round, index);
  let nome = nomeAntigo;

  while (alvo) {
    const partida = draft.rounds[alvo.round].matches[alvo.index];
    if (partida[alvo.position] !== nome) break;

    const venceu = partida.winner === nome;
    setMatch(draft, alvo.round, alvo.index, {
      [alvo.position]: EMPTY_SLOT,
      winner: venceu ? null : partida.winner,
    });

    if (!venceu) break;
    alvo = nextSlot(draft, alvo.round, alvo.index);
  }
}

/** Marca o vencedor de uma partida e o promove para a fase seguinte. */
export function advanceWinner(bracket, round, index, nome) {
  if (!nome || nome === BYE) return bracket;

  const partida = bracket.rounds[round]?.matches[index];
  if (!partida) return bracket;
  if (partida.p1 !== nome && partida.p2 !== nome) return bracket;
  if (partida.winner === nome) return bracket;

  const draft = cloneBracket(bracket);

  clearDownstream(draft, round, index, partida.winner);
  setMatch(draft, round, index, { winner: nome });

  const destino = nextSlot(draft, round, index);
  if (destino) {
    setMatch(draft, destino.round, destino.index, { [destino.position]: nome });
  }

  return draft;
}

/**
 * Coloca (ou remove, com `nome = null`) um jogador num slot.
 *
 * Só a PRIMEIRA fase aceita atribuição manual: as demais são preenchidas pelos
 * vencedores. Tentar editar quartas/semi/final é ignorado de propósito.
 */
export function assignPlayer(bracket, round, index, position, nome) {
  if (round !== 0) return bracket;

  const partida = bracket.rounds[0]?.matches[index];
  if (!partida) return bracket;

  const draft = cloneBracket(bracket);
  const anterior = partida[position];

  // Se o jogador estava em outro slot da primeira fase, tira ele de lá.
  if (nome) {
    draft.rounds[0].matches.forEach((m, i) => {
      ['p1', 'p2'].forEach(pos => {
        if (m[pos] === nome && !(i === index && pos === position)) {
          setMatch(draft, 0, i, { [pos]: EMPTY_SLOT });
          if (draft.rounds[0].matches[i].winner === nome) {
            clearDownstream(draft, 0, i, nome);
            setMatch(draft, 0, i, { winner: null });
          }
        }
      });
    });
  }

  // Trocar quem ocupa o slot invalida um resultado que dependia dele.
  if (partida.winner === anterior) {
    clearDownstream(draft, 0, index, anterior);
    setMatch(draft, 0, index, { winner: null });
  }

  setMatch(draft, 0, index, { [position]: nome ?? EMPTY_SLOT });
  return draft;
}

/** Embaralha (Fisher-Yates) sem alterar o array original. */
export function shuffle(lista, rng = Math.random) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Distribui os jogadores pela primeira fase e resolve os BYEs.
 * Quem cai numa partida sem adversário avança automaticamente.
 */
export function seedBracket(players, capacity = DEFAULT_CAPACITY, rng = Math.random) {
  let bracket = buildBracket(capacity);
  const sorteados = shuffle(players, rng).slice(0, capacity);
  const partidas = bracket.rounds[0].matches.length;

  // Os BYEs vão para as primeiras partidas: esses jogadores avançam sozinhos,
  // em vez de existirem partidas totalmente vazias no meio da chave.
  const byes = Math.max(0, bracketSize(capacity) - sorteados.length);

  const draft = cloneBracket(bracket);
  let idx = 0;

  for (let i = 0; i < partidas; i++) {
    const a = sorteados[idx++];
    const b = i < byes ? null : sorteados[idx++];

    setMatch(draft, 0, i, {
      p1: a ? a.nickname : EMPTY_SLOT,
      p2: b ? b.nickname : (a ? BYE : EMPTY_SLOT),
    });
  }
  bracket = draft;

  // BYE: avanca automatico. Feito depois do preenchimento para a propagacao
  // usar o mesmo caminho de advanceWinner.
  bracket.rounds[0].matches.forEach((m, i) => {
    if (m.p1 && m.p2 === BYE) {
      bracket = advanceWinner(bracket, 0, i, m.p1);
    }
  });

  return bracket;
}

/** Campeão, se a final já foi decidida. */
export function getChampion(bracket) {
  return bracket.rounds[bracket.rounds.length - 1]?.matches[0]?.winner ?? null;
}

/** Nomes já posicionados na primeira fase. */
export function assignedNames(bracket) {
  const nomes = new Set();
  bracket.rounds[0]?.matches.forEach(m => {
    if (m.p1 && m.p1 !== BYE) nomes.add(m.p1);
    if (m.p2 && m.p2 !== BYE) nomes.add(m.p2);
  });
  return nomes;
}

// ---------------------------------------------------------------------------
// Persistência do chaveamento
// ---------------------------------------------------------------------------

/** Descarta chaves salvas com formato antigo ou capacidade divergente. */
function isValidBracket(bracket, capacity) {
  return Boolean(
    bracket &&
    Array.isArray(bracket.rounds) &&
    bracket.rounds.length > 0 &&
    bracket.capacity === capacity &&
    bracket.rounds[0]?.matches?.length === bracketSize(capacity) / 2
  );
}

export function loadBracket(game, capacity = getCapacity(game)) {
  const salvos = read(BRACKET_KEY, {});
  const bracket = salvos[game];
  return isValidBracket(bracket, capacity) ? bracket : buildBracket(capacity);
}

export function saveBracket(game, bracket) {
  write(BRACKET_KEY, { ...read(BRACKET_KEY, {}), [game]: bracket });
  return bracket;
}

export function clearBracket(game) {
  const salvos = read(BRACKET_KEY, {});
  delete salvos[game];
  write(BRACKET_KEY, salvos);
}

// ---------------------------------------------------------------------------
// Dados de teste
// ---------------------------------------------------------------------------

const NICKS = [
  'Dark_Slayer', 'ThunderBolt', 'Zenith_Pro', 'Vortex_X', 'SonicWave', 'Ghost_R',
  'ShadowStep', 'FireStrike', 'NeonBlade', 'IronFang', 'PixelRage', 'StormRider',
  'VoidWalker', 'CrimsonAce', 'FrostByte', 'ThunderClap',
];

const NOMES = [
  'Ricardo Silva', 'Marcos André', 'Fábio Costa', 'Lucas Moura', 'Guilherme Santos',
  'Rodrigo Lima', 'Daniel Alves', 'Rafael Souza', 'Bruno Carvalho', 'Thiago Nunes',
  'Vinícius Rocha', 'André Martins', 'Felipe Ramos', 'Gustavo Pinto', 'Leandro Dias',
  'Murilo Farias',
];

/** Insere N jogadores de teste no jogo indicado. */
export function seedTestPlayers(game, quantidade = 16) {
  const entries = getTournamentEntries();
  const novos = Array.from({ length: quantidade }, (_, i) => ({
    id: `TEST-${game}-${i}`,
    name: NOMES[i % NOMES.length],
    nickname: NICKS[i % NICKS.length],
    whatsapp: `(38) 9${1000 + i}-${2000 + i}`,
    game,
    createdAt: new Date().toISOString(),
    time: new Date().toLocaleString('pt-BR'),
  }));

  write(ENTRIES_KEY, [...novos, ...entries.filter(e => e.game !== game)]);
  return novos;
}
