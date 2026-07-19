import React, { useState, useEffect, useRef } from 'react';
import { ADMIN_EMAIL } from '../constants/auth';

export default function Header({ activeSection, scrollToSection, currentRoute, session }) {
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'quem-somos', label: 'Quem Somos' },
    { id: 'modalidades', label: 'Modalidades' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'cases', label: 'Cases' },
    { id: 'contato', label: 'Contato' }
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLandingRoute = !currentRoute || currentRoute === '#/';
  const isAdminRoute = session?.user?.email === ADMIN_EMAIL;
  const adminHref = isAdminRoute ? '#/painel-metricas' : '#/login';

  return (
    <header className="bg-[#131313]/90 backdrop-blur-md font-display-lg text-body-md uppercase tracking-wider docked full-width top-0 sticky z-50 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center w-full px-container-margin py-4 max-w-[1440px] mx-auto">
        {/* Brand / Logo */}
        <a 
          href="#/"
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
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-3 lg:gap-6 items-center">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`px-3 py-1.5 rounded text-xs lg:text-sm font-semibold tracking-widest uppercase transition-all duration-200 scale-95 active:scale-90 focus:outline-none ${
                isLandingRoute && activeSection === link.id
                  ? 'text-primary border-b-2 border-primary pb-0.5'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {link.label}
            </button>
          ))}

          {/* New Screens Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`px-3 py-1.5 rounded text-xs lg:text-sm font-semibold tracking-widest uppercase transition-all duration-200 scale-95 active:scale-90 focus:outline-none flex items-center gap-1 ${
                !isLandingRoute ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span>Festival Japão</span>
              <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-surface-container-high border border-white/10 py-2 shadow-2xl z-50 animate-fadeIn normal-case font-body-md text-xs font-medium">
                <a 
                  href="#/campeonato-1v1" 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-on-surface hover:bg-primary/10 hover:text-primary transition-colors border-b border-white/5"
                >
                  <span className="material-symbols-outlined text-sm text-primary">emoji_events</span>
                  <span>Portal do Campeonato 1v1</span>
                </a>
                <a 
                  href="#/agendamento-estande" 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-on-surface hover:bg-primary/10 hover:text-primary transition-colors border-b border-white/5"
                >
                  <span className="material-symbols-outlined text-sm text-primary">qr_code_scanner</span>
                  <span>Agendar Experiência</span>
                </a>
                <a 
                  href={adminHref} 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-on-surface hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-primary">admin_panel_settings</span>
                  <span>Console do Admin</span>
                </a>
              </div>
            )}
          </div>
        </nav>

        {/* Actions / CTA or Avatar */}
        <div className="flex items-center gap-4">
          {isAdminRoute ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="font-label-sm text-xs text-secondary-fixed bg-secondary-container/20 border border-secondary-container/30 px-2.5 py-1 rounded font-bold uppercase tracking-wider">Admin</span>
              <img 
                className="w-10 h-10 rounded-full border border-primary neon-glow-primary object-cover" 
                alt="Admin Avatar" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwfTxb3HBF1na2oZ7D74QCSav5ae85soh4Fy18iBN6e9EmBQqUaTy1UGnLnVrP28iKS72vqUpGUYnXkPf08Gc2lL4ZBZi0TPV3yTJReaf9eWwMVheN-qAv3g14p7lN97egaer13DUeQf60qoRFuMkUFoRwxtOiomSUULeEsZNGAUYI2bGMCZRzdnlyTIPPL94cG2ExFtdFf3anj-mnS4hPGWUxWdCdh460AZwG2zibXTwLPMolMldy"
              />
            </div>
          ) : (
            <button 
              onClick={() => scrollToSection('contato')}
              className="hidden md:flex items-center gap-2 bg-[#8fd6ff] text-[#003549] px-5 py-2.5 rounded font-bold hover:shadow-[0_0_20px_rgba(143,214,255,0.8)] hover:bg-[#a8e0ff] transition-all font-label-sm text-xs tracking-wider"
            >
              Join the Storm
              <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </button>
          )}

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
                isLandingRoute && activeSection === link.id
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {link.label}
            </button>
          ))}
          
          <div className="border-t border-white/5 pt-3 mt-3">
            <span className="block px-3 py-1 text-[10px] text-outline uppercase font-bold tracking-widest">Festival do Japão</span>
            <a 
              href="#/campeonato-1v1"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-left py-2.5 px-3 rounded text-sm text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-sm">emoji_events</span>
              <span>Torneio 1v1</span>
            </a>
            <a 
              href="#/agendamento-estande"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-left py-2.5 px-3 rounded text-sm text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
              <span>Agendar Estande</span>
            </a>
            <a 
              href={adminHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-left py-2.5 px-3 rounded text-sm text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              <span>Console do Admin</span>
            </a>
          </div>

          {!isAdminRoute && (
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
          )}
        </div>
      )}
    </header>
  );
}

