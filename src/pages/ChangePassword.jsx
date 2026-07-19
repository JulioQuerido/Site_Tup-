import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Validation checks
  const isLengthValid = newPassword.length >= 8;
  const isUpperValid = /[A-Z]/.test(newPassword);
  const isNumberValid = /[0-9]/.test(newPassword);
  const isMatching = newPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isLengthValid || !isUpperValid || !isNumberValid) {
      setErrorMsg('Por favor, preencha todos os requisitos de segurança.');
      return;
    }

    if (!isMatching) {
      setErrorMsg('As senhas não coincidem!');
      return;
    }

    setSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setErrorMsg('Sessão expirada. Faça login novamente para trocar a senha.');
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 1500);
        return;
      }

      // 1. Update the password in Supabase
      const { error: passError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (passError) {
        setErrorMsg(passError.message || 'Falha ao atualizar a senha.');
        setSubmitting(false);
        return;
      }

      // 2. Set first_login metadata to false
      const { error: metaError } = await supabase.auth.updateUser({ 
        data: { first_login: false } 
      });

      if (metaError) {
        console.warn('Metadata update failed but password was updated:', metaError.message);
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.hash = '#/painel-metricas';
      }, 1200);

    } catch (err) {
      console.error('Falha ao atualizar senha:', err);
      setErrorMsg('Erro inesperado de rede. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-container-margin relative overflow-hidden py-12">
      {/* Background Aesthetic Elements */}
      <div className="absolute inset-0 bg-grid-tech opacity-20 pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary-container/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <main className="w-full max-w-[480px] z-10 flex flex-col items-center relative">
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center">
          <img 
            alt="Tupã Hub Logo" 
            className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_15px_rgba(143,214,255,0.4)]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6fz0St4TOV7E5SKYbuqO3qvafbOyK8UVHKiKNVNdA2bQZfNMahH2kFIEHvd4KQ7_pJcK4XW_VqpqQB5uYTvcodNUpoxBA92Fsp1nSjqzkRrB_PtdLO9iQFB5L0pHymb8QfjnCrle3xdlLq_ewD_Phc-3jlR6Ae8v6-kNaGyvJlHXPyBsrRIK9dANUhgrwwP-ki3ShrlgUNDF-JM9nOe7EK_xK9j_HEUCahVw6xMlyza693S7JsSn7FFn6C8BxA8Lb2Q"
          />
          <h1 className="font-display-lg text-2xl text-primary mt-2 uppercase tracking-widest font-bold text-glow">Tupã Hub</h1>
        </div>

        {/* Alert Message */}
        <div className="w-full mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-4 animate-bounce-subtle">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          <div>
            <p className="font-body-md text-on-surface text-sm font-semibold leading-tight">
              Primeiro acesso detectado.
            </p>
            <p className="font-body-md text-on-surface-variant text-xs mt-1">
              Por motivos de segurança, crie uma nova senha para continuar.
            </p>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-surface-container/80 backdrop-blur-lg border border-white/5 w-full rounded-xl p-8 shadow-2xl relative">
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-xl"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6" id="passwordForm">
            {errorMsg && (
              <div className="bg-error-container/20 border border-error/30 text-error p-3 rounded text-xs animate-fadeIn">
                {errorMsg}
              </div>
            )}

            {/* New Password Field */}
            <div className="space-y-2">
              <label className="block font-body-md text-xs uppercase tracking-wider text-on-surface-variant font-bold" htmlFor="new-password">Nova Senha</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3.5 pl-12 pr-12 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-outline-variant/30 text-sm outline-none font-body-md" 
                  id="new-password" 
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={submitting || success}
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors focus:outline-none" 
                  onClick={() => setShowNew(!showNew)} 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showNew ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block font-body-md text-xs uppercase tracking-wider text-on-surface-variant font-bold" htmlFor="confirm-password">Confirmar Nova Senha</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">verified_user</span>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3.5 pl-12 pr-12 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-outline-variant/30 text-sm outline-none font-body-md" 
                  id="confirm-password" 
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={submitting || success}
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors focus:outline-none" 
                  onClick={() => setShowConfirm(!showConfirm)} 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Validation List */}
            <div className="space-y-3 pt-2">
              <div className={`flex items-center gap-3 transition-colors duration-300 ${isLengthValid ? 'text-primary' : 'text-outline'}`} id="req-length">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isLengthValid ? "'FILL' 1" : "'FILL' 0" }}>check_circle</span>
                <span className="font-body-md text-xs font-semibold">Mínimo 8 caracteres</span>
              </div>
              <div className={`flex items-center gap-3 transition-colors duration-300 ${isUpperValid ? 'text-primary' : 'text-outline'}`} id="req-upper">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isUpperValid ? "'FILL' 1" : "'FILL' 0" }}>check_circle</span>
                <span className="font-body-md text-xs font-semibold">Uma letra maiúscula</span>
              </div>
              <div className={`flex items-center gap-3 transition-colors duration-300 ${isNumberValid ? 'text-primary' : 'text-outline'}`} id="req-number">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isNumberValid ? "'FILL' 1" : "'FILL' 0" }}>check_circle</span>
                <span className="font-body-md text-xs font-semibold">Um número</span>
              </div>
            </div>

            {/* Action Button */}
            <button 
              className={`w-full py-4 rounded-lg font-display text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 font-bold border ${
                success 
                  ? 'bg-green-500 text-white border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                  : 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/30 hover:shadow-[0_0_20px_rgba(143,214,255,0.3)] hover:scale-[1.01] active:scale-95'
              }`} 
              type="submit"
              disabled={submitting || success}
            >
              {submitting ? (
                <>
                  <span>Salvando no Supabase...</span>
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                </>
              ) : success ? (
                <>
                  <span>Senha Atualizada</span>
                  <span className="material-symbols-outlined text-sm">check</span>
                </>
              ) : (
                <>
                  <span>Salvar Nova Senha e Acessar</span>
                  <span className="material-symbols-outlined">bolt</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="font-body-md text-xs text-outline opacity-60 font-semibold uppercase tracking-wider">
            © 2026 Tupã Hub. All rights reserved. Secured by Supabase.
          </p>
        </footer>
      </main>
    </div>
  );
}
