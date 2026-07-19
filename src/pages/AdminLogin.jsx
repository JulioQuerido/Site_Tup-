import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { ADMIN_EMAIL } from '../constants/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const cardRef = useRef(null);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(1000px) rotateX(${y * -0.01}deg) rotateY(${x * 0.01}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  const shakeCard = () => {
    if (cardRef.current) {
      cardRef.current.animate([
        { transform: 'translateX(0px)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(0px)' }
      ], {
        duration: 400,
        iterations: 1
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setErrorMsg(error.message || 'Credenciais inválidas. Tente novamente.');
        shakeCard();
        return;
      }

      const user = data?.user;

      // Checagem de conveniencia para dar mensagem clara ao usuario errado.
      // A autorizacao real e feita pelas policies de RLS no Supabase.
      if (user?.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        setErrorMsg('Acesso negado. Apenas o usuário master está autorizado.');
        shakeCard();
        return;
      }

      const isFirstLogin = user?.user_metadata?.first_login !== false;
      window.location.hash = isFirstLogin ? '#/alterar-senha' : '#/painel-metricas';
    } catch (err) {
      console.error('Falha ao autenticar:', err);
      setErrorMsg('Falha de conexão com o servidor. Tente novamente em instantes.');
      shakeCard();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center min-h-screen bg-background relative selection:bg-primary/30 py-12">
      {/* Atmosphere Layer */}
      <div className="fixed inset-0 bg-grid-tech opacity-20 pointer-events-none z-0"></div>
      
      {/* Decorative Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-[440px] px-container-margin">
        {/* Voltar para o site institucional */}
        <div className="mb-4">
          <a
            href="#/"
            className="inline-flex items-center gap-2 text-outline-variant hover:text-primary transition-colors font-label-sm text-xs font-semibold uppercase tracking-wider focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Voltar para o site
          </a>
        </div>

        {/* Glass Card */}
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="bg-surface-container/80 backdrop-blur-lg border border-white/5 shadow-2xl rounded-xl p-8 md:p-10 transition-transform duration-300 ease-out"
        >
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <img 
                alt="Tupã Hub Logo" 
                className="w-32 h-32 object-contain drop-shadow-[0_0_15px_rgba(143,214,255,0.4)] group-hover:scale-105 transition-transform duration-500" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbAiOvIWZUusJGa53Q8qcs6xEQjvMPgbrDyX7CDmvHRBqkxWHn9xSvyFJC0irXvynX8ijJYC3VSwW4uldmDP5c0IDIh0dl12EpJ1TNoXiZQ5E_SovKKEIiry3busyR0-Jb-4OGnLNb1ZC7z0BG2dJNHnPw4RSQ1BzXOMXg85Udct9mEbadLbi_rqAXtgc9UiegDKtc37jWpc2wJhJyhfyNO1TQsvZ2eqJneSWTN2_JEPfSKua0petYdKftHR5Zgi-EDA"
              />
            </div>
            <h1 className="font-display-lg text-2xl text-on-surface mt-4 tracking-tight uppercase font-semibold">Admin Login</h1>
            <div className="h-1 w-12 bg-primary rounded-full mt-2 shadow-[0_0_8px_#8fd6ff]"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6" id="loginForm">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest block ml-1" htmlFor="email">E-mail de Acesso</label>
              <div className="relative rounded-lg bg-[#0e0e0e] border border-outline-variant/30 focus-within:border-primary focus-within:shadow-[0_0_10px_rgba(143,214,255,0.1)] transition-all duration-200">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">alternate_email</span>
                <input 
                  className="w-full bg-transparent border-none py-4 pl-12 pr-4 text-on-surface font-body-md text-sm focus:outline-none focus:ring-0 placeholder:text-outline/40" 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e-mail" 
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest block ml-1" htmlFor="password">Senha Segura</label>
              <div className="relative rounded-lg bg-[#0e0e0e] border border-outline-variant/30 focus-within:border-primary focus-within:shadow-[0_0_10px_rgba(143,214,255,0.1)] transition-all duration-200">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input 
                  className="w-full bg-transparent border-none py-4 pl-12 pr-12 text-on-surface font-body-md text-sm focus:outline-none focus:ring-0 placeholder:text-outline/40" 
                  id="password" 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  disabled={submitting}
                />
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none" 
                  onClick={togglePassword} 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]" id="eye-icon">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 py-4 rounded-lg font-display-lg text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(143,214,255,0.1)] hover:shadow-[0_0_25px_rgba(143,214,255,0.3)] transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] font-bold disabled:opacity-50" 
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span>Conectando...</span>
                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </>
              ) : (
                <>
                  <span>Entrar no Dashboard</span>
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </>
              )}
            </button>

            {/* Error Message */}
            <div className={`flex flex-col items-center gap-1 text-error font-body-md text-sm text-center transition-opacity duration-300 ${errorMsg ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]" style={{ textShadow: '0 0 8px rgba(255, 180, 171, 0.5)' }}>warning</span>
                <span style={{ textShadow: '0 0 8px rgba(255, 180, 171, 0.5)' }}>{errorMsg}</span>
              </div>
            </div>
          </form>

          {/* Links */}
          <div className="mt-8 pt-8 border-t border-outline-variant/10 flex justify-between items-center text-xs font-label-sm">
            <a className="text-outline hover:text-secondary transition-colors uppercase tracking-tight font-semibold" href="#">Esqueci a senha</a>
            <span className="text-outline/30">•</span>
            <a className="text-outline hover:text-secondary transition-colors uppercase tracking-tight font-semibold" href="#">Suporte Técnico</a>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-8 text-center text-outline/40 font-label-sm text-[10px] uppercase tracking-widest font-bold">
          © 2026 Tupã Hub • Conectado via Supabase
        </footer>
      </main>
    </div>
  );
}
