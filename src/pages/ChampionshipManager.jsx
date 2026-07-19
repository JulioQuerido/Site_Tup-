import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  GAMES,
  CAPACITIES,
  BYE,
  bracketSize,
  byeCount,
  getTournamentEntries,
  getCapacity,
  setCapacity,
  seedBracket,
  advanceWinner,
  assignPlayer,
  loadBracket,
  saveBracket,
  clearBracket,
  buildBracket,
  getChampion,
  assignedNames,
  seedTestPlayers,
} from '../utils/tournament';

const VAZIO = 'Aguardando...';

/* -------------------------------------------------------------------------- */
/* Barra de configuração                                                       */
/* -------------------------------------------------------------------------- */

function ConfigBar({ game, onGame, capacidade, onCapacidade, inscritos }) {
  const tamanho = bracketSize(capacidade);
  const byes = byeCount(capacidade);
  const lotado = inscritos >= capacidade;

  return (
    <section className="glass-panel rounded-lg p-4 flex flex-wrap items-end gap-x-6 gap-y-4">
      <label className="flex flex-col gap-1.5 min-w-[200px] flex-grow sm:flex-grow-0">
        <span className="font-label-sm text-[10px] uppercase tracking-widest text-outline-variant font-bold">
          Modalidade
        </span>
        <select
          value={game}
          onChange={(e) => onGame(e.target.value)}
          className="bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
        >
          {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-label-sm text-[10px] uppercase tracking-widest text-outline-variant font-bold">
          Máximo de jogadores
        </span>
        <select
          value={capacidade}
          onChange={(e) => onCapacidade(Number(e.target.value))}
          className="bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:border-primary outline-none"
        >
          {CAPACITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      {/* Só números pares: ímpar deixaria uma partida sem adversário no meio da chave */}
      <div className="flex flex-col gap-1.5">
        <span className="font-label-sm text-[10px] uppercase tracking-widest text-outline-variant font-bold">
          Chave
        </span>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/20">
          <span className="material-symbols-outlined text-primary text-[18px]">account_tree</span>
          <span className="font-body-md text-sm text-on-surface">{tamanho} vagas</span>
          {byes > 0 && (
            <span
              className="font-label-sm text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-bold"
              title={`${byes} jogador(es) avançam direto por falta de adversário`}
            >
              {byes} BYE
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 ml-auto">
        <span className="font-label-sm text-[10px] uppercase tracking-widest text-outline-variant font-bold">
          Inscritos
        </span>
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border font-bold text-sm ${
            lotado
              ? 'bg-error-container/25 border-error/40 text-error'
              : 'bg-primary/10 border-primary/30 text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {lotado ? 'block' : 'group'}
          </span>
          {inscritos}/{capacidade}
          {lotado && <span className="font-label-sm text-[10px] uppercase">lotado</span>}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Modal de seleção de jogador                                                 */
/* -------------------------------------------------------------------------- */

function PlayerModal({ jogadores, atual, posicionados, onSelect, onClose }) {
  const [busca, setBusca] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return jogadores.filter(
      p => p.nickname?.toLowerCase().includes(termo) || p.name?.toLowerCase().includes(termo)
    );
  }, [jogadores, busca]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Selecionar jogador"
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-surface-container border border-primary/25 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 border-b border-white/5 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-headline-lg text-base text-on-surface font-semibold uppercase tracking-wider">
              Definir jogador
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
              Somente a primeira fase aceita posicionamento manual.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface transition-colors"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="p-5 pb-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px] pointer-events-none">
              search
            </span>
            <input
              ref={inputRef}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por apelido ou nome..."
              className="w-full bg-surface-container-high border border-outline-variant/25 rounded-lg py-2.5 pl-11 pr-3 text-sm focus:border-primary outline-none placeholder:text-on-surface-variant/40"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar px-5 pb-5">
          <button
            onClick={() => onSelect(null)}
            className="w-full flex items-center gap-3 p-3 mb-2 rounded-lg border border-outline-variant/20 text-outline hover:border-error/40 hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">backspace</span>
            <span className="font-label-sm text-xs uppercase font-bold tracking-wider">Deixar vazio</span>
          </button>

          {filtrados.length === 0 ? (
            <p className="text-center text-on-surface-variant text-sm py-10">
              {jogadores.length === 0 ? 'Nenhum jogador inscrito.' : 'Nenhum resultado para essa busca.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtrados.map(p => {
                const jaNaChave = posicionados.has(p.nickname);
                const ehAtual = p.nickname === atual;

                return (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p.nickname)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      ehAtual
                        ? 'bg-primary/20 border-primary/50'
                        : 'bg-surface-container-high border-outline-variant/20 hover:border-primary/40'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                      ehAtual ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-outline'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div className="min-w-0 flex-grow">
                      <p className={`font-body-md text-sm font-semibold truncate ${ehAtual ? 'text-primary' : 'text-on-surface'}`}>
                        {p.nickname}
                      </p>
                      <p className="font-label-sm text-[10px] text-on-surface-variant uppercase font-bold tracking-wider truncate">
                        {p.name}
                      </p>
                    </div>
                    {jaNaChave && !ehAtual && (
                      <span
                        className="material-symbols-outlined text-secondary text-[18px] shrink-0"
                        title="Já está na chave — será movido para cá"
                      >
                        swap_horiz
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Partida                                                                     */
/* -------------------------------------------------------------------------- */

function Slot({ nome, isWinner, isFinal, editavel, onPick, onEdit }) {
  const vazio = !nome;
  const bye = nome === BYE;

  return (
    <div
      className={`flex items-center gap-1 px-3 py-2.5 transition-colors ${
        isWinner
          ? isFinal ? 'bg-green-500/10 text-green-400' : 'bg-primary/10 text-primary'
          : vazio ? 'text-outline/40 italic' : 'text-on-surface-variant hover:bg-white/[0.03]'
      }`}
    >
      <button
        onClick={onPick}
        disabled={vazio || bye}
        className="flex-grow text-left font-semibold text-sm truncate disabled:cursor-default focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
        title={vazio ? 'Slot vazio' : bye ? 'Sem adversário — avança direto' : `Marcar ${nome} como vencedor`}
      >
        {nome || VAZIO}
      </button>

      <div className="flex items-center gap-0.5 shrink-0">
        {isWinner && (
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isFinal ? 'emoji_events' : 'check_circle'}
          </span>
        )}
        {editavel && (
          <button
            onClick={onEdit}
            className="text-outline/40 hover:text-primary transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded p-0.5"
            title="Definir jogador manualmente"
            aria-label="Definir jogador manualmente"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match, ehFinal, editavel, onPick, onEdit }) {
  return (
    <div
      className={`flex flex-col rounded-lg overflow-hidden border divide-y divide-white/5 bg-surface-container-low shadow-lg ${
        ehFinal ? 'border-primary/40' : match.winner ? 'border-primary/25' : 'border-white/10'
      }`}
    >
      {['p1', 'p2'].map(pos => (
        <Slot
          key={pos}
          nome={match[pos]}
          isWinner={Boolean(match.winner) && match.winner === match[pos]}
          isFinal={ehFinal}
          editavel={editavel}
          onPick={() => onPick(match[pos])}
          onEdit={() => onEdit(pos)}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Página                                                                      */
/* -------------------------------------------------------------------------- */

export default function ChampionshipManager() {
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [capacidade, setCapacidade] = useState(() => getCapacity(GAMES[0]));
  const [players, setPlayers] = useState([]);
  const [bracket, setBracket] = useState(() => buildBracket(getCapacity(GAMES[0])));
  const [searchQuery, setSearchQuery] = useState('');
  const [editando, setEditando] = useState(null); // { index, position }
  const [painelAberto, setPainelAberto] = useState(true);

  useEffect(() => {
    const cap = getCapacity(selectedGame);
    setCapacidade(cap);
    setPlayers(getTournamentEntries(selectedGame));
    setBracket(loadBracket(selectedGame, cap));
    setEditando(null);
  }, [selectedGame]);

  // Persiste a cada mudança — é isto que faz a chave sobreviver ao reload.
  const atualizarBracket = useCallback((novo) => {
    setBracket(novo);
    saveBracket(selectedGame, novo);
  }, [selectedGame]);

  const trocarCapacidade = (nova) => {
    setCapacity(selectedGame, nova);
    setCapacidade(nova);
    const vazia = buildBracket(nova);
    setBracket(vazia);
    saveBracket(selectedGame, vazia);
    setEditando(null);
  };

  const gerarChaveamento = () => {
    if (players.length === 0) return;
    atualizarBracket(seedBracket(players, capacidade));
    setEditando(null);
  };

  const limparChave = () => {
    clearBracket(selectedGame);
    setBracket(buildBracket(capacidade));
    setEditando(null);
  };

  const inserirJogadoresTeste = () => {
    const cap = Math.max(capacidade, 16);
    if (cap !== capacidade) {
      setCapacity(selectedGame, cap);
      setCapacidade(cap);
    }
    setPlayers(seedTestPlayers(selectedGame, 16));
    const vazia = buildBracket(cap);
    setBracket(vazia);
    saveBracket(selectedGame, vazia);
  };

  const posicionados = useMemo(() => assignedNames(bracket), [bracket]);
  const campeao = getChampion(bracket);

  const filtrados = useMemo(() => {
    const termo = searchQuery.toLowerCase();
    return players.filter(
      p => p.nickname?.toLowerCase().includes(termo) || p.name?.toLowerCase().includes(termo)
    );
  }, [players, searchQuery]);

  const partidaEditando = editando ? bracket.rounds[0]?.matches[editando.index] : null;

  return (
    <main className="flex-grow w-full max-w-[1600px] mx-auto px-container-margin py-8 flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface font-bold uppercase">
            Chaveamento
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1.5">
            Demonstração local — inscrições e chave ficam salvas neste navegador.
          </p>
        </div>
      </header>

      <ConfigBar
        game={selectedGame}
        onGame={setSelectedGame}
        capacidade={capacidade}
        onCapacidade={trocarCapacidade}
        inscritos={players.length}
      />

      {/*
        `minmax(0,1fr)` e não `1fr`: uma trilha `1fr` tem min-width auto, então
        o `min-w-max` do chaveamento a empurra e a página inteira transborda na
        horizontal. Com minmax(0,…) a trilha encolhe e a rolagem acontece dentro
        do painel, que é onde deve acontecer.
      */}
      <div className={`grid gap-5 items-start transition-all duration-300 ${
        painelAberto
          ? 'grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)]'
          : 'grid-cols-[48px_minmax(0,1fr)]'
      }`}>
        {/* Painel de competidores — recolhível */}
        {painelAberto ? (
          <aside className="glass-panel rounded-lg p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-headline-lg text-sm text-on-surface font-semibold uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">group</span>
                Competidores
              </h2>
              <button
                onClick={() => setPainelAberto(false)}
                className="text-outline hover:text-primary transition-colors p-1 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                title="Recolher painel"
                aria-label="Recolher painel de competidores"
              >
                <span className="material-symbols-outlined text-[20px]">left_panel_close</span>
              </button>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-sm pointer-events-none">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg py-2 pl-9 pr-3 text-sm focus:border-primary outline-none placeholder:text-on-surface-variant/40"
                placeholder="Buscar jogador..."
                type="text"
              />
            </div>

            <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {filtrados.length === 0 ? (
                <p className="text-center text-on-surface-variant text-xs py-6">
                  {players.length === 0 ? 'Nenhum jogador inscrito.' : 'Nenhum resultado.'}
                </p>
              ) : (
                filtrados.map(p => {
                  const naChave = posicionados.has(p.nickname);
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                        naChave ? 'bg-primary/5 border-primary/25' : 'bg-surface-container border-outline-variant/10'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                        naChave ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-outline'
                      }`}>
                        <span className="material-symbols-outlined text-[18px]">person</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-body-md text-sm font-semibold text-on-surface truncate">{p.nickname}</p>
                        <p className="font-label-sm text-[10px] text-on-surface-variant uppercase font-bold tracking-wider truncate">
                          {p.name}
                        </p>
                      </div>
                      {naChave && (
                        <span className="material-symbols-outlined text-primary text-sm ml-auto shrink-0" title="Já está na chave">
                          how_to_reg
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/10">
              <button
                onClick={gerarChaveamento}
                disabled={players.length === 0}
                className="w-full bg-primary text-[#003549] font-label-sm uppercase tracking-widest py-3 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sortear chaveamento
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={limparChave}
                  className="border border-outline-variant/30 text-on-surface-variant font-label-sm uppercase tracking-wider py-2.5 rounded-lg hover:border-error/40 hover:text-error transition-all font-bold text-[10px]"
                >
                  Limpar chave
                </button>
                <button
                  onClick={inserirJogadoresTeste}
                  className="border border-primary/25 text-primary/80 font-label-sm uppercase tracking-wider py-2.5 rounded-lg hover:bg-primary/10 transition-all font-bold text-[10px]"
                >
                  16 de teste
                </button>
              </div>
            </div>
          </aside>
        ) : (
          <button
            onClick={() => setPainelAberto(true)}
            className="glass-panel rounded-lg h-full min-h-[200px] flex flex-col items-center justify-start pt-5 gap-3 text-outline hover:text-primary transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            title="Expandir painel de competidores"
            aria-label="Expandir painel de competidores"
          >
            <span className="material-symbols-outlined text-[20px]">left_panel_open</span>
            <span className="font-label-sm text-[10px] uppercase tracking-widest font-bold [writing-mode:vertical-rl]">
              Competidores ({players.length})
            </span>
          </button>
        )}

        {/* Chaveamento */}
        <section className="glass-panel rounded-lg p-5 min-h-[520px] flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
            <h2 className="font-headline-lg text-sm text-on-surface font-semibold uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">account_tree</span>
              {bracket.rounds.length} {bracket.rounds.length === 1 ? 'fase' : 'fases'}
            </h2>
            <p className="font-body-md text-xs text-on-surface-variant hidden md:block">
              Clique no nome para marcar o vencedor
            </p>
          </div>

          {campeao && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3 animate-fadeIn">
              <span className="material-symbols-outlined text-green-400 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                emoji_events
              </span>
              <div>
                <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Campeão</div>
                <div className="font-display-lg text-lg text-on-surface font-extrabold uppercase">{campeao}</div>
              </div>
            </div>
          )}

          <div className="flex-grow overflow-x-auto custom-scrollbar pb-2">
            <div className="flex min-w-max h-full" style={{ minHeight: `${bracket.rounds[0].matches.length * 92}px` }}>
              {bracket.rounds.map((round, r) => {
                const ehUltima = r === bracket.rounds.length - 1;
                const editavel = r === 0;

                // As partidas são agrupadas em pares: cada par alimenta uma
                // partida da fase seguinte. O agrupamento é o que permite
                // desenhar o conector em "]" com posições determinísticas —
                // dentro de um par, os centros ficam sempre em 25% e 75%.
                const pares = [];
                for (let i = 0; i < round.matches.length; i += 2) {
                  pares.push(round.matches.slice(i, i + 2));
                }

                return (
                  <div
                    key={round.name}
                    className={`flex flex-col shrink-0 ${ehUltima ? 'w-[220px]' : 'w-[268px]'}`}
                  >
                    <h3 className="font-label-sm text-center text-outline-variant uppercase tracking-widest font-bold text-[10px] pb-3">
                      {round.name}
                    </h3>

                    <div className="flex flex-col justify-around flex-grow">
                      {pares.map((par, pi) => (
                        <div
                          key={pi}
                          className="relative flex flex-col justify-around flex-1"
                        >
                          {par.map((m) => (
                            <div key={m.id} className="relative w-[220px]">
                              <MatchCard
                                match={m}
                                ehFinal={ehUltima}
                                editavel={editavel}
                                onPick={(nome) =>
                                  atualizarBracket(advanceWinner(bracket, r, m.index, nome))
                                }
                                onEdit={(pos) => setEditando({ index: m.index, position: pos })}
                              />
                              {/* Trecho horizontal saindo da partida */}
                              {!ehUltima && (
                                <span
                                  className={`absolute left-[220px] top-1/2 -translate-y-1/2 h-px w-6 ${
                                    m.winner ? 'bg-primary/60' : 'bg-white/10'
                                  }`}
                                />
                              )}
                            </div>
                          ))}

                          {/* Conector em "]": une o par e sai para a fase seguinte */}
                          {!ehUltima && par.length === 2 && (
                            <>
                              <span
                                className="absolute left-[244px] w-px bg-white/10"
                                style={{ top: '25%', height: '50%' }}
                              />
                              <span
                                className="absolute left-[244px] top-1/2 h-px w-6 bg-white/10"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {editando && partidaEditando && (
        <PlayerModal
          jogadores={players}
          atual={partidaEditando[editando.position]}
          posicionados={posicionados}
          onSelect={(nick) => {
            atualizarBracket(assignPlayer(bracket, 0, editando.index, editando.position, nick));
            setEditando(null);
          }}
          onClose={() => setEditando(null)}
        />
      )}
    </main>
  );
}
