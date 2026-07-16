import React from 'react';

export default function PartnerCarousel() {
  const partners = [
    { name: 'Prefeitura de Paracatu' },
    { name: 'Secretaria de Esportes' },
    { name: 'UniAtenas' },
    { name: 'Audicope - JJA' },
    { name: 'Movimento Inovatu' }
  ];

  // Double the list to make infinite scroll seamless
  const duplicatedPartners = [...partners, ...partners, ...partners];

  return (
    <section className="py-section-gap bg-[#1c1b1b] border-y border-white/5 overflow-hidden w-full relative z-10">
      <div className="max-w-[1440px] mx-auto px-container-margin flex flex-col items-center gap-8">
        <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface text-center uppercase tracking-widest">
          Eles confiam na <span className="text-primary text-glow">tempestade</span>
        </h2>
        
        {/* Infinite Scroll Wrapper */}
        <div className="w-full relative overflow-hidden mask-gradient py-4">
          <div className="flex gap-8 w-max animate-infinite-scroll hover:[animation-play-state:paused]">
            {duplicatedPartners.map((partner, idx) => (
              <div 
                key={`${partner.name}-${idx}`} 
                className="h-20 w-44 bg-surface-container flex items-center justify-center rounded-lg border border-surface-variant p-4 text-center hover:border-primary hover:shadow-[0_0_15px_rgba(143,214,255,0.2)] transition-all cursor-pointer select-none"
              >
                <span className="font-label-sm text-xs md:text-sm text-on-surface-variant group-hover:text-primary font-bold uppercase tracking-wider">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Gradient Mask for fading edges (added directly here in style block for self-containment) */}
      <style>{`
        .mask-gradient {
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
      `}</style>
    </section>
  );
}
