import React, { useState } from 'react';

export default function GameTabs() {
  const gamesData = [
    {
      id: 'cs2',
      name: 'Counter-Strike 2',
      genre: 'FPS',
      icon: 'chair',
      description: 'Ação tática em equipe de extrema precisão. Coordenação tática, controle de economia e reflexos rápidos decidem o vencedor.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzsi8GToli0BRDDscdd7Yvh4b4eXUo5w5Wi_sUaF-eCK-0eNoNf0wLXh6ByPwX5tOQry0GtbBEXvoZ7OJO7GCS-k1LBdheEdEdQ_4f9wqiEbS9i27K49cH5lmEZAllxVtpC-jLF9TV3E56EOrWuFjwoIXrzHZ7F6kTuzck1BhvTMlpxZaQhqMFAQJSOVMTfPrrSnJBrCOWqrXwC7P8W4zdwhuny3iMYgaeM9bW4X_jOW2-ZMyTBXmf',
      maps: ['Overpass', 'Nuke', 'Inferno', 'Mirage', 'Train', 'Dust II'],
      rules: [
        { title: 'Formato', value: '5v5 competitivo' },
        { title: 'Duração', value: 'MR12 (Melhor de 24 rounds)' },
        { title: 'Prorrogação', value: 'MR3 com $10,000 iniciais' },
        { title: 'C4 Timer', value: '40 segundos' }
      ]
    },
    {
      id: 'freefire',
      name: 'Free Fire',
      genre: 'Battle Royale',
      icon: 'local_fire_department',
      description: 'Sobrevivência intensa em alta velocidade. Equipes combatem em arenas dinâmicas de 48 jogadores em busca do BOOYAH!',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlnCqHQec45spVY4DWxM6I388y9p3Dsmd4gXu1NNKEDoEKFSVVeKNdF--wpwdq91MXzgE4JtkwOOhOT4CyCBJL-KoRMXgR-sKpx_Kjh14yf6HTP3uvXL9yXpPaIugSHKdRRJRj9wnB8abHHj8eqCz1JYy7XnhLJy64kKJCmJxPuJI8R7fTAgDMDMCvfEwBfaQnsK17cozGd2Zuq_T8G6g8B7vQqKfGZQBZ8tCiHt3XTLuAK7rqm4cB',
      maps: ['Bermuda', 'Purgatório', 'Alpine', 'Nova Terra'],
      rules: [
        { title: 'Formato', value: 'Squad (4v4) / Quedas de 48 jogadores' },
        { title: 'Pontuação de Abate', value: '1 ponto por eliminação' },
        { title: 'Pontos de Posição', value: '12pts (1º), 9pts (2º), 8pts (3º)...' },
        { title: 'Classificação', value: 'Pontos acumulados em 6 quedas' }
      ]
    },
    {
      id: 'valorant',
      name: 'Valorant',
      genre: 'Hero Shooter',
      icon: 'security',
      description: 'Onde a mira de alta precisão encontra habilidades sobrenaturais. Agentes táticos definem estratégias inovadoras a cada round.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6_71ur-MUnPaa8CyrSwI7K4WpIaBHd2cg3zYdmapTpgvAUBpAa3ZhCKiCpf7A52HHzhsVVYiSmx2u_sduc-zjbTS8k7JPr2-6tVMYB3Sn7f1OjoYJ0yw2iuBQOF_VxpQjJfBNXw0cSL2oKSlMKTTX8zbr41dF7nd2vuB_WytyJtWt-2TrZ8el1XKDxs171Sq4m02c0sN0xQ_DSiDnYMLhOiLnVylx9wCWizK2o6gFPcBTIIYwMR06',
      maps: ['Pearl', 'Fracture', 'Breeze', 'Icebox', 'Bind', 'Haven', 'Split', 'Ascent'],
      rules: [
        { title: 'Formato', value: '5v5 com personagens únicos' },
        { title: 'Duração', value: 'Melhor de 24 rodadas (Primeiro a 13)' },
        { title: 'Habilidades', value: 'Compradas na fase de compra' },
        { title: 'Prorrogação', value: 'Diferença de 2 rodadas com troca de lados' }
      ]
    },
    {
      id: 'lol',
      name: 'League of Legends',
      genre: 'MOBA',
      icon: 'strategy',
      description: 'Estratégia complexa e cooperação tática no Summoner\'s Rift. Conquiste as rotas, garanta objetivos neutros e destrua o Nexus adversário.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOntO7ZkJC780BmTHB2U4AIaJCnebByFmiR5p-sMiWMhgFxVwfHNuf6sfj4waugf3xe7L_9BdKZfx_vopJ3rGNI4ksThyH88UhWRhCJHfMnPRah-9USLfYhqyNa-OCBcJynJ0nUba8_q94DtR4k-ZcO0sSkzUL7Q_0fgIDYaTQrHN7-Yvf8VNSMRHUlSXPZ4q_2d4hCmvhSo4zNRxw63m9qT7iqG1u7H8grL8Folnw2RwvyIikd3XZ',
      maps: ['Summoner\'s Rift'],
      rules: [
        { title: 'Formato', value: '5v5 em mapa de 3 rotas' },
        { title: 'Modo de Jogo', value: 'Tournament Draft (Pick/Ban)' },
        { title: 'Playoffs', value: 'Melhor de 3 (BO3) / Finais BO5' },
        { title: 'Critério de Vitória', value: 'Destruição do Nexus' }
      ]
    },
    {
      id: 'fc25',
      name: 'EA Sports FC 25',
      genre: 'Esportes',
      icon: 'sports_soccer',
      description: 'O auge do futebol virtual. Controle tático, táticas customizadas de jogo e reflexos na marcação e finalização de jogadas.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKGgDbPPRMEvKbZeZ1R58dpawzlmUP3yzEJQkGAqAfw8RGLhXa7B5658EsuUoJv4fAdmRE07arWFGAF70fhLr7Np06eNtjPP19uzcza_btFgqzIgHpz7HDOa9KMzOC4vv_Y6MYt_H0EOg3FXzGFmpbml6K_IFZIv_4eZ9hR3K_OdxW8nBbWAMW3hJFyru9XQuDiUQjWNXqDC8soAGXllw46YvzOaIoi88za4srdvzIXYn8TlALpH04',
      maps: ['Wembley', 'Santiago Bernabéu', 'San Siro', 'Camp Nou'],
      rules: [
        { title: 'Formato', value: '1v1 competitivo' },
        { title: 'Duração', value: 'Tempo de jogo: 6 minutos por tempo' },
        { title: 'Marcação', value: 'Defesa Tática obrigatória' },
        { title: 'Velocidade', value: 'Padrão online' }
      ]
    }
  ];

  const [activeTab, setActiveTab] = useState('cs2');
  const activeGame = gamesData.find(game => game.id === activeTab);

  return (
    <div className="w-full">
      {/* Tab Selector Buttons */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10">
        {gamesData.map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveTab(game.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg border font-bold uppercase tracking-wider text-sm transition-all duration-300 ${
              activeTab === game.id
                ? 'bg-primary text-[#003549] border-primary shadow-[0_0_15px_rgba(143,214,255,0.4)]'
                : 'bg-[#1A1A1A] border-[#242424] text-on-surface-variant hover:border-primary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{game.icon}</span>
            {game.name}
          </button>
        ))}
      </div>

      {/* Dynamic Game Detail Card */}
      <div className="game-card bg-[#1A1A1A] border border-[#242424] rounded-xl p-6 md:p-8 hover-neon-glow flex flex-col lg:flex-row gap-8 transition-all duration-300">
        
        {/* Game Image */}
        <div className="w-full lg:w-1/2 rounded-xl overflow-hidden relative min-h-[300px] border border-white/5 shadow-2xl">
          <img 
            src={activeGame.image} 
            alt={activeGame.name} 
            className="object-cover w-full h-full min-h-[300px] transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-4 py-1.5 rounded-lg border border-white/10 font-label-sm text-xs text-on-surface uppercase flex items-center gap-2 font-bold tracking-wider">
            <span className="material-symbols-outlined text-sm text-primary">{activeGame.icon}</span>
            {activeGame.genre}
          </div>
        </div>

        {/* Game Details */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h2 className="font-display-lg text-3xl font-bold text-on-surface mb-3 tracking-wide">{activeGame.name}</h2>
              <p className="font-body-md text-base text-on-surface-variant leading-relaxed">{activeGame.description}</p>
            </div>

            {/* Active Map Pool */}
            <div>
              <span className="font-label-sm text-primary uppercase tracking-widest block mb-3 font-bold text-xs">
                {activeGame.id === 'fc25' ? 'Estádios Homologados' : 'Map Pool Ativo'}
              </span>
              <div className="flex flex-wrap gap-2">
                {activeGame.maps.map((map) => (
                  <span 
                    key={map} 
                    className="map-chip font-label-sm text-primary px-4 py-1.5 rounded-full uppercase text-xs font-semibold tracking-wider"
                  >
                    {map}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Scoring Rules List */}
          <div className="mt-8 bg-surface-container-low p-5 rounded-lg border border-white/5">
            <span className="font-label-sm text-on-surface uppercase tracking-widest block mb-4 border-b border-white/10 pb-2 font-bold text-xs">
              Protocolo Competitivo e Regras
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGame.rules.map((rule) => (
                <div key={rule.title} className="flex flex-col">
                  <span className="text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">{rule.title}</span>
                  <span className="text-on-surface font-semibold text-sm mt-0.5">{rule.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
