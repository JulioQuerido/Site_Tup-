// E-mail do administrador. Nao e segredo (fica no bundle) e serve apenas para
// dar mensagem de erro clara no login. A autorizacao de verdade acontece nas
// policies de RLS do Supabase — veja supabase/schema.sql.
export const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || 'julioczquerido@gmail.com';

// Suporta múltiplos e-mails separados por vírgula no .env
const envEmails = import.meta.env.VITE_ADMIN_EMAILS
  ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
  : [];

export const ADMIN_EMAILS = [
  ADMIN_EMAIL.toLowerCase(),
  ...envEmails
];

export const isAdmin = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const PROTECTED_ROUTES = [
  '#/painel-metricas',
  '#/admin/campeonatos',
  '#/admin/checkin'
];

export const isProtectedRoute = (route) => PROTECTED_ROUTES.includes(route);

// Rotas que renderizam sem o Header/Footer do site institucional.
export const STANDALONE_ROUTES = [
  '#/agendamento-estande',
  '#/login',
  '#/alterar-senha',
  ...PROTECTED_ROUTES
];
