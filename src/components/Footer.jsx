import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#0e0e0e] font-body-md text-label-sm full-width py-section-gap bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] border-t border-white/5 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-container-margin max-w-[1440px] mx-auto">
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
          <div className="font-display-lg text-headline-lg text-on-surface text-glow font-bold">Tupã Hub</div>
          <p className="text-secondary opacity-70 max-w-sm text-sm">
            © {new Date().getFullYear()} Tupã Hub. Todos os direitos reservados. Tecnologia & Power.
          </p>
        </div>
        
        <div className="col-span-1 flex flex-col gap-3">
          <span className="text-primary font-bold uppercase tracking-wider text-xs border-b border-white/10 pb-1 mb-1">Políticas</span>
          <a className="text-outline hover:text-primary transition-colors text-sm hover:underline" href="#privacy">Privacy Policy</a>
          <a className="text-outline hover:text-primary transition-colors text-sm hover:underline" href="#terms">Terms of Service</a>
          <a className="text-outline hover:text-primary transition-colors text-sm hover:underline" href="#press">Press Kit</a>
        </div>
        
        <div className="col-span-1 flex flex-col gap-3">
          <span className="text-primary font-bold uppercase tracking-wider text-xs border-b border-white/10 pb-1 mb-1">Comunidade</span>
          <a className="text-outline hover:text-primary transition-colors text-sm flex items-center gap-2 hover:underline" href="https://discord.gg" target="_blank" rel="noreferrer">
            Discord
          </a>
          <a className="text-outline hover:text-primary transition-colors text-sm flex items-center gap-2 hover:underline" href="https://linkedin.com" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
