import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // Nao lancamos erro (isso derrubaria a pagina inteira em tela branca), mas o
  // App exibe um aviso visivel para que a falta de configuracao nao passe
  // despercebida atras do fallback de localStorage.
  const message =
    'Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example).';
  if (import.meta.env.PROD) console.error(message);
  else console.warn(`${message} Rodando em modo offline (localStorage).`);
}

// Em dev sem chaves usamos um endereco invalido de proposito: as chamadas
// falham rapido e cada pagina cai no seu fallback local.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'offline-dev-placeholder'
);
