import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { getBookings, normalizeVisitor } from '../utils/storage';
import { summarize, peakHour, EXPERIENCE_COLORS } from '../utils/analytics';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid, Legend,
} from 'recharts';

const PAGE_SIZE = 1000;
const POLLING_INTERVAL_MS = 30000;

const INK = { primary: '#e5e2e1', muted: '#87929b' };
const CHECKIN_COLOR = '#0ea5c4';
const PENDING_COLOR = '#5b6670';

const tooltipStyle = {
  backgroundColor: '#1c1b1b',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  color: INK.primary,
  fontFamily: 'Hanken Grotesk',
  fontSize: '12px',
};

const axisProps = {
  stroke: INK.muted,
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  fontFamily: 'Geist',
};

function StatTile({ label, value, hint, tone = 'primary' }) {
  const toneClass = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-on-surface',
  }[tone];

  return (
    <div className="glass-panel p-6 rounded-lg flex flex-col justify-between gap-3 min-h-[136px]">
      <div className="font-label-sm text-xs uppercase text-outline-variant tracking-widest font-bold">
        {label}
      </div>
      <div className={`font-display-lg text-4xl lg:text-[2.75rem] leading-none font-bold ${toneClass}`}>
        {value}
      </div>
      {hint && (
        <div className="font-body-md text-xs text-on-surface-variant">{hint}</div>
      )}
    </div>
  );
}

