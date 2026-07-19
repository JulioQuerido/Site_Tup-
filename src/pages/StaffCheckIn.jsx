import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { getBookings, checkInBooking, escapeLikePattern, normalizeVisitor } from '../utils/storage';

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 200;

export default function StaffCheckIn() {
  const [visitors, setVisitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [localCheckedInIds, setLocalCheckedInIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Mantem a busca atual acessivel ao canal Realtime sem recria-lo a cada tecla.
  const queryRef = useRef('');
  queryRef.current = debouncedQuery;

  // `silent` evita ligar o estado de carregamento em recargas de fundo. Sem
  // isso, cada refresh troca a tabela inteira pelo spinner e a tela pisca.
  const loadData = useCallback(async ({ silent = false } = {}) => {
    const term = queryRef.current.trim();
    if (!silent) setLoading(true);
    try {
      let query = supabase.from('visitantes').select('*');

      // Filtro no banco. `%` e `_` digitados pelo usuario sao escapados para
      // nao virarem curingas silenciosos.
      if (term) {
        query = query.ilike('nome', `%${escapeLikePattern(term)}%`);
      }

      const { data, error } = await query
        .order('id', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      setVisitors((data || []).map(normalizeVisitor));
    } catch (err) {
      console.warn('Supabase indisponível, usando dados locais:', err.message);
      // Fallback local bookings and client-side filter
      const mappedLocal = getBookings().map(b => ({
        id: b.id,
        name: b.name,
        whatsapp: b.whatsapp,
        experiences: b.experiences,
        check_in_realizado: b.check_in_realizado || false,
        horario_check_in: b.horario_check_in || null,
        created_at: new Date().toISOString()
      }));

      if (term) {
        const lowered = term.toLowerCase();
        setVisitors(mappedLocal.filter(
          v => v.name.toLowerCase().includes(lowered) || v.whatsapp.includes(term)
        ));
      } else {
        setVisitors(mappedLocal);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Debounce da busca: evita uma consulta por tecla digitada.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [debouncedQuery, loadData]);

  // Canal Realtime criado uma unica vez — nao depende da busca.
  useEffect(() => {
    let channel;
    try {
      channel = supabase
        .channel('public:visitantes-checkin')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'visitantes' },
          // Recarga de fundo: nunca mostra spinner, so reconcilia os dados.
          () => loadData({ silent: true })
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime check-in desabilitado:', e.message);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [loadData]);

  const handleCheckIn = async (id) => {
    const timestamp = new Date().toISOString();

    // Atualizacao otimista: a linha muda na hora, sem esperar a ida e volta ao
    // banco. O Realtime depois reconcilia em silencio.
    const anterior = visitors;
    setVisitors(prev => prev.map(v =>
      v.id === id ? { ...v, check_in_realizado: true, horario_check_in: timestamp } : v
    ));

    try {
      const { error } = await supabase
        .from('visitantes')
        .update({
          check_in_realizado: true,
          horario_check_in: timestamp,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.warn('Check-in remoto falhou, gravando localmente:', err.message);

      const local = checkInBooking(id, timestamp);
      const gravouLocalmente = local.some(b => b.id === id && b.check_in_realizado);

      if (gravouLocalmente) {
        setLocalCheckedInIds(prev => [...prev, id]);
      } else {
        // Nao gravou em lugar nenhum: desfaz o otimismo para nao mostrar um
        // check-in que nao existe.
        setVisitors(anterior);
        setErro('Não foi possível registrar o check-in. Tente novamente.');
      }
    }
  };

  const isCheckedIn = (visitor) => {
    return visitor.check_in_realizado || localCheckedInIds.includes(visitor.id);
  };

  const expLabels = {
    vr: 'VR',
    manga: 'Mangá',
    ps5: 'PS5',
    videoke: 'Videokê'
  };

  return (
    <div className="min-h-screen bg-background text-on-background relative flex flex-col pt-16">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 shadow-[0_0_15px_rgba(0,191,255,0.1)] flex justify-between items-center px-container-margin py-unit h-16">
        <div className="flex items-center gap-8">
          <a href="#/">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvA9stbwmpqCPZg6l3EZXFdR710eTs8sor85stNyw1G-XCe-0W1CsI0xqONPv4oWDXrne3PRTkPxtou2M6xyHVxifwnaaBfdnTLoftrnMkyJ-48AgPIBpPUjv-jZkNVVlo0uffIPGWCqysTH9b4qhFW0nQaJzKTU4myVeg1iPJ5fLlWF170I8Z7JvXtT90sBw684lp506PAROmMfoIYVtY6BP7TPSJIhOn6UHxgxGu5cakzCuIrdmfClafa0YpmkfvGg" 
              alt="Tupã Hub Logo" 
              className="h-10 w-auto object-contain cursor-pointer"
            />
          </a>
          <div className="hidden md:flex gap-6 font-label-sm text-xs font-bold uppercase tracking-widest">
            <a className="text-primary border-b-2 border-primary pb-2" href="#/admin/checkin">Inscritos Estande</a>
            <a className="text-on-surface-variant hover:text-primary transition-all" href="#/admin/campeonatos">Campeonatos</a>
            <a className="text-on-surface-variant hover:text-primary transition-all" href="#/painel-metricas">Métricas</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary text-xl active:scale-95">notifications</button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary text-xl active:scale-95">settings</button>
          <div className="w-8 h-8 rounded-full bg-primary-container overflow-hidden border border-primary/20">
            <img 
              className="w-full h-full object-cover" 
              alt="Admin Avatar" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAda8WsEhAQF4t5lkwsYY_zW0c0Re25k1pUvapMLro6mz2Q7MafpxTDSqqeP9OzRI6hYCwSGcsEAZqudrU4Hbs2zyw0elVYgohmz-qYqXnM6Ph7ssPqeViuTCSPYENf3iGU7jbYeMwRA53KjnGJdfz2FQSjVUacC5pHs5cRUfAkzBobnlHfw6foJRB4gohDbBn0hmgwro-ByZRCpP5chgTbaLrIZSeyZQaEgKsWvGs8GlIXv7ABv7i3"
            />
          </div>
        </div>
      </nav>

      {/* Side Navigation Menu */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant/10 shadow-2xl flex flex-col pt-24 pb-8 px-4 hidden lg:flex">
        <div className="mb-8 px-4">
          <p className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant opacity-60 font-bold">Admin Terminal</p>
        </div>
        
        <nav className="flex-grow space-y-2 font-label-sm text-xs font-bold uppercase tracking-wider">
          <a href="#/painel-metricas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a href="#/admin/checkin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary-container/20 text-primary border-r-4 border-primary transition-colors">
            <span className="material-symbols-outlined text-lg">badge</span>
            <span>Check-in Staff</span>
          </a>
          <a href="#/admin/campeonatos" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-lg">sports_esports</span>
            <span>Tournaments</span>
          </a>
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/10 space-y-2 font-label-sm text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={loadData}
            className="w-full py-3.5 px-4 bg-primary text-[#003549] font-bold rounded-lg shadow-[0_0_15px_rgba(143,214,255,0.3)] hover:brightness-110 active:scale-95 transition-all mb-4 text-xs tracking-wider"
          >
            Sincronizar DB
          </button>
          <a href="#/login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-container/10 transition-colors">
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Sair</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 pt-24 px-container-margin pb-20 w-full max-w-[1200px] relative z-10">
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline-lg text-2xl md:text-3xl text-primary drop-shadow-[0_0_8px_rgba(143,214,255,0.4)] mb-2 uppercase font-semibold">
                Check-in de Participantes
              </h1>
              <p className="font-body-md text-sm text-on-surface-variant max-w-xl">
                Gerencie a entrada dos visitantes no estande Tupã Hub e valide as atrações selecionadas em tempo real.
              </p>
            </div>
            <div className="text-right hidden md:block">
              <span className="font-label-sm text-[10px] text-on-surface-variant block uppercase tracking-wider font-bold">Status do Estande</span>
              <span className="font-headline-lg text-secondary text-2xl font-bold">
                {visitors.filter(isCheckedIn).length} / {visitors.length} Ativos
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 relative max-w-4xl group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-primary/60">search</span>
            </div>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border-2 border-outline-variant/30 text-on-surface h-14 pl-12 pr-4 rounded-xl font-body-md transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm outline-none" 
              placeholder="Buscar participante por nome ou telefone..." 
              type="text"
            />
          </div>
        </header>

        {erro && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-error font-body-md text-sm animate-fadeIn"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {erro}
            </span>
            <button
              onClick={() => setErro('')}
              className="text-error/70 hover:text-error transition-colors"
              aria-label="Fechar aviso"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Data Table */}
        <section className="bg-surface-container/60 backdrop-blur-md rounded-2xl overflow-hidden border border-outline-variant/20 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body-md text-sm">
              <thead>
                <tr className="bg-surface-container/80 border-b border-outline-variant/20 font-label-sm text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 text-on-surface-variant">Nome</th>
                  <th className="px-6 py-4 text-on-surface-variant">Telefone</th>
                  <th className="px-6 py-4 text-on-surface-variant">Experiências</th>
                  <th className="px-6 py-4 text-on-surface-variant text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-on-surface-variant">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Carregando dados do Supabase...</span>
                      </div>
                    </td>
                  </tr>
                ) : visitors.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant">
                      Nenhum participante encontrado.
                    </td>
                  </tr>
                ) : (
                  visitors.map((visitor) => {
                    const done = isCheckedIn(visitor);
                    return (
                      <tr key={visitor.id} className="hover:bg-surface-container-high/35 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 font-bold text-primary font-display-lg text-xs">
                              {visitor.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-display-lg text-sm text-on-surface font-semibold leading-tight">{visitor.name}</div>
                              <div className="text-[10px] text-on-surface-variant font-label-sm">
                                {done && visitor.horario_check_in ? (
                                  <span className="text-secondary font-mono">Entrada: {new Date(visitor.horario_check_in).toLocaleTimeString('pt-BR')}</span>
                                ) : (
                                  <span>ID: {visitor.id}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-on-surface-variant font-mono text-xs">
                          {visitor.whatsapp}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1.5">
                            {visitor.experiences?.map(exp => (
                              <span key={exp} className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider">
                                {expLabels[exp] || exp}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {done ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22c55e]/15 border border-[#22c55e]/30 text-green-400 font-label-sm text-xs font-semibold uppercase tracking-wider">
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              <span>Confirmado</span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleCheckIn(visitor.id)}
                              className="px-4 py-1.5 rounded-lg border border-primary text-primary font-bold text-xs uppercase tracking-wider hover:bg-primary hover:text-[#003549] transition-all duration-300 active:scale-95 shadow-[0_0_10px_rgba(143,214,255,0.08)]"
                            >
                              Dar Entrada
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
