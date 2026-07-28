import React from 'react';

const FestivalJapao = () => {
  return (
    <main className="flex-grow pt-24 relative overflow-hidden bg-white">
      {/* Background Patterns */}
      <div className="absolute inset-0 bg-seigaiha pointer-events-none z-0"></div>
      {/* Red overlay on left side as seen in reference */}
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#900000] to-transparent pointer-events-none z-0 opacity-80"></div>
      <div className="absolute inset-0 bg-red-glow pointer-events-none z-0"></div>
      
      <div className="max-w-[1200px] mx-auto px-6 py-12 relative z-10 flex flex-col items-center">
        {/* Top Section: Headline & Dates */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          
          {/* Headline */}
          <div className="md:w-1/2">
            <h1 className="font-display-lg font-bold text-5xl md:text-6xl text-white md:text-black leading-tight drop-shadow-lg md:drop-shadow-none">
              VIVA A<br/>ESSÊNCIA<br/>DO JAPÃO.
            </h1>
          </div>
          
          {/* Festival Logo and Dates */}
          <div className="md:w-1/2 flex flex-col items-center md:items-end gap-6 relative md:translate-x-12 lg:translate-x-20">
            {/* The giant red sun behind the logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#e60012] rounded-full blur-2xl opacity-60 z-0"></div>
            <img 
              alt="Festival da Cultura Japonesa de Paracatu" 
              className="w-64 md:w-80 object-contain relative z-10 drop-shadow-md" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH9ZAQ6ki3S8Xee7lBFdzRIAWjkBVFsZcELAD2udwqrKSIez5gGgrORZNugtrPPscs-OJjE8cdhBJe5Hj-tK3RyGulBPYkfNkeKUfTBvkMixSwXbf3xYkzL5RX4VTJoNgUerVD8LZKBwJ_m_oSbuILg5rtY6wm1IETFImNBTsHafFsKVUm6IZFa6rzETAfzDq99vx0Ic-do9mIZWGViEzjCWPwZSzGwU8JQZ7VinOEcnBMB009N77KhAOYhE2TLgKGBg" 
            />
            <div className="text-right">
              <p className="font-display-lg font-bold text-2xl md:text-3xl text-black">
                <span className="text-[#e60012]">31</span> de Julho e
              </p>
              <p className="font-display-lg font-bold text-2xl md:text-3xl text-[#e60012] border-b-2 border-[#e60012] inline-block pb-1">
                <span className="text-[#e60012]">01</span> de Agosto
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Cards Section */}
        <div className="w-full grid md:grid-cols-2 gap-8 mb-16">
          {/* Experience Card */}
          <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center text-center transition-transform hover:scale-95 border border-gray-200">
            <h3 className="font-display-lg font-bold text-2xl text-black mb-4">EXPERIÊNCIAS</h3>
            <p className="font-body-md text-gray-600 mb-6">Participe de oficinas, workshops e vivências culturais únicas.</p>
            <a 
              href="#/agendamento-estande" 
              className="bg-[#e60012] text-white font-display-lg font-bold py-4 px-8 rounded-full uppercase tracking-widest transition-colors hover:bg-black"
            >
              Inscrever-se em uma Experiência
            </a>
          </div>
          
          {/* Championship Card */}
          <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center text-center transition-transform hover:scale-95 border border-gray-200">
            <h3 className="font-display-lg font-bold text-2xl text-black mb-4">CAMPEONATO 1V1</h3>
            <p className="font-body-md text-gray-600 mb-6">Mostre suas habilidades e compita no grande torneio do festival.</p>
            <a 
              href="#/campeonato-1v1" 
              className="bg-[#e60012] text-white font-display-lg font-bold py-4 px-8 rounded-full uppercase tracking-widest transition-colors hover:bg-black"
            >
              Inscrever-se no Campeonato 1V1
            </a>
          </div>
        </div>
        
        {/* About Section */}
        <section className="w-full bg-[#5a0b0b] rounded-xl p-8 md:p-12 text-center shadow-2xl mb-16 relative overflow-hidden">
          {/* Subtle gradient overlay on the dark red box */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h3 className="font-display-lg font-bold text-2xl text-white mb-6 tracking-widest uppercase">SOBRE O EVENTO</h3>
            <p className="font-body-md text-gray-200 leading-relaxed text-sm md:text-base">
              O Festival da Cultura Japonesa de Paracatu é um municipal evento de uma nova imersão de descontam para aportar as novo desapontamento a experiência, expõem as capacidades que assim tem e renasce a experiência nos atritos.
            </p>
          </div>
        </section>
        
        {/* Sponsors Section */}
        <section className="w-full text-center pb-12">
          <h4 className="font-display-lg font-bold text-xl text-black mb-8 uppercase tracking-widest">PATROCINADORES</h4>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {/* Realização */}
            <div className="flex items-center gap-4">
              <span className="font-body-md text-xs font-semibold text-gray-600 tracking-wider">REALIZAÇÃO:</span>
              <img 
                alt="ACENP" 
                className="h-12 w-auto object-contain mix-blend-multiply" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaKy6BCeLYF8yLEqz6aWiIUBF104OePD2aUWImznBc94ExnHU_2sT64hpEhBU6q-VVDzPRAargdIO6K_dsMpdwxGkdF1kvYbCM1UY0nhdGvo01cFSDs9Fi_Id05SUbBMOBs3UjtnAJq9BfF6GJhc7UE6XUDFSNrtb_kbq2KxdggUHhduV_hLKX7YWcXemYKadyeE94x8WZdibdxTOgms8ian7SlE-IEshQl7h2S-Vnhk7YJN76-QL4sLXnXIw_V9ZuqdOnlaP8aP0zsA" 
              />
            </div>
            {/* Apoio 1 */}
            <div className="flex items-center gap-4">
              <span className="font-body-md text-xs font-semibold text-gray-600 tracking-wider">APOIO:</span>
              <img 
                alt="Prefeitura Paracatu" 
                className="h-10 w-auto object-contain mix-blend-multiply" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDj7PJDOwDPWzEdjwSs_TOp72AGZLSFlJTu1GtT6XPl05IdefPPfJqcoLhVHh4JHRfxgICueGTcraqv81k0qRYPyd_fyL6QVUHxqKYHPFWbZrtRJ1UdReSiJu2N6gQLoJedT4O2R-T1PmzCbLPfpLvzKkZSNWVcd1XCXPCOvVxBbPLQk_gJWxhtd_sGNjS5GjfzvUaBUYDvLPrOM5C1f1WpAPX3j4mklmheJRmZGI5a-bJLz5BsCrMqeG_UmkgYrI5lnWYIIlMbHWYLvQ" 
              />
            </div>
          </div>
        </section>
        
      </div>
    </main>
  );
};

export default FestivalJapao;
