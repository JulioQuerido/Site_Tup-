# Tupã Hub

Portal do Tupã Hub — site institucional, agendamento de estande, portal de
campeonatos e painel administrativo. React + Vite + Tailwind, com Supabase como
backend.

## Como rodar

```bash
npm install
cp .env.example .env   # preencha com as chaves do seu projeto Supabase
npm run dev
```

Scripts disponíveis:

| Comando          | O que faz                        |
|------------------|----------------------------------|
| `npm run dev`    | Servidor de desenvolvimento      |
| `npm run build`  | Build de produção em `dist/`     |
| `npm test`       | Suíte de testes (Vitest)         |
| `npm run lint`   | Oxlint                           |
| `npm run seed`   | Popula o banco com dados de teste |

### Dados de teste

```bash
npm run seed              # 120 visitantes aleatórios
npm run seed -- 300       # 300 visitantes
npm run seed -- --limpar  # apaga tudo antes de inserir
```

O script imprime, no final, os totais que ele gravou — confira contra o que o
dashboard mostra. Exige que `supabase/schema.sql` já tenha sido aplicado.

## Configuração do Supabase

### 1. Variáveis de ambiente

| Variável                  | Obrigatória | Descrição                                    |
|---------------------------|-------------|----------------------------------------------|
| `VITE_SUPABASE_URL`       | sim         | URL do projeto Supabase                       |
| `VITE_SUPABASE_ANON_KEY`  | sim         | Chave `anon` pública                          |
| `VITE_ADMIN_EMAIL`        | não         | E-mail autorizado no painel admin             |

Na Vercel, cadastre as mesmas variáveis em *Settings → Environment Variables*.
Sem elas o app exibe um aviso e cai no modo de demonstração com `localStorage`.

O arquivo `.env` **não** é versionado. Nunca commite chaves.

### 2. Banco e políticas de segurança

Rode `supabase/schema.sql` no SQL Editor do Supabase. Ele cria as tabelas, os
índices e — o mais importante — habilita **Row Level Security**.

> ⚠️ A chave `anon` fica visível no bundle JavaScript. Isso é esperado e seguro
> **desde que o RLS esteja ativo**. Sem as policies, qualquer pessoa que copie a
> chave do DevTools consegue ler nome e WhatsApp de todos os visitantes — dado
> pessoal sob a LGPD. Não pule esta etapa.

Resumo das políticas:

- `visitantes` — qualquer um pode **se inscrever**; apenas o admin autenticado
  pode **ler**, **atualizar** (check-in) ou **remover**.
- `participantes_campeonato` — leitura pública (o chaveamento aparece no portal);
  escrita apenas para o admin.

### 3. Usuário administrador

Crie o usuário pelo painel *Authentication → Users* do Supabase. O e-mail precisa
bater com `VITE_ADMIN_EMAIL` e com o e-mail dentro da função `is_admin()` em
`supabase/schema.sql`.

## Arquitetura

```
src/
├── App.jsx              Roteamento por hash + landing page
├── constants/auth.js    E-mail do admin e listas de rotas
├── supabaseClient.js    Cliente Supabase + flag de configuração
├── utils/storage.js     Fallback em localStorage e agregação de métricas
├── components/          Componentes da landing page
├── pages/               Telas de agendamento, campeonato e admin
└── test/                Setup e testes (Vitest + Testing Library)
```

**Modo de demonstração:** cada página tenta o Supabase primeiro e, em caso de
falha, cai para dados de `localStorage`. Isso permite demonstrar o produto sem
backend, mas o aviso no topo da tela indica quando o banco não está conectado.

**Autenticação:** o guard de rotas em `App.jsx` é apenas conveniência de
navegação. A autorização real é feita pelas policies de RLS no Postgres — nunca
adicione um caminho que confie somente na checagem do cliente.

**Check-in:** é manual. O visitante se inscreve pelo site, informa o nome no
balcão e a equipe confirma a entrada em *Admin → Staff Check-in*. Não há QR Code.

**Campeonatos:** rodam como demonstração local (`src/utils/tournament.js`), sem
backend e sem integração com Challonge. As inscrições ficam em `localStorage` do
navegador. Para levar a produção, troque essa camada por chamadas à tabela
`participantes_campeonato`.

**Métricas:** todos os números do dashboard vêm de registros reais. As funções
puras estão em `src/utils/analytics.js` e são cobertas por testes. Se um número
parecer estranho, ele reflete o banco — não há offset de mockup em lugar nenhum.

### Paleta dos gráficos

As cores em `EXPERIENCE_COLORS` (`src/utils/analytics.js`) foram validadas para
daltonismo e contraste sobre fundo escuro. **Não troque por gostar mais de outro
tom** sem revalidar — a paleta anterior eram quatro azuis com ΔE 4.1, ilegíveis
para deuteranopia. A cor segue a atração, nunca a posição no ranking.
