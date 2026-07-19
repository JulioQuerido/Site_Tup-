import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import Footer from './components/Footer';
import PartnerCarousel from './components/PartnerCarousel';
import GameTabs from './components/GameTabs';
import AudienceChart from './components/AudienceChart';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'quem-somos', 'modalidades', 'servicos', 'cases', 'contato'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-body-md bg-background min-h-screen flex flex-col relative grid-bg overflow-x-hidden text-on-surface">
      
      {/* Header */}
      <Header activeSection={activeSection} scrollToSection={scrollToSection} />

      {/* Main Content */}
      <main className="flex-grow">
        
        {/* Section: Home (Hero) */}
        <section 
          id="home" 
          className="relative min-h-[85vh] flex items-center justify-center px-container-margin py-section-gap overflow-hidden"
        >
          {/* Background Cinematic Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 z-0 mix-blend-screen"
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDQLSUEr8-KOYf1y1qq5BvK_rTGvIAw-4AcFDFfwwKnVnxKv99-af7Pqh_rtx5-DERA2fKFlhe4ztG77MJq_e0Srp0It6sSPHyZvDkU9dKpRgMsSUK02dRxG_Q7iIX9gdPL5BhpOvtCY3HYDotkYrv8xgd20xFLoxMYjcwj07_DIFp8T3XBgo060jpEokKsrnaNt33UMuRV7FjyU6K-Dz1I4OlaEmuT48gYoDMtSgwTiXB9NhVK6vYR')` 
            }}
          />
          <div className="relative z-10 max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
            <div className="flex flex-col gap-6 text-center md:text-left">
              <h1 className="font-display-lg text-4xl md:text-5xl lg:text-6xl text-on-surface leading-tight">
                Transformando tecnologia, games e inovação em <span className="text-primary text-glow font-bold">experiências que conectam pessoas</span>
              </h1>
              <p className="font-body-md text-base md:text-lg text-on-surface-variant max-w-xl mx-auto md:mx-0">
                O epicentro do alto desempenho tecnológico regional. Junte-se à revolução digital e sinta o poder da tempestade do Tupã Hub.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
                <button 
                  onClick={() => scrollToSection('modalidades')}
                  className="bg-primary text-[#003549] font-bold px-6 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(143,214,255,0.8)] transition-all font-label-sm text-sm uppercase tracking-wider"
                >
                  Explorar Modalidades
                </button>
                <button 
                  onClick={() => scrollToSection('servicos')}
                  className="bg-transparent border border-primary text-primary font-bold px-6 py-3 rounded-lg hover:bg-surface-container-high transition-all font-label-sm text-sm uppercase tracking-wider"
                >
                  Nossos Serviços
                </button>
              </div>
            </div>
            
            {/* Logo Section */}
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 z-0 animate-pulse"></div>
              <img 
                alt="Tupã Hub Brand Logo" 
                className="relative z-10 w-full max-w-md object-contain drop-shadow-[0_0_35px_rgba(143,214,255,0.4)]" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCK1d3d57MBcrlfqJeq8vU554Oy8GFD8EN-RJIgWL78g2FRa6gP7scj8lvltMjssqHIbshRcTiDaVplLEWpgWrHF8KkpVU9us6_FYPvlAbDMxaAX5mMeYSlN3ugV4INhb26MBPqVdPQyEnqwsWgIvqy8HqqG1VljDNr2Q34JLqg6lrPxHsZnOrxvkkxrlk67KL05ssp1BlgWhJd4yIA1n_hTyKBQppXhYYJz-Q5wAS0nuduEy1B7EF9rRW-05r4aInU2g"
              />
            </div>
          </div>
        </section>

        {/* Section: Stats (Impact Stats) */}
        <section className="bg-[#1c1b1b] py-12 border-y border-white/5 relative z-10">
          <div className="max-w-[1440px] mx-auto px-container-margin">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Stat 1 */}
              <div className="bg-surface p-6 rounded-xl border border-surface-variant hover-neon-glow transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 group cursor-default">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:drop-shadow-[0_0_8px_rgba(143,214,255,0.8)] transition-all">visibility</span>
                <h3 className="font-display-lg text-3xl md:text-4xl text-primary text-glow font-bold">+4.100</h3>
                <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Visualizações ao vivo simultâneas</p>
              </div>
              {/* Stat 2 */}
              <div className="bg-surface p-6 rounded-xl border border-surface-variant hover-neon-glow transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 group cursor-default">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:drop-shadow-[0_0_8px_rgba(143,214,255,0.8)] transition-all">trophy</span>
                <h3 className="font-display-lg text-3xl md:text-4xl text-primary text-glow font-bold">+3 Anos</h3>
                <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">História em campeonatos regionais</p>
              </div>
              {/* Stat 3 */}
              <div className="bg-surface p-6 rounded-xl border border-surface-variant hover-neon-glow transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 group cursor-default">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:drop-shadow-[0_0_8px_rgba(143,214,255,0.8)] transition-all">payments</span>
                <h3 className="font-display-lg text-3xl md:text-4xl text-primary text-glow font-bold">R$ 9.000+</h3>
                <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Premiações Distribuídas</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Quem Somos */}
        <section 
          id="quem-somos" 
          className="max-w-[1440px] w-full mx-auto px-container-margin py-section-gap flex flex-col gap-12"
        >
          <header className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
            <h2 className="font-display-lg text-3xl md:text-4xl text-primary text-glow font-bold uppercase tracking-widest">
              A Origem da Tempestade
            </h2>
            <p className="font-body-md text-base md:text-lg text-on-surface-variant leading-relaxed">
              Fundado por entusiastas da tecnologia, o Tupã Hub une cultura geek, e-sports e inovação regional no coração de Paracatu. Somos o ponto de convergência para mentes criativas e competitivas.
            </p>
          </header>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Hero Card */}
            <div className="col-span-1 md:col-span-8 bg-[#1c1b1b] border border-surface-variant rounded-xl overflow-hidden relative group hover:border-primary transition-colors duration-300 flex flex-col md:flex-row min-h-[400px]">
              <div className="w-full md:w-1/2 p-8 flex flex-col justify-center gap-4 z-10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1c1b1b] via-[#1c1b1b]/95 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <span className="font-label-sm text-xs text-primary uppercase border border-primary/30 bg-primary/10 px-3 py-1 rounded-full inline-block mb-4 font-bold tracking-wider">
                    Nossa Missão
                  </span>
                  <h3 className="font-display-lg text-2xl md:text-3xl text-on-surface mb-3 font-bold">Conectando Paracatu ao Mundo</h3>
                  <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                    Criamos um ecossistema onde jogadores, desenvolvedores e criadores podem colaborar, competir e elevar o cenário tecnológico local a novos patamares.
                  </p>
                </div>
              </div>
              <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-full">
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors z-10"></div>
                <img 
                  className="w-full h-full object-cover absolute inset-0" 
                  alt="Tech collaboration" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8d--lWIdGIL90VJtHDEfL45HduxDu940xmk3DorsrSsfwn719oHAHULTA0A8kltJxdhxAazFQYqvUBNyqF9w9djqJuONTg5ta-matLr1vLA3OwYFE3EG04rRj3yRRkGg7bc8mEccqWKDMZL5InbtacWoCtBaoo2oLcX2x0Sj7DH9X7KPAaoCcR78-NhONPTULurtf-EMMusZ3MRtckS3tPANh8IYsWeoCZr4Pvd9ltAjc83_xEmQJ"
                />
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity neon-glow"></div>
            </div>

            {/* Small Card 1 */}
            <div className="col-span-1 md:col-span-4 bg-[#1c1b1b] border border-surface-variant rounded-xl p-8 flex flex-col justify-center items-center text-center gap-4 hover:border-primary transition-colors group relative overflow-hidden">
              <span className="material-symbols-outlined text-5xl text-primary drop-shadow-[0_0_8px_rgba(143,214,255,0.4)]" style={{ fontVariationSettings: "'FILL' 0" }}>sports_esports</span>
              <h3 className="font-display-lg text-xl font-bold text-on-surface">E-Sports</h3>
              <p className="text-on-surface-variant text-sm">Fomentando o cenário competitivo regional com infraestrutura de elite e torneios dedicados.</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity neon-glow"></div>
            </div>

            {/* Small Card 2 */}
            <div className="col-span-1 md:col-span-4 bg-[#1c1b1b] border border-surface-variant rounded-xl p-8 flex flex-col justify-center items-center text-center gap-4 hover:border-primary transition-colors group relative overflow-hidden">
              <span className="material-symbols-outlined text-5xl text-secondary drop-shadow-[0_0_8px_rgba(148,204,255,0.4)]" style={{ fontVariationSettings: "'FILL' 0" }}>memory</span>
              <h3 className="font-display-lg text-xl font-bold text-on-surface">Tech Hub</h3>
              <p className="text-on-surface-variant text-sm">Espaço aberto de inovação tecnológica para programadores, desenvolvedores e startups.</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity neon-glow"></div>
            </div>

            {/* Small Card 3 */}
            <div className="col-span-1 md:col-span-8 bg-[#1c1b1b] border border-surface-variant rounded-xl p-8 flex flex-col md:flex-row items-center justify-between hover:border-primary transition-colors group relative overflow-hidden gap-6">
              <div className="text-center md:text-left">
                <h3 className="font-display-lg text-2xl font-bold text-on-surface mb-2">Comunidade Geek</h3>
                <p className="text-on-surface-variant text-sm md:text-base leading-relaxed max-w-md">
                  Unindo fãs de cultura pop, anime, tecnologia e entretenimento geral em encontros e convenções regionais imersivas.
                </p>
              </div>
              <span className="material-symbols-outlined text-7xl text-surface-variant group-hover:text-primary transition-colors drop-shadow-[0_0_15px_rgba(143,214,255,0)] group-hover:drop-shadow-[0_0_15px_rgba(143,214,255,0.5)]" style={{ fontVariationSettings: "'FILL' 0" }}>groups</span>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity neon-glow"></div>
            </div>
          </div>

          {/* Demographics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Gender split */}
            <div className="bg-[#1c1b1b] border border-surface-variant rounded-xl p-6 md:p-8 relative overflow-hidden group hover:border-primary transition-colors">
              <h3 className="font-display-lg text-base uppercase text-primary font-bold mb-6 border-b border-white/5 pb-3 tracking-wider">
                Distribuição de Público por Gênero
              </h3>
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-on-surface font-semibold">Masculino</span>
                    <span className="text-primary font-bold">62%</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary neon-glow" style={{ width: '62%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-on-surface font-semibold">Feminino</span>
                    <span className="text-secondary font-bold">38%</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary neon-glow" style={{ width: '38%' }}></div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity neon-glow"></div>
            </div>

            {/* Main Interests */}
            <div className="bg-[#1c1b1b] border border-surface-variant rounded-xl p-6 md:p-8 relative overflow-hidden group hover:border-primary transition-colors">
              <h3 className="font-display-lg text-base uppercase text-primary font-bold mb-6 border-b border-white/5 pb-3 tracking-wider">
                Faixa Etária Principal: 14 - 30 Anos
              </h3>
              <div className="grid grid-cols-3 gap-4 h-36 items-end">
                {/* Games */}
                <div className="flex flex-col items-center gap-2 group/bar">
                  <span className="text-on-surface-variant text-[11px] font-bold group-hover/bar:text-primary transition-colors uppercase tracking-wider">Games</span>
                  <div className="w-full bg-surface-container-highest rounded-t-lg relative h-24 flex items-end">
                    <div className="w-full bg-primary/20 border border-primary/50 border-b-0 rounded-t-lg transition-all h-[85%] group-hover/bar:bg-primary group-hover/bar:neon-glow relative overflow-hidden">
                      <div className="absolute bottom-0 w-full h-[2px] bg-primary"></div>
                    </div>
                  </div>
                </div>
                {/* Tech */}
                <div className="flex flex-col items-center gap-2 group/bar">
                  <span className="text-on-surface-variant text-[11px] font-bold group-hover/bar:text-primary transition-colors uppercase tracking-wider">Tech</span>
                  <div className="w-full bg-surface-container-highest rounded-t-lg relative h-24 flex items-end">
                    <div className="w-full bg-secondary/20 border border-secondary/50 border-b-0 rounded-t-lg transition-all h-[70%] group-hover/bar:bg-secondary group-hover/bar:neon-glow relative overflow-hidden">
                      <div className="absolute bottom-0 w-full h-[2px] bg-secondary"></div>
                    </div>
                  </div>
                </div>
                {/* Entertainment */}
                <div className="flex flex-col items-center gap-2 group/bar">
                  <span className="text-on-surface-variant text-[11px] font-bold group-hover/bar:text-primary transition-colors uppercase tracking-wider">Lazer</span>
                  <div className="w-full bg-surface-container-highest rounded-t-lg relative h-24 flex items-end">
                    <div className="w-full bg-[#d7c4ff]/20 border border-[#d7c4ff]/50 border-b-0 rounded-t-lg transition-all h-[60%] group-hover/bar:bg-[#d7c4ff] group-hover/bar:neon-glow relative overflow-hidden">
                      <div className="absolute bottom-0 w-full h-[2px] bg-[#d7c4ff]"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity neon-glow"></div>
            </div>
          </div>
        </section>

        {/* Section: Modalidades */}
        <section 
          id="modalidades" 
          className="max-w-[1440px] w-full mx-auto px-container-margin py-section-gap border-t border-white/5"
        >
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <h2 className="font-display-lg text-3xl md:text-4xl text-primary text-glow font-bold uppercase tracking-widest mb-4">
              Modalidades e Jogos
            </h2>
            <p className="font-body-md text-base text-on-surface-variant leading-relaxed">
              Explore os campos de batalha do Tupã Hub. Competições de alto nível, mapas estratégicos e glória cibernética aguardam os mais preparados da nossa região.
            </p>
          </div>

          <GameTabs />
        </section>

        {/* Section: Serviços (Nossa Operação) */}
        <section 
          id="servicos" 
          className="max-w-[1440px] w-full mx-auto px-container-margin py-section-gap border-t border-white/5"
        >
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <h2 className="font-display-lg text-3xl md:text-4xl text-primary text-glow font-bold uppercase tracking-widest mb-4">
              Nossa Operação
            </h2>
            <p className="font-body-md text-base text-on-surface-variant leading-relaxed">
              Soluções tecnológicas de alto desempenho para eventos, transmissões profissionais e ativações de marca de grande escala.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service 1 */}
            <div className="bg-[#1c1b1b] border border-surface-variant rounded-xl p-8 hover:border-primary transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-4">
                <span className="material-symbols-outlined text-primary text-4xl drop-shadow-[0_0_8px_rgba(143,214,255,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(143,214,255,0.6)] transition-all">emoji_events</span>
                <h3 className="font-display-lg text-2xl font-bold text-on-surface">Organização de Eventos</h3>
                <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                  Estruturação completa de torneios e campeonatos presenciais, híbridos e online. Infraestrutura de rede segura, servidores locais dedicados, gestão de chaves/times e palcos com design de ponta.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 relative z-10">
                <span className="bg-primary/10 text-primary border border-primary/30 px-3 py-1 rounded font-label-sm text-xs uppercase font-semibold">Presencial</span>
                <span className="bg-primary/10 text-primary border border-primary/30 px-3 py-1 rounded font-label-sm text-xs uppercase font-semibold">Híbrido</span>
                <span className="bg-primary/10 text-primary border border-primary/30 px-3 py-1 rounded font-label-sm text-xs uppercase font-semibold">Online</span>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-[#1c1b1b] border border-surface-variant rounded-xl p-8 hover:border-primary transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-4">
                <span className="material-symbols-outlined text-primary text-4xl drop-shadow-[0_0_8px_rgba(143,214,255,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(143,214,255,0.6)] transition-all">live_tv</span>
                <h3 className="font-display-lg text-2xl font-bold text-on-surface">Live Streaming Profissional</h3>
                <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                  Transmissões de alto padrão com sobreposições dinâmicas (overlays customizados), replay instantâneo, narradores integrados, transições suaves e integração de tabelas e estatísticas de jogo ao vivo.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 relative z-10">
                <span className="bg-primary/10 text-primary border border-primary/30 px-3 py-1 rounded font-label-sm text-xs uppercase font-semibold">Twitch / YouTube</span>
                <span className="bg-primary/10 text-primary border border-primary/30 px-3 py-1 rounded font-label-sm text-xs uppercase font-semibold">Full HD 60FPS</span>
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-[#1c1b1b] border border-surface-variant rounded-xl p-8 hover:border-primary transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-4">
                <span className="material-symbols-outlined text-primary text-4xl drop-shadow-[0_0_8px_rgba(143,214,255,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(143,214,255,0.6)] transition-all">campaign</span>
                <h3 className="font-display-lg text-2xl font-bold text-on-surface">Ativação de Marca</h3>
                <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                  Ações de marketing para integrar marcas não-endêmicas ao público gamer local de forma orgânica e impactante. Geração de leads, ativações presenciais com brindes e painéis interativos.
                </p>
              </div>
            </div>

            {/* Service 4 */}
            <div className="bg-[#1c1b1b] border border-surface-variant rounded-xl p-8 hover:border-primary transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-4">
                <span className="material-symbols-outlined text-primary text-4xl drop-shadow-[0_0_8px_rgba(143,214,255,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(143,214,255,0.6)] transition-all">perm_media</span>
                <h3 className="font-display-lg text-2xl font-bold text-on-surface">Conteúdo Multimídia</h3>
                <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                  Design gráfico profissional, produção e edição de vídeos (promos, melhores momentos, reels), coberturas fotográficas profissionais e gestão de redes de torneios de e-sports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Cases (Championship Results) */}
        <section 
          id="cases" 
          className="max-w-[1440px] w-full mx-auto px-container-margin py-section-gap border-t border-white/5"
        >
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <h2 className="font-display-lg text-3xl md:text-4xl text-primary text-glow font-bold uppercase tracking-widest mb-4">
              Nossos Cases de Sucesso
            </h2>
            <p className="font-body-md text-base text-on-surface-variant leading-relaxed">
              Confira os números reais que comprovam a nossa capacidade técnica e o alcance da comunidade gamer local em nossos campeonatos de e-sports.
            </p>
          </div>

          <AudienceChart />
        </section>

        {/* Section: Portfolio (Histórico & Linha do Tempo) */}
        <section className="max-w-[1440px] w-full mx-auto px-container-margin py-section-gap border-t border-white/5">
          <div className="bg-[#1c1b1b] rounded-xl border border-surface-variant relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
            
            <div className="p-6 md:p-12">
              <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface mb-12 flex items-center space-x-4 border-l-4 border-primary pl-4 font-bold uppercase tracking-wider">
                <span>Portfólio & Histórico</span>
                <span className="h-[1px] flex-grow bg-gradient-to-r from-outline-variant to-transparent"></span>
              </h2>

              <div className="relative border-l border-outline-variant ml-4 md:ml-6 space-y-12">
                
                {/* Milestone 2021 */}
                <div className="relative pl-8 md:pl-12">
                  <div className="absolute -left-[5px] top-1.5 w-[10px] h-[10px] bg-primary rounded-full drop-shadow-[0_0_8px_rgba(143,214,255,0.8)]"></div>
                  <div className="absolute -left-7 top-1 text-primary font-label-sm text-[10px] bg-background px-2 py-0.5 rounded-sm border border-outline-variant hidden md:block uppercase tracking-wider font-bold">2021</div>
                  <h3 className="font-display-lg text-xl font-bold text-on-surface mb-2 flex items-center gap-3">
                    <span className="md:hidden text-primary font-label-sm text-[10px] bg-surface-container px-2 py-0.5 rounded border border-outline-variant font-bold">2021</span>
                    Primeiro Campeonato de E-Sports
                  </h3>
                  <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                    Parceria com a Prefeitura Municipal de Paracatu e com a faculdade UniAtenas, dando vida ao primeiro grande torneio competitivo regional com palcos físicos e cobertura online básica.
                  </p>
                </div>

                {/* Milestone 2023 */}
                <div className="relative pl-8 md:pl-12">
                  <div className="absolute -left-[5px] top-1.5 w-[10px] h-[10px] bg-primary rounded-full drop-shadow-[0_0_8px_rgba(143,214,255,0.8)]"></div>
                  <div className="absolute -left-7 top-1 text-primary font-label-sm text-[10px] bg-background px-2 py-0.5 rounded-sm border border-outline-variant hidden md:block uppercase tracking-wider font-bold">2023</div>
                  <h3 className="font-display-lg text-xl font-bold text-on-surface mb-2 flex items-center gap-3">
                    <span className="md:hidden text-primary font-label-sm text-[10px] bg-surface-container px-2 py-0.5 rounded border border-outline-variant font-bold">2023</span>
                    Kosplay & Arena E-Sports
                  </h3>
                  <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-4">
                    Fusão dos campeonatos competitivos com a cultura pop oriental e competições de Cosplay. O evento triplicou o público físico presente e refinou nosso pipeline de transmissões ao vivo.
                  </p>
                  <div 
                    className="bg-cover bg-center w-full h-48 md:h-64 rounded-lg border border-surface-variant"
                    style={{ 
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlnCqHQec45spVY4DWxM6I388y9p3Dsmd4gXu1NNKEDoEKFSVVeKNdF--wpwdq91MXzgE4JtkwOOhOT4CyCBJL-KoRMXgR-sKpx_Kjh14yf6HTP3uvXL9yXpPaIugSHKdRRJRj9wnB8abHHj8eqCz1JYy7XnhLJy64kKJCmJxPuJI8R7fTAgDMDMCvfEwBfaQnsK17cozGd2Zuq_T8G6g8B7vQqKfGZQBZ8tCiHt3XTLuAK7rqm4cB')`
                    }}
                  />
                </div>

                {/* Milestone 2025 */}
                <div className="relative pl-8 md:pl-12">
                  <div className="absolute -left-[5px] top-1.5 w-[10px] h-[10px] bg-primary rounded-full drop-shadow-[0_0_8px_rgba(143,214,255,0.8)]"></div>
                  <div className="absolute -left-7 top-1 text-primary font-label-sm text-[10px] bg-background px-2 py-0.5 rounded-sm border border-outline-variant hidden md:block uppercase tracking-wider font-bold">2025</div>
                  <h3 className="font-display-lg text-xl font-bold text-on-surface mb-2 flex items-center gap-3">
                    <span className="md:hidden text-primary font-label-sm text-[10px] bg-surface-container px-2 py-0.5 rounded border border-outline-variant font-bold">2025</span>
                    Copa E-Games Paracatu
                  </h3>
                  <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-3">
                    Consolidação do ecossistema local. Operamos um campeonato de larga escala nas modalidades Counter-Strike e Free Fire, com infraestrutura de rede robusta e produção nível broadcast profissional.
                  </p>
                  <span className="inline-block bg-primary/20 text-primary border border-primary/50 px-3 py-1 rounded-lg font-label-sm text-xs uppercase font-bold tracking-widest drop-shadow-[0_0_8px_rgba(143,214,255,0.4)]">
                    4.1k+ Views Simultâneas
                  </span>
                </div>

                {/* Milestone 2026 */}
                <div className="relative pl-8 md:pl-12">
                  <div className="absolute -left-[5px] top-1.5 w-[10px] h-[10px] bg-background border-2 border-primary rounded-full animate-pulse"></div>
                  <div className="absolute -left-7 top-1 text-primary font-label-sm text-[10px] bg-background px-2 py-0.5 rounded-sm border border-primary hidden md:block uppercase tracking-wider font-bold shadow-[0_0_8px_rgba(143,214,255,0.3)]">2026</div>
                  <h3 className="font-display-lg text-xl font-bold text-on-surface mb-2 flex items-center gap-3">
                    <span className="md:hidden text-primary font-label-sm text-[10px] bg-surface-container px-2 py-0.5 rounded border border-primary font-bold">2026</span>
                    Espaço Técnico no Festival Japonês
                  </h3>
                  <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                    Operação e curadoria técnica integral do Espaço Tecnológico e E-sports no tradicional Festival da Cultura Japonesa da cidade, fundindo tecnologia interativa com as tradições.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Section: Contato (Iniciar Protocolo) */}
        <section 
          id="contato" 
          className="max-w-[1440px] w-full mx-auto px-container-margin py-section-gap border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface mb-4 font-bold uppercase tracking-widest">
              Iniciar <br/>
              <span className="text-primary text-glow">Protocolo</span>
            </h2>
            <p className="text-on-surface-variant font-body-md text-base leading-relaxed mb-8">
              Buscando patrocínio para sua marca, organização de campeonatos internos ou transmissões e-sports de alta qualidade? Preencha os dados e nossa equipe entrará na sua frequência.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-4 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-2xl">mail</span>
                <span className="font-label-sm text-sm tracking-wider font-bold">contato@tupahub.gg</span>
              </div>
              <div className="flex items-center space-x-4 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-2xl">hub</span>
                <span className="font-label-sm text-sm tracking-wider font-bold">Discord: TupãHub#0001</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1c1b1b] border border-surface-variant p-6 md:p-8 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div>
                <label className="block font-label-sm text-xs text-on-surface mb-2 uppercase tracking-widest font-bold">
                  Identificação (Nome / Empresa)
                </label>
                <input 
                  className="w-full bg-[#131313] border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[inset_0_0_8px_rgba(143,214,255,0.2)] transition-all outline-none text-sm placeholder:text-surface-variant" 
                  placeholder="Player 1 ou Empresa S.A." 
                  type="text"
                />
              </div>
              <div>
                <label className="block font-label-sm text-xs text-on-surface mb-2 uppercase tracking-widest font-bold">
                  Canal de Comunicação (E-mail / Telefone)
                </label>
                <input 
                  className="w-full bg-[#131313] border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[inset_0_0_8px_rgba(143,214,255,0.2)] transition-all outline-none text-sm placeholder:text-surface-variant" 
                  placeholder="comms@tupahub.gg" 
                  type="text"
                />
              </div>
              <div>
                <label className="block font-label-sm text-xs text-on-surface mb-2 uppercase tracking-widest font-bold">
                  Objetivo da Missão (Mensagem)
                </label>
                <textarea 
                  className="w-full bg-[#131313] border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[inset_0_0_8px_rgba(143,214,255,0.2)] transition-all outline-none text-sm placeholder:text-surface-variant resize-none" 
                  placeholder="Descreva as especificações do seu projeto ou dúvidas..." 
                  rows="4"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-[#003549] font-bold py-4 rounded-lg uppercase tracking-wider hover:bg-[#a8e0ff] hover:drop-shadow-[0_0_16px_rgba(143,214,255,0.6)] transition-all duration-300 flex justify-center items-center space-x-2 font-label-sm text-sm"
              >
                <span>Transmitir Dados</span>
                <span className="material-symbols-outlined text-sm font-bold">send</span>
              </button>
            </form>
          </div>
        </section>

        {/* Section: Infinite Partner Carousel */}
        <PartnerCarousel />

      </main>

      {/* Footer */}
      <Footer scrollToSection={scrollToSection} />

      {/* Vercel Web Analytics */}
      <Analytics />

      {/* Embedded fading effects */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;
