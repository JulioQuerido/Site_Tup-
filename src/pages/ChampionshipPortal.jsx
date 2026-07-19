import React, { useState } from 'react';
import { addTournamentEntry, getCapacity, getTournamentEntries, GAMES, GAME_SHORT } from '../utils/tournament';

const mockBrackets = {
  'Street Fighter 6': {
    match1: { p1: 'Máfia PTU', s1: '2', p2: 'Alcateia', s2: '0', active: 1 },
    match2: { p1: 'Storm', s1: '2', p2: 'Thunder', s2: '1', active: 1 },
    final: { p1: 'Máfia PTU', s1: '-', p2: 'Storm', s2: '-', active: 0 }
  },
  'Tekken 8': {
    match1: { p1: 'JinMaster', s1: '2', p2: 'KingRage', s2: '1', active: 1 },
    match2: { p1: 'Hwoarang99', s1: '0', p2: 'MishimaBlood', s2: '2', active: 1 },
    final: { p1: 'JinMaster', s1: '-', p2: 'MishimaBlood', s2: '-', active: 0 }
  },
  'Naruto Ultimate Ninja Storm': {
    match1: { p1: 'SasukeUchiha', s1: '2', p2: 'Rasengan', s2: '0', active: 1 },
    match2: { p1: 'Shinobi', s1: '1', p2: 'Hokage', s2: '2', active: 1 },
    final: { p1: 'SasukeUchiha', s1: '-', p2: 'Hokage', s2: '-', active: 0 }
  },
  'Dragon Ball FighterZ': {
    match1: { p1: 'GokuSSJ', s1: '2', p2: 'VegetaPrince', s2: '1', active: 1 },
    match2: { p1: 'CellMax', s1: '2', p2: 'Buu', s2: '0', active: 1 },
    final: { p1: 'GokuSSJ', s1: '-', p2: 'CellMax', s2: '-', active: 0 }
  },
  'EA Sports FC 25': {
    match1: { p1: 'PhGamer', s1: '3', p2: 'Cris7', s2: '2', active: 1 },
    match2: { p1: 'NeyMagic', s1: '1', p2: 'MessiGoat', s2: '3', active: 1 },
    final: { p1: 'PhGamer', s1: '-', p2: 'MessiGoat', s2: '-', active: 0 }
  }
};

