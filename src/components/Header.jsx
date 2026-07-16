import React, { useState } from 'react';

export default function Header({ activeSection, scrollToSection }) {
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'quem-somos', label: 'Quem Somos' },
    { id: 'modalidades', label: 'Modalidades' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'cases', label: 'Cases' },
    { id: 'contato', label: 'Contato' }
  ];

  return (
    <header className="bg-[#131313]/90 backdrop-blur-md font-display-lg text-body-md uppercase tracking-wider docked full-width top-0 sticky z-50 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center w-full px-container-margin py-4 max-w-[1440px] mx-auto">
        {/* Brand / Logo */}
        <button 
          onClick={() => scrollToSection('home')}
          className="flex items-center gap-3 font-display-lg text-headline-lg font-bold text-primary drop-shadow-[0_0_12px_rgba(143,214,255,0.5)] scale-95 active:scale-90 transition-transform focus:outline-none"
        >
          {!logoError ? (
            <img 
              src="/image_772fa1.jpg" 
              alt="Tupã Hub Logo" 
              className="h-10 w-auto rounded object-contain border border-white/10"
              onError={() => setLogoError(true)}
            />
          ) : null}
          <span className="text-glow">Tupã Hub</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-4 lg:gap-8 items-center">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`px-3 py-1.5 rounded text-sm font-semibold tracking-widest uppercase transition-all duration-200 scale-95 active:scale-90 focus:outline-none ${
                activeSection === link.id
                  ? 'text-primary border-b-2 border-primary pb-0.5'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Join CTA */}
        <button 
          onClick={() => scrollToSection('contato')}
          className="hidden md:flex items-center gap-2 bg-[#8fd6ff] text-[#003549] px-5 py-2.5 rounded font-bold hover:shadow-[0_0_20px_rgba(143,214,255,0.8)] hover:bg-[#a8e0ff] transition-all font-label-sm text-xs tracking-wider"
        >
          Join the Storm
          <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </button>

        {/* Mobile Menu Icon */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-primary p-2 focus:outline-none"
        >
          <span className="material-symbols-outlined text-3xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#131313] border-t border-white/10 px-container-margin py-4 space-y-3 animate-fadeIn">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                scrollToSection(link.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 px-3 rounded text-sm font-bold tracking-wider uppercase ${
                activeSection === link.id
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button 
            onClick={() => {
              scrollToSection('contato');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded font-bold hover:shadow-[0_0_12px_rgba(143,214,255,0.8)] transition-all font-label-sm text-xs uppercase"
          >
            Join the Storm
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </button>
        </div>
      )}
    </header>
  );
}
