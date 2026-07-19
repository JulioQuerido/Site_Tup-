import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { addBooking, normalizeVisitor } from '../utils/storage';

/** Monta o comprovante exibido ao visitante a partir do registro normalizado. */
function toTicket(visitor) {
  const criadoEm = visitor.created_at ? new Date(visitor.created_at) : new Date();
  return {
    id: visitor.id || `TUPA-${Math.floor(100000 + Math.random() * 900000)}`,
    name: visitor.name,
    whatsapp: visitor.whatsapp,
    experiences: visitor.experiences,
    date: criadoEm.toLocaleDateString('pt-BR'),
    time: criadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function StandBooking() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    experiences: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [errors, setErrors] = useState({});

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa o erro do campo assim que o usuario comeca a corrigi-lo.
    setErrors(prev => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const nextExps = checked 
        ? [...prev.experiences, value] 
        : prev.experiences.filter(exp => exp !== value);
      return { ...prev, experiences: nextExps };
    });
    setErrors(prev => (prev.experiences ? { ...prev, experiences: undefined } : prev));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (formData.name.trim().split(/\s+/).filter(Boolean).length < 2) {
      nextErrors.name = 'Insira seu nome completo (nome e sobrenome).';
    }

    const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    if (!phoneRegex.test(formData.whatsapp.replace(/\s+/g, ''))) {
      nextErrors.whatsapp = 'Insira um número de WhatsApp válido com DDD.';
    }

    if (formData.experiences.length === 0) {
      nextErrors.experiences = 'Selecione pelo menos uma atração.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Sem `.select()` de proposito: ele vira INSERT ... RETURNING, que exige
      // permissao de leitura na tabela. O visitante anonimo pode se inscrever
      // mas nao pode ler a lista de inscritos (telefones de terceiros), entao
      // pedir o retorno faria o Postgres rejeitar a operacao inteira (42501).
      const { error } = await supabase
        .from('visitantes')
        .insert([{
          nome: formData.name,
          telefone: formData.whatsapp,
          experiencias: formData.experiences,
        }]);

      if (error) throw new Error(error.message);

      // O comprovante e montado a partir do que o proprio visitante digitou.
      // Nao precisamos do id do banco: o check-in e feito pelo nome no painel.
      setTicket(toTicket({
        id: null,
        name: formData.name,
        whatsapp: formData.whatsapp,
        experiences: formData.experiences,
        created_at: new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Supabase insert failed or keys not configured. Falling back to LocalStorage:', err.message);
      // Fallback local storage
      const localBooking = addBooking(formData.name, formData.whatsapp, formData.experiences);
      setTicket(toTicket(normalizeVisitor(localBooking)));
    } finally {
      setSubmitting(false);
    }
  };

  // Human-readable experience mapping
  const expLabels = {
    vr: 'Realidade Virtual',
    manga: 'Oficina de Mangá',
    ps5: 'Área Gamer PS5',
    videoke: 'Videokê'
  };

  return (
    <main className="flex-grow flex flex-col px-6 py-8 max-w-[600px] mx-auto w-full z-10 relative">
      {/* Global Grid Background */}
      <div className="absolute inset-0 pointer-events-none bg-grid-tech z-0 opacity-20"></div>

      {/* Back button to return to home */}
      <div className="mb-4 text-left z-10">
        <a 
          href="#/" 
          className="inline-flex items-center gap-2 text-outline-variant hover:text-primary transition-colors text-xs font-semibold uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Voltar para Home
        </a>
      </div>

      {ticket ? (
        // Ticket Display
        <div className="flex-grow flex flex-col items-center justify-center py-6 animate-fadeIn z-10">
          <div className="w-full bg-surface-container border border-primary/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(143,214,255,0.15)] flex flex-col items-center">
            {/* Holographic Header */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">confirmation_number</span>
            </div>

            <h2 className="font-display-lg text-lg text-primary font-bold uppercase tracking-wider text-glow mb-1">
              Acesso Confirmado!
            </h2>
            <p className="text-on-surface-variant text-xs text-center mb-6 max-w-[280px]">
              Informe seu nome no balcão do estande para a equipe liberar sua entrada.
            </p>

            {/* Nome em destaque — e o que a equipe procura no painel de check-in */}
            <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6 text-center">
              <span className="font-label-sm text-[10px] text-outline-variant uppercase tracking-widest font-bold block mb-2">
                Procure por
              </span>
              <span className="font-display-lg text-xl text-primary font-bold break-words">
                {ticket.name}
              </span>
            </div>

            {/* Ticket Info */}
            <div className="w-full border-t border-b border-white/10 py-4 mb-6 space-y-3 font-label-sm text-xs">
              <div className="flex justify-between">
                <span className="text-outline-variant uppercase">Código:</span>
                <span className="text-on-surface font-mono font-bold">{ticket.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline-variant uppercase">Nome:</span>
                <span className="text-on-surface font-bold">{ticket.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline-variant uppercase">Data & Hora:</span>
                <span className="text-on-surface font-bold">{ticket.date} às {ticket.time}</span>
              </div>
              <div className="border-t border-white/5 pt-3">
                <span className="text-outline-variant uppercase block mb-1">Atrações Agendadas:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {ticket.experiences.map(exp => (
                    <span key={exp} className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                      {expLabels[exp]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setTicket(null);
                setFormData({ name: '', whatsapp: '', experiences: [] });
              }}
              className="w-full bg-surface-container-high hover:bg-surface-container-highest border border-white/10 text-on-surface py-3.5 rounded-xl uppercase tracking-wider text-xs font-bold transition-all"
            >
              Novo Agendamento
            </button>
          </div>
        </div>
      ) : (
        // Registration Form
        <div className="flex-grow flex flex-col z-10">
          <header className="mb-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 border border-outline-variant/30 neon-glow">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
            </div>
            <h1 className="font-display-lg text-2xl md:text-3xl text-primary drop-shadow-[0_0_8px_rgba(143,214,255,0.6)] mb-2 uppercase tracking-wide font-bold">
              Agende sua Experiência
            </h1>
            <p className="text-on-surface-variant max-w-[280px] mx-auto text-center leading-relaxed text-sm">
              Cadastre-se rapidamente para acessar as atrações do estande.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            {/* Personal Info Inputs */}
            <div className="flex flex-col gap-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant group-focus-within:text-primary transition-colors text-lg">person</span>
                </div>
                <input 
                  name="name"
                  value={formData.name}
                  onChange={handleTextChange}
                  disabled={submitting}
                  className="w-full h-14 bg-[#0a0a0a] border border-[#333333] rounded-lg pl-12 pr-4 text-on-background placeholder:text-outline-variant focus:border-primary focus:ring-0 focus:shadow-[inset_0_0_10px_rgba(143,214,255,0.1)] transition-all outline-none font-body-md text-sm disabled:opacity-50" 
                  placeholder="Nome Completo"
                  required
                  type="text"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'error-name' : undefined}
                />
              </div>
              {errors.name && (
                <p id="error-name" role="alert" className="text-error text-xs font-body-md -mt-2 ml-1">
                  {errors.name}
                </p>
              )}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant group-focus-within:text-primary transition-colors text-lg">phone_iphone</span>
                </div>
                <input 
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleTextChange}
                  disabled={submitting}
                  className="w-full h-14 bg-[#0a0a0a] border border-[#333333] rounded-lg pl-12 pr-4 text-on-background placeholder:text-outline-variant focus:border-primary focus:ring-0 focus:shadow-[inset_0_0_10px_rgba(143,214,255,0.1)] transition-all outline-none font-body-md text-sm disabled:opacity-50" 
                  placeholder="WhatsApp (com DDD)"
                  required
                  type="tel"
                  aria-invalid={Boolean(errors.whatsapp)}
                  aria-describedby={errors.whatsapp ? 'error-whatsapp' : undefined}
                />
              </div>
              {errors.whatsapp && (
                <p id="error-whatsapp" role="alert" className="text-error text-xs font-body-md -mt-2 ml-1">
                  {errors.whatsapp}
                </p>
              )}
            </div>

            {/* Experiences Selection */}
            <div className="mt-4">
              <h2 className="font-body-md text-sm font-semibold text-on-surface mb-4 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block neon-glow"></span>
                Selecione as Atrações
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* VR Experience */}
                <div className="relative">
                  <input 
                    className="experience-checkbox sr-only" 
                    id="exp-vr" 
                    name="experiences" 
                    type="checkbox" 
                    value="vr"
                    checked={formData.experiences.includes('vr')}
                    onChange={handleCheckboxChange}
                    disabled={submitting}
                  />
                  <label className="flex items-center p-4 bg-surface-container-low border border-surface-container-high rounded-xl cursor-pointer transition-all duration-300 hover:border-outline-variant group" htmlFor="exp-vr">
                    <div className="icon-container w-10 h-10 rounded-lg bg-surface flex items-center justify-center mr-4 transition-colors border border-white/5">
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>view_in_ar</span>
                    </div>
                    <div className="flex-grow">
                      <span className="block font-body-md text-sm font-medium text-on-background">Realidade Virtual</span>
                    </div>
                    <span className="check-icon material-symbols-outlined text-primary opacity-0 transition-opacity" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </label>
                </div>

                {/* Manga Workshop */}
                <div className="relative">
                  <input 
                    className="experience-checkbox sr-only" 
                    id="exp-manga" 
                    name="experiences" 
                    type="checkbox" 
                    value="manga"
                    checked={formData.experiences.includes('manga')}
                    onChange={handleCheckboxChange}
                    disabled={submitting}
                  />
                  <label className="flex items-center p-4 bg-surface-container-low border border-surface-container-high rounded-xl cursor-pointer transition-all duration-300 hover:border-outline-variant group" htmlFor="exp-manga">
                    <div className="icon-container w-10 h-10 rounded-lg bg-surface flex items-center justify-center mr-4 transition-colors border border-white/5">
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>draw</span>
                    </div>
                    <div className="flex-grow">
                      <span className="block font-body-md text-sm font-medium text-on-background">Oficina de Mangá</span>
                    </div>
                    <span className="check-icon material-symbols-outlined text-primary opacity-0 transition-opacity" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </label>
                </div>

                {/* PS5 Gamer Area */}
                <div className="relative">
                  <input 
                    className="experience-checkbox sr-only" 
                    id="exp-ps5" 
                    name="experiences" 
                    type="checkbox" 
                    value="ps5"
                    checked={formData.experiences.includes('ps5')}
                    onChange={handleCheckboxChange}
                    disabled={submitting}
                  />
                  <label className="flex items-center p-4 bg-surface-container-low border border-surface-container-high rounded-xl cursor-pointer transition-all duration-300 hover:border-outline-variant group" htmlFor="exp-ps5">
                    <div className="icon-container w-10 h-10 rounded-lg bg-surface flex items-center justify-center mr-4 transition-colors border border-white/5">
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>sports_esports</span>
                    </div>
                    <div className="flex-grow">
                      <span className="block font-body-md text-sm font-medium text-on-background">Área Gamer PS5</span>
                    </div>
                    <span className="check-icon material-symbols-outlined text-primary opacity-0 transition-opacity" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </label>
                </div>

                {/* Videoke */}
                <div className="relative">
                  <input 
                    className="experience-checkbox sr-only" 
                    id="exp-videoke" 
                    name="experiences" 
                    type="checkbox" 
                    value="videoke"
                    checked={formData.experiences.includes('videoke')}
                    onChange={handleCheckboxChange}
                    disabled={submitting}
                  />
                  <label className="flex items-center p-4 bg-surface-container-low border border-surface-container-high rounded-xl cursor-pointer transition-all duration-300 hover:border-outline-variant group" htmlFor="exp-videoke">
                    <div className="icon-container w-10 h-10 rounded-lg bg-surface flex items-center justify-center mr-4 transition-colors border border-white/5">
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>mic</span>
                    </div>
                    <div className="flex-grow">
                      <span className="block font-body-md text-sm font-medium text-on-background">Videokê</span>
                    </div>
                    <span className="check-icon material-symbols-outlined text-primary opacity-0 transition-opacity" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </label>
                </div>
              </div>
              {errors.experiences && (
                <p role="alert" className="text-error text-xs font-body-md mt-3 ml-1">
                  {errors.experiences}
                </p>
              )}
            </div>

            {/* Submit Action */}
            <div className="mt-8 pt-4 border-t border-outline-variant/20">
              <button 
                type="submit"
                disabled={submitting}
                className="w-full h-16 bg-primary text-[#001e2c] font-display-lg text-lg rounded-xl hover:bg-primary-fixed-dim hover:shadow-[0_0_20px_rgba(143,214,255,0.6)] transition-all duration-300 neon-glow flex items-center justify-center gap-2 active:scale-95 group font-bold disabled:opacity-50"
              >
                {submitting ? (
                  <span>Conectando Banco...</span>
                ) : (
                  <>
                    <span>Gerar QR Code</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
                  </>
                )}
              </button>
              <p className="text-center text-outline-variant mt-4 font-label-sm text-[10px] uppercase tracking-widest font-bold">
                Conectado via Supabase
              </p>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
