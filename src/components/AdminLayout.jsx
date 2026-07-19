import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminLayout({ children, currentRoute }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentRoute]);

  const navItems = [
    { name: 'Dashboard', path: '#/painel-metricas', icon: 'dashboard' },
    { name: 'Staff Check-in', path: '#/admin/checkin', icon: 'qr_code_scanner' },
    { name: 'Campeonatos', path: '#/admin/campeonatos', icon: 'emoji_events' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = '#/';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-body-lg text-on-background overflow-hidden relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-surface-container-high border-b border-white/5 p-4 z-50 relative">
        <h1 className="font-display-lg text-xl font-bold uppercase tracking-widest text-primary drop-shadow-[0_0_10px_rgba(143,214,255,0.5)]">
          Tupã Admin
        </h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-on-surface p-2 focus:outline-none"
        >
          <span className="material-symbols-outlined text-3xl">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-64 bg-surface-container-high md:border-r border-white/5 
        absolute md:relative z-40 h-[calc(100vh-73px)] md:h-screen top-[73px] md:top-0
        transition-all duration-300
      `}>
        <div className="hidden md:flex flex-col p-6 border-b border-white/5">
          <h1 className="font-display-lg text-2xl font-bold uppercase tracking-widest text-primary drop-shadow-[0_0_10px_rgba(143,214,255,0.5)]">
            Tupã Hub
          </h1>
          <span className="text-xs text-on-surface-variant font-label-sm tracking-widest mt-1">
            CONSOLE DO ADMIN
          </span>
        </div>

        <nav className="flex-grow flex flex-col p-4 gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentRoute === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-label-sm tracking-wide text-sm font-bold uppercase
                  ${isActive 
                    ? 'bg-primary/10 text-primary border border-primary/30 neon-glow-primary shadow-[0_0_15px_rgba(143,214,255,0.15)]' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface border border-transparent'
                  }
                `}
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                {item.name}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <a
            href="#/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-label-sm tracking-wide text-sm font-bold uppercase text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface border border-transparent"
          >
            <span className="material-symbols-outlined text-xl">home</span>
            Voltar ao Site
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-label-sm tracking-wide text-sm font-bold uppercase text-error hover:bg-error/10 hover:text-error-fixed border border-transparent hover:border-error/30"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-[calc(100vh-73px)] md:h-screen overflow-y-auto relative">
        {children}
      </div>
    </div>
  );
}