function Panel({ title, icon, children, subtitle, className = '' }) {
  return (
    <div className={`glass-panel p-6 rounded-lg flex flex-col gap-4 ${className}`}>
      <div className="border-b border-white/5 pb-4">
        <h2 className="font-headline-lg text-base text-on-surface flex items-center gap-2 font-semibold uppercase tracking-wider">
          {icon && <span className="material-symbols-outlined text-primary text-lg">{icon}</span>}
          {title}
        </h2>
        {subtitle && (
          <p className="font-body-md text-xs text-on-surface-variant mt-1">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

/** Legenda do gráfico por atração: as séries se distinguem pela opacidade. */
function OpacityLegend() {
  const items = [
    { label: 'Inscritos', opacity: 0.35 },
    { label: 'Compareceram', opacity: 1 },
  ];

  return (
    <div className="flex items-center gap-5 -mt-1">
      {items.map(({ label, opacity }) => (
        <span key={label} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: '#8fd6ff', opacity }}
          />
          <span className="font-label-sm text-[11px]" style={{ color: INK.muted }}>
            {label}
          </span>
        </span>
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[220px] text-center px-6">
      <p className="font-body-md text-sm text-on-surface-variant max-w-xs">{message}</p>
    </div>
  );
}

export default function MetricsDashboard() {
  const [visitors, setVisitors] = useState([]);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('visitantes')
        .select('*')
        .order('id', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      setIsUsingSupabase(true);
      setVisitors((data || []).map(normalizeVisitor));
    } catch (err) {
      console.warn('Supabase indisponível, usando dados locais:', err.message);
      setIsUsingSupabase(false);
      setVisitors(getBookings().map(normalizeVisitor));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let channel;

    const startPolling = () => {
      if (pollingRef.current) return;
      pollingRef.current = setInterval(loadData, POLLING_INTERVAL_MS);
    };

    loadData();

    try {
      channel = supabase
        .channel('public:visitantes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'visitantes' }, () => loadData())
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
            startPolling();
          }
        });
    } catch (e) {
      console.warn('Realtime indisponível, usando polling:', e.message);
      startPolling();
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
      if (channel) supabase.removeChannel(channel);
    };
  }, [loadData]);

  const stats = useMemo(() => summarize(visitors), [visitors]);
  const pico = useMemo(() => peakHour(stats.porHora), [stats.porHora]);

  // Recorta o eixo de horas para a janela em que houve movimento — 24 barras,
  // sendo 14 zeradas, é ruído.
  const horasComMovimento = useMemo(() => {
    const ativos = stats.porHora.filter(h => h.inscritos > 0);
    if (!ativos.length) return [];
    const min = Math.max(0, Math.min(...ativos.map(h => h.hour)) - 1);
    const max = Math.min(23, Math.max(...ativos.map(h => h.hour)) + 1);
    return stats.porHora.slice(min, max + 1);
  }, [stats.porHora]);

  const semDados = !loading && stats.total === 0;

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-container-margin py-12 flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface font-bold uppercase">
            Dashboard Administrativo
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-2 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isUsingSupabase && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isUsingSupabase ? 'bg-primary' : 'bg-outline'}`} />
            </span>
            {isUsingSupabase
              ? 'Dados ao vivo do Supabase'
              : 'Sem conexão — exibindo dados locais de demonstração'}
          </p>
        </div>
        <div className="font-label-sm text-xs text-outline px-3 py-1 bg-surface-container-high rounded border border-outline-variant uppercase font-semibold">
          {isUsingSupabase ? 'SUPABASE' : 'LOCAL'}
        </div>
      </header>

      {semDados ? (
        <div className="glass-panel rounded-lg p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant">database_off</span>
          <h2 className="font-headline-lg text-lg text-on-surface mt-4 font-semibold">Nenhum visitante registrado</h2>
          <p className="font-body-md text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
            As métricas aparecem assim que a primeira inscrição for gravada. Para
            gerar dados de teste, rode <code className="text-primary">node scripts/seed.mjs</code>.
          </p>
        </div>
      ) : (
        <>
          {/* KPIs — todos derivados dos registros reais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatTile
              label="Inscritos"
              value={loading ? '—' : stats.total}
              hint={`${stats.totalSelecoes} seleções de atração no total`}
            />
            <StatTile
              label="Check-ins realizados"
              value={loading ? '—' : stats.checkIns}
              hint={`${stats.taxaCheckIn}% dos inscritos compareceram`}
              tone="secondary"
            />
            <StatTile
              label="Aguardando check-in"
              value={loading ? '—' : stats.aguardando}
              hint={stats.aguardando > 0 ? 'Ainda não passaram pelo balcão' : 'Todos já entraram'}
              tone="muted"
            />
            <StatTile
              label="Atrações por visitante"
              value={loading ? '—' : stats.mediaExperiencias.toFixed(2)}
              hint={
                stats.medianaCheckInMin !== null
                  ? `Mediana de ${stats.medianaCheckInMin} min até o check-in`
                  : 'Sem check-ins para medir tempo'
              }
              tone="muted"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inscritos vs check-ins por atração */}
            <Panel
              title="Desempenho por atração"
              icon="bar_chart"
              subtitle="Inscritos e quantos de fato compareceram"
              className="lg:col-span-2 min-h-[380px]"
            >
              {stats.totalSelecoes === 0 ? (
                <EmptyState message="Nenhuma atração selecionada ainda." />
              ) : (
                <>
                {/*
                  Legenda em HTML: como cada barra é pintada por <Cell> (uma cor
                  por atração), o <Legend> do recharts não consegue inferir a cor
                  da série e renderiza os marcadores em preto. As duas séries se
                  distinguem pela opacidade, não pela cor.
                */}
                <OpacityLegend />
                <ResponsiveContainer width="100%" height={286}>
                  <BarChart data={stats.porExperiencia} margin={{ top: 16, right: 8, left: -16, bottom: 4 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="short" {...axisProps} />
                    <YAxis {...axisProps} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      contentStyle={tooltipStyle}
                      formatter={(value, name) => [value, name === 'inscritos' ? 'Inscritos' : 'Check-ins']}
                      labelFormatter={(label) => {
                        const row = stats.porExperiencia.find(e => e.short === label);
                        return row ? `${row.name} — ${row.taxaCheckIn}% de comparecimento` : label;
                      }}
                    />
                    {/* Barra de fundo colorida pela identidade da atração */}
                    <Bar dataKey="inscritos" radius={[4, 4, 0, 0]} barSize={34}>
                      {stats.porExperiencia.map(e => (
                        <Cell key={e.key} fill={EXPERIENCE_COLORS[e.key]} fillOpacity={0.35} />
                      ))}
                    </Bar>
                    <Bar dataKey="checkIns" radius={[4, 4, 0, 0]} barSize={34}>
                      {stats.porExperiencia.map(e => (
                        <Cell key={e.key} fill={EXPERIENCE_COLORS[e.key]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </>
              )}
            </Panel>

            {/* Tabela analítica */}
            <Panel title="Taxa de comparecimento" icon="table_rows" subtitle="Check-ins ÷ inscritos, por atração">
              <div className="flex flex-col gap-4 pt-1">
                {stats.porExperiencia.map(exp => (
                  <div key={exp.key} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: EXPERIENCE_COLORS[exp.key] }}
                        />
                        <span className="font-body-md text-xs text-on-surface truncate">{exp.name}</span>
                      </div>
                      <span className="font-mono text-xs text-on-surface-variant shrink-0">
                        {exp.checkIns}/{exp.inscritos}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${exp.taxaCheckIn}%`,
                          backgroundColor: EXPERIENCE_COLORS[exp.key],
                        }}
                      />
                    </div>
                    <span className="font-label-sm text-[10px] text-on-surface-variant font-bold">
                      {exp.taxaCheckIn}%
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Série temporal */}
            <Panel
              title="Inscrições nos últimos 7 dias"
              icon="show_chart"
              subtitle="Volume diário de inscrições e check-ins"
              className="lg:col-span-2 min-h-[320px]"
            >
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={stats.porDia} margin={{ top: 16, right: 8, left: -16, bottom: 4 }}>
                  <defs>
                    <linearGradient id="gradInscritos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHECKIN_COLOR} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={CHECKIN_COLOR} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [value, name === 'inscritos' ? 'Inscritos' : 'Check-ins']}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'Geist', paddingTop: 8 }}
                    formatter={(value) => (
                      <span style={{ color: INK.muted }}>
                        {value === 'inscritos' ? 'Inscritos' : 'Compareceram'}
                      </span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="inscritos"
                    stroke={CHECKIN_COLOR}
                    strokeWidth={2}
                    fill="url(#gradInscritos)"
                    dot={{ r: 3, fill: CHECKIN_COLOR, strokeWidth: 0 }}
                    activeDot={{ r: 5, stroke: '#1c1b1b', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="checkIns"
                    stroke={PENDING_COLOR}
                    strokeWidth={2}
                    fill="none"
                    dot={{ r: 3, fill: PENDING_COLOR, strokeWidth: 0 }}
                    activeDot={{ r: 5, stroke: '#1c1b1b', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Panel>

            {/* Distribuição de cesta */}
            <Panel
              title="Combinações escolhidas"
              icon="donut_small"
              subtitle="Quantos visitantes marcam mais de uma atração"
            >
              <div className="flex flex-col gap-3 pt-2">
                {stats.porCesta.map(item => {
                  const share = stats.total === 0 ? 0 : (item.visitantes / stats.total) * 100;
                  return (
                    <div key={item.size} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-baseline">
                        <span className="font-body-md text-xs text-on-surface">{item.label}</span>
                        <span className="font-mono text-xs text-on-surface-variant">
                          {item.visitantes} <span className="text-outline-variant">({share.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          {/* Pico de fluxo */}
          <Panel
            title="Fluxo por horário"
            icon="schedule"
            subtitle={
              pico
                ? `Pico às ${pico.label} com ${pico.inscritos} inscrições`
                : 'Distribuição das inscrições ao longo do dia'
            }
          >
            {horasComMovimento.length === 0 ? (
              <EmptyState message="Sem inscrições com horário registrado." />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={horasComMovimento} margin={{ top: 16, right: 8, left: -16, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" {...axisProps} interval={0} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={tooltipStyle}
                    formatter={(value) => [value, 'Inscrições']}
                  />
                  <Bar dataKey="inscritos" radius={[4, 4, 0, 0]}>
                    {horasComMovimento.map(h => (
                      <Cell
                        key={h.hour}
                        fill={pico && h.hour === pico.hour ? CHECKIN_COLOR : PENDING_COLOR}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </>
      )}
    </main>
  );
}