export default function ChampionshipPortal() {
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    whatsapp: '',
    game: 'Street Fighter 6'
  });
  
  const [selectedBracketGame, setSelectedBracketGame] = useState('Street Fighter 6');
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLiveBracketModal, setShowLiveBracketModal] = useState(false);
  const [registrationTicket, setRegistrationTicket] = useState(null);

  // Recalcula ao trocar de modalidade e apos cada inscricao registrada.
  const capacidadeAtual = getCapacity(formData.game);
  const vagasRestantes = Math.max(
    0,
    capacidadeAtual - getTournamentEntries(formData.game).length
  );

  const validateForm = () => {
    if (!formData.fullName.trim() || formData.fullName.trim().split(' ').length < 2) {
      setErrorMsg('Por favor, insira o seu nome completo (nome e sobrenome).');
      return false;
    }
    const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    if (!phoneRegex.test(formData.whatsapp.replace(/\s+/g, ''))) {
      setErrorMsg('Insira um número de WhatsApp válido, exemplo: (38) 99999-9999.');
      return false;
    }
    if (!formData.game) {
      setErrorMsg('Por favor, selecione uma modalidade (game).');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMsg('');

    // Modulo de campeonatos roda como demonstracao local: a inscricao fica
    // apenas nesta sessao, sem backend. Nao ha integracao com Challonge.
    try {
      const inscricao = addTournamentEntry(formData);
      setRegistrationTicket(inscricao);
      setRegistered(true);
    } catch (err) {
      if (err.code === 'TOURNAMENT_FULL') {
        // Limite configurado pelo admin — a mensagem já explica o motivo.
        setErrorMsg(err.message);
      } else {
        console.error('Falha ao registrar inscrição local:', err);
        setErrorMsg('Não foi possível registrar a inscrição. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const activeBracket = mockBrackets[selectedBracketGame];

  return (
    <main className="flex-grow flex flex-col relative">
      {/* Global Grid Background */}
      <div className="absolute inset-0 pointer-events-none bg-grid-tech z-0 opacity-50"></div>

      {/* Hero Section */}
      <section className="relative w-full min-h-[350px] flex items-center justify-center overflow-hidden z-10 border-b border-white/5">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="bg-cover bg-center w-full h-full opacity-35 mix-blend-screen" 
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDuXUKhXECM4lv-VOOjde10pWKXBHnXc6nmXEq3jrXwISUHIquAHNSVfX2yFUBW5wC42AzhJQ_er_oYlMmRi5gUjs6siUSBFg4q_HRbqz3D2-xmjn5OP-SCoYmgLP5K5YW6mjKYJ-KBK2OooXoRIf7jGGihhO0yA_p3IYwqgQOnreqOB-hzWV8ZJRqqzArzdVV49AltXLy5XLLB9ba9gws1I3pcTXZwLQTfsbuFnC6URDGkm-ugSsda')` 
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background"></div>
        </div>

        <div className="relative z-10 text-center max-w-[1000px] px-container-margin py-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(143,214,255,1)] animate-pulse"></span>
            <span className="font-label-sm text-primary uppercase tracking-widest text-xs font-semibold">Inscrições Abertas</span>
          </div>
          <h1 className="font-display-lg text-4xl md:text-5xl lg:text-6xl text-on-surface mb-4 drop-shadow-[0_0_20px_rgba(143,214,255,0.2)] uppercase">
            FESTIVAL DO JAPÃO <br/>
            <span className="text-primary font-bold text-glow">PORTAL 1V1</span>
          </h1>
          <p className="font-body-md text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto">
            Prepare-se para o embate final. Prove seu valor na arena digital do maior festival oriental. Escolha sua modalidade, registre seu codinome e entre na chave.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-container-margin py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Section 1: Interface de Inscrição (Form) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_12px_rgba(143,214,255,0.5)]">how_to_reg</span>
            <h2 className="font-headline-lg text-2xl text-on-surface font-semibold">Interface de Inscrição</h2>
          </div>

          <div className="bg-surface-container/60 backdrop-blur-lg border border-white/10 rounded-lg p-6 relative overflow-hidden group hover:border-primary/30 transition-colors duration-500">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {registered ? (
              <div className="relative z-10 flex flex-col items-center justify-center text-center py-8 gap-4 animate-fadeIn">
                <span className="material-symbols-outlined text-primary text-6xl drop-shadow-[0_0_15px_rgba(143,214,255,0.8)] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                <h3 className="font-display-lg text-2xl text-on-surface font-bold">Inscrição Confirmada!</h3>
                <p className="font-body-md text-on-surface-variant text-sm max-w-sm">
                  Parabéns <span className="text-primary font-bold">{registrationTicket.nickname}</span>, sua inscrição foi registrada com sucesso!
                </p>
                <div className="bg-[#121212] border border-white/5 p-4 rounded-lg mt-4 w-full text-left font-label-sm text-xs space-y-2">
                  <div className="text-primary font-bold uppercase tracking-wider mb-2">Comprovante do Competidor</div>
                  <div className="text-on-surface-variant flex justify-between"><span>Código Reg:</span> <span className="font-mono text-on-surface">{registrationTicket.id}</span></div>
                  <div className="text-on-surface-variant flex justify-between"><span>Modalidade:</span> <span className="font-mono text-on-surface uppercase">{registrationTicket.game}</span></div>
                  <div className="text-on-surface-variant flex justify-between"><span>Registro:</span> <span className="font-mono text-on-surface">{registrationTicket.time}</span></div>
                </div>
                <button
                  onClick={() => {
                    setRegistered(false);
                    setFormData({ fullName: '', nickname: '', whatsapp: '', game: 'Street Fighter 6' });
                  }}
                  className="mt-6 text-sm text-primary hover:text-[#a8e0ff] hover:underline"
                >
                  Fazer nova inscrição
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                {errorMsg && (
                  <div className="bg-error-container/20 border border-error/30 text-error p-3 rounded text-sm animate-fadeIn">
                    {errorMsg}
                  </div>
                )}
                
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-outline-variant uppercase text-xs tracking-wider font-semibold">Nome Completo</label>
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={submitting}
                    className="cyber-input w-full p-3 rounded font-body-md text-sm disabled:opacity-50" 
                    placeholder="Insira seu nome e sobrenome" 
                    type="text"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-outline-variant uppercase text-xs tracking-wider font-semibold">Nickname</label>
                    <input 
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      disabled={submitting}
                      className="cyber-input w-full p-3 rounded font-body-md text-sm disabled:opacity-50" 
                      placeholder="Ex: Player1" 
                      type="text"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-outline-variant uppercase text-xs tracking-wider font-semibold">WhatsApp</label>
                    <input 
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      disabled={submitting}
                      className="cyber-input w-full p-3 rounded font-body-md text-sm disabled:opacity-50" 
                      placeholder="(38) 99999-9999" 
                      type="tel"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-outline-variant uppercase text-xs tracking-wider font-semibold">Modalidade (Game)</label>
                  <div className="relative">
                    <select 
                      name="game"
                      value={formData.game}
                      onChange={handleChange}
                      disabled={submitting}
                      className="cyber-input w-full p-3 rounded font-body-md text-sm appearance-none cursor-pointer disabled:opacity-50"
                      required
                    >
                      {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">arrow_drop_down</span>
                  </div>

                  {/* Vagas restantes — evita o usuário descobrir que lotou só ao enviar */}
                  <p className={`font-label-sm text-[11px] font-semibold flex items-center gap-1.5 ${
                    vagasRestantes === 0 ? 'text-error' : 'text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {vagasRestantes === 0 ? 'block' : 'confirmation_number'}
                    </span>
                    {vagasRestantes === 0
                      ? 'Vagas esgotadas nesta modalidade.'
                      : `${vagasRestantes} de ${capacidadeAtual} vagas disponíveis.`}
                  </p>
                </div>

                {/* Lotado: o botão é desabilitado para o usuário não preencher
                    o formulário inteiro só para descobrir que não há vaga. */}
                <button
                  type="submit"
                  disabled={submitting || vagasRestantes === 0}
                  className="mt-4 bg-primary text-[#003549] font-display-lg font-bold text-label-sm uppercase tracking-wider py-4 rounded hover:shadow-[0_0_20px_rgba(143,214,255,0.4)] hover:bg-[#a8e0ff] transition-all duration-300 relative overflow-hidden group/btn disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-[#003549]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Registrando...</span>
                      </>
                    ) : vagasRestantes === 0 ? (
                      <>
                        <span className="material-symbols-outlined text-[18px]">block</span>
                        <span>Inscrições Encerradas</span>
                      </>
                    ) : (
                      'Confirmar Inscrição'
                    )}
                  </span>
                  {vagasRestantes > 0 && (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Section 2: Chaveamento (Brackets) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_12px_rgba(143,214,255,0.5)]">account_tree</span>
              <h2 className="font-headline-lg text-2xl text-on-surface font-semibold">Chaveamento (Live)</h2>
            </div>
            
            {/* Game Bracket Switcher */}
            <div className="relative">
              <select 
                value={selectedBracketGame} 
                onChange={(e) => setSelectedBracketGame(e.target.value)}
                className="bg-surface border border-white/10 text-on-surface-variant font-label-sm text-xs font-semibold px-3 py-1.5 rounded outline-none focus:border-primary/50 cursor-pointer uppercase tracking-wider"
              >
                {GAMES.map(g => <option key={g} value={g}>{GAME_SHORT[g]}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-surface border border-surface-container-high rounded-lg p-8 overflow-x-auto relative">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            <div className="min-w-[600px] flex items-stretch justify-start gap-12 relative z-10 py-4">
              {/* Round 1 (Semifinals) */}
              <div className="flex flex-col justify-around gap-16 w-64">
                {/* Match 1 */}
                <div className="bg-surface-container rounded border border-white/5 relative group hover:border-primary/40 transition-colors">
                  <div className="absolute right-0 top-1/2 w-12 bracket-line-h translate-x-full"></div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center p-3 border-b border-white/5 bg-surface-container-high">
                      <span className="font-body-md font-bold text-on-surface text-sm">{activeBracket.match1.p1}</span>
                      <span className="font-display-lg font-bold text-primary text-sm">{activeBracket.match1.s1}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 opacity-60">
                      <span className="font-body-md text-on-surface text-sm">{activeBracket.match1.p2}</span>
                      <span className="font-display-lg font-bold text-on-surface-variant text-sm">{activeBracket.match1.s2}</span>
                    </div>
                  </div>
                </div>

                {/* Match 2 */}
                <div className="bg-surface-container rounded border border-white/5 relative group hover:border-primary/40 transition-colors">
                  <div className="absolute right-0 top-1/2 w-12 bracket-line-h translate-x-full"></div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center p-3 border-b border-white/5 bg-surface-container-high">
                      <span className="font-body-md font-bold text-on-surface text-sm">{activeBracket.match2.p1}</span>
                      <span className="font-display-lg font-bold text-primary text-sm">{activeBracket.match2.s1}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 opacity-60">
                      <span className="font-body-md text-on-surface text-sm">{activeBracket.match2.p2}</span>
                      <span className="font-display-lg font-bold text-on-surface-variant text-sm">{activeBracket.match2.s2}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connectors Vertical */}
              <div className="flex flex-col justify-center items-center w-4 relative">
                <div className="absolute top-1/4 h-[25%] w-1/2 border-r border-t border-primary shadow-[1px_-1px_6px_rgba(143,214,255,0.3)] right-0 rounded-tr-lg"></div>
                <div className="absolute bottom-1/4 h-[25%] w-1/2 border-r border-b border-primary shadow-[1px_1px_6px_rgba(143,214,255,0.3)] right-0 rounded-br-lg"></div>
                <div className="absolute top-1/2 w-12 bracket-line-h left-1/2"></div>
              </div>

              {/* Round 2 (Finals) */}
              <div className="flex flex-col justify-center gap-16 w-64 ml-8">
                {/* Final Match */}
                <div className="bg-surface-container rounded border border-primary shadow-[0_0_15px_rgba(143,214,255,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-primary"></div>
                  <div className="flex justify-between items-center p-2 bg-primary/10 border-b border-primary/20">
                    <span className="font-label-sm text-primary uppercase tracking-widest text-[10px] font-semibold">Grand Final</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center p-3 border-b border-white/5 bg-surface-container-high">
                      <span className="font-body-md font-bold text-on-surface text-sm">{activeBracket.final.p1}</span>
                      <span className="font-display-lg font-bold text-outline-variant text-sm">{activeBracket.final.s1}</span>
                    </div>
                    <div className="flex justify-between items-center p-3">
                      <span className="font-body-md font-bold text-on-surface text-sm">{activeBracket.final.p2}</span>
                      <span className="font-display-lg font-bold text-outline-variant text-sm">{activeBracket.final.s2}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button
              onClick={() => setShowLiveBracketModal(true)}
              className="font-label-sm text-xs text-primary border border-primary/30 bg-primary/5 hover:bg-primary/20 px-4 py-2 rounded flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(143,214,255,0.1)] uppercase font-semibold"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              Visualizar Chaveamento
            </button>
          </div>
        </section>
      </div>

      {/* Elegant Iframe / Mock Bracket Modal with Neon Overlay */}
      {showLiveBracketModal && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface border border-primary rounded-xl max-w-4xl w-full relative overflow-hidden shadow-[0_0_50px_rgba(143,214,255,0.3)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary animate-pulse">sports_esports</span>
                <span className="font-display-lg text-sm md:text-base font-bold text-on-surface uppercase tracking-wider">Chaveamento ao vivo - {selectedBracketGame}</span>
              </div>
              <button 
                onClick={() => setShowLiveBracketModal(false)}
                className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Body (Mocked Iframe block with neon grid details) */}
            <div className="p-6 bg-[#0a0a0a] min-h-[400px] flex flex-col relative items-center justify-center">
              <div className="absolute inset-0 pointer-events-none bg-grid-tech z-0 opacity-10"></div>
              
              {/* This represents our real embedded bracket iframe with some neon overlays */}
              <div className="w-full h-[400px] border border-white/10 rounded-lg overflow-hidden relative z-10 flex flex-col bg-background/50">
                <div className="bg-surface-container-high/80 p-2 text-center text-xs text-outline-variant font-mono border-b border-white/5">
                  SECURE CHALLONGE EMBED | CH-ID: tupa_festival_1v1
                </div>
                
                {/* Simulated Iframe Content */}
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 gap-4">
                  <span className="material-symbols-outlined text-primary text-5xl animate-bounce">sync</span>
                  <div className="font-display-lg text-lg text-on-surface font-semibold uppercase tracking-wider">Carregando chaveamento...</div>
                  <p className="text-on-surface-variant text-xs max-w-sm">
                    Carregando chaveamento integrado em tempo real do torneio da Tupã Hub.
                  </p>
                  
                  {/* Visual tree inside mock iframe */}
                  <div className="border border-dashed border-primary/20 p-4 rounded bg-surface-container-low max-w-md w-full font-mono text-[10px] text-left text-primary/60 space-y-1">
                    <div>Participant: {formData.nickname || 'Guest'} -- REGISTERED [OK]</div>
                    <div>Updating matches sequence...</div>
                    <div>Ready to host 16 competitors.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 flex justify-end gap-2 relative z-10 bg-surface-container-low/50">
              <button 
                onClick={() => setShowLiveBracketModal(false)}
                className="bg-primary text-[#003549] px-6 py-2 rounded text-xs font-bold font-label-sm uppercase tracking-wider transition-all hover:bg-[#a8e0ff]"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
