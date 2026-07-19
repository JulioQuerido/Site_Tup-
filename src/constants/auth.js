// E-mail do administrador. Nao e segredo (fica no bundle) e serve apenas para
// dar mensagem de erro clara no login. A autorizacao de verdade acontece nas
// policies de RLS do Supabase — veja supabase/schema.sql.
export const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || 'julioczquerido@gmail.com';

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
