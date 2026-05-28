import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, RadialBarChart, RadialBar, PieChart, Pie, Legend,
} from 'recharts';
import { TrendingUp, Download, Droplets, Clock, Zap, Activity, AlertCircle } from 'lucide-react';
import { printAnalyticsReport } from '../utils/printReport';
import { analyticsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WeeklyChart from '../components/charts/WeeklyChart';
import HydrationGauge from '../components/charts/HydrationGauge';
import { useToast } from '../components/ui/Toast';
import { formatDuration } from '../utils/calculations';

/* ── Tooltip reutilizável ─────────────────────────────── */
function ChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs shadow-card">
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color ?? '#C41E3A' }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}{unit}</span>
        </p>
      ))}
    </div>
  );
}

/* ── Cores por intensidade ────────────────────────────── */
const INTENSITY_COLOR = {
  baixa:   '#34d399',
  moderada:'#fbbf24',
  alta:    '#f87171',
  variada: '#a78bfa',
};
const INTENSITY_LABEL = { baixa: 'Baixa', moderada: 'Moderada', alta: 'Alta', variada: 'Variada' };

/* ── Empty state ─────────────────────────────────────── */
function EmptyChart({ message, minSessions, currentSessions = 0 }) {
  const defaultMsg = minSessions
    ? `Registre ${Math.max(0, minSessions - currentSessions)} treino${Math.max(0, minSessions - currentSessions) !== 1 ? 's' : ''} para visualizar este gráfico (${currentSessions}/${minSessions}).`
    : 'Dados disponíveis após as primeiras sessões.';
  return (
    <div className="h-36 flex flex-col items-center justify-center gap-2 text-center">
      <AlertCircle size={22} className="text-white/15" />
      <p className="text-xs text-white/25 max-w-[220px] leading-relaxed">{message ?? defaultMsg}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function Analytics() {
  const toast = useToast();
  const { dark } = useTheme();
  const { user } = useAuth();
  const tickColor  = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';

  const [dashboard, setDashboard]   = useState(null);
  const [trend, setTrend]           = useState([]);
  const [history, setHistory]       = useState({ sessions: [], byIntensity: [], monthly: [] });
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.dashboard(),
      analyticsApi.hydrationTrend(),
      analyticsApi.sessionsHistory(20),
    ]).then(([dash, tr, hist]) => {
      if (dash.status === 'fulfilled') setDashboard(dash.value.data);
      if (tr.status   === 'fulfilled') setTrend(tr.value.data);
      if (hist.status === 'fulfilled') setHistory(hist.value.data);
    }).finally(() => setLoading(false));
  }, []);

  const hydrationIndex = dashboard?.hydrationIndex ?? null;
  const vo2max         = dashboard?.profile?.vo2max ?? null;
  const stats          = dashboard?.stats ?? {};
  const totalSessions  = dashboard?.totalSessions ?? 0;
  const lastSession    = dashboard?.lastSession ?? null;
  const isVirgin       = !loading && totalSessions === 0;

  /* ── Trend data: map API keys → chart keys ── */
  const trendData = trend.map((r) => ({
    day:     r.date ? new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—',
    sweat:   r.avg_sweat    ? parseFloat(parseFloat(r.avg_sweat).toFixed(2))    : 0,
    deficit: r.avg_deficit  ? Math.round(parseFloat(r.avg_deficit))              : 0,
  }));

  /* ── Session history bars (reversed for chronological order) ── */
  const historyData = [...(history.sessions ?? [])].reverse().map((s) => ({
    label:   s.label ?? '—',
    sweat:   s.sweat_rate_lh    ? parseFloat(parseFloat(s.sweat_rate_lh).toFixed(2))    : 0,
    deficit: s.hydric_deficit_ml ? Math.round(s.hydric_deficit_ml) : 0,
    duration:s.duration_minutes ?? 0,
    color:   INTENSITY_COLOR[s.intensity] ?? '#C41E3A',
  }));

  /* ── Intensity distribution for pie chart ── */
  const pieData = (history.byIntensity ?? []).map((r) => ({
    name:  INTENSITY_LABEL[r.intensity] ?? r.intensity,
    value: parseInt(r.count),
    color: INTENSITY_COLOR[r.intensity] ?? '#C41E3A',
  }));

  /* ── Monthly load ── */
  const monthlyData = (history.monthly ?? []).map((r) => ({
    month:    r.month,
    sessions: parseInt(r.sessions),
    sweat:    r.avg_sweat ? parseFloat(parseFloat(r.avg_sweat).toFixed(2)) : 0,
    minutes:  parseInt(r.total_minutes ?? 0),
  }));

  /* ── Recovery estimate ── */
  const deficitMl      = lastSession?.hydric_deficit_ml ?? 0;
  const recoveryHours  = lastSession ? Math.max(8, Math.round(Math.abs(deficitMl) / 200)) : null;

  const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
  const fadeUp  = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <AppLayout>
      <Header
        title="Análises"
        actions={
          <Button
            variant="ghost" size="sm"
            icon={<Download size={15} />}
            onClick={() => printAnalyticsReport({ dashboard, history, trend, userName: user?.name })}
          >
            Exportar
          </Button>
        }
      />

      <div className="page-container md:max-w-4xl">
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">

          {/* Header */}
          <motion.div variants={fadeUp}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Relatório de Performance</p>
            <h1 className="text-2xl font-black mt-1">Análises de<br />Desempenho</h1>
            <p className="text-xs text-white/40 mt-1">
              SweatTrack Clinical Intelligence — dados das suas sessões em tempo real.
            </p>
          </motion.div>

          {/* Empty state banner */}
          {isVirgin && (
            <motion.div variants={fadeUp}>
              <div className="bg-gradient-to-r from-primary/10 to-rose-900/5 border border-primary/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-1">Nenhuma sessão registrada ainda</p>
                    <p className="text-xs text-white/50 leading-relaxed">
                      As métricas reais — índice de hidratação, VO₂máx e tendências de sudorese — aparecem aqui após você completar sua primeira sessão.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Stats summary row ── */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Sessões', value: totalSessions, unit: '', icon: <Activity size={14} className="text-primary" /> },
              { label: 'Tx. Suor Méd.', value: stats.avg_sweat_rate ? parseFloat(stats.avg_sweat_rate).toFixed(2) : '—', unit: ' L/h', icon: <Droplets size={14} className="text-sky-400" /> },
              { label: 'Duração Méd.', value: stats.avg_duration ? Math.round(stats.avg_duration) : '—', unit: stats.avg_duration ? ' min' : '', icon: <Clock size={14} className="text-amber-400" /> },
              { label: 'Tx. Suor Máx.', value: stats.max_sweat_rate ? parseFloat(stats.max_sweat_rate).toFixed(2) : '—', unit: stats.max_sweat_rate ? ' L/h' : '', icon: <Zap size={14} className="text-rose-400" /> },
            ].map(({ label, value, unit, icon }) => (
              <Card key={label} className="!p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  {icon}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
                </div>
                <p className="text-2xl font-black tabular-nums leading-none">
                  {value}<span className="text-sm text-white/40 font-medium">{unit}</span>
                </p>
              </Card>
            ))}
          </motion.div>

          {/* ── Hydration index + VO2max ── */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Hydration gauge */}
            <Card glow>
              <div className="flex items-center justify-between mb-1">
                <p className="section-title mb-0">Índice de Hidratação</p>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
              </div>
              {hydrationIndex !== null ? (
                <>
                  <div className="flex items-center justify-center py-2">
                    <HydrationGauge value={hydrationIndex} size={160} />
                  </div>
                  <p className="text-xs text-white/40 text-center mt-1">
                    Baseado na coloração de urina (escala WUTS) da última sessão.
                  </p>
                </>
              ) : (
                <EmptyChart message="O índice de hidratação é calculado a partir da coloração da urina registrada em cada sessão." />
              )}
            </Card>

            {/* VO2max + recovery */}
            <div className="space-y-4">
              <Card>
                <p className="section-title">VO₂ Máx</p>
                {vo2max !== null ? (
                  <>
                    <div className="flex items-end gap-1">
                      <p className="text-4xl font-black tabular-nums">{vo2max}</p>
                      <p className="text-sm text-white/40 mb-1">ml/kg/min</p>
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">Perfil do atleta</p>
                  </>
                ) : (
                  <p className="text-3xl font-black text-white/20 mt-1">—</p>
                )}
              </Card>
              <Card>
                <p className="section-title">Próximo Treino</p>
                {recoveryHours !== null ? (
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-black tabular-nums">
                      {recoveryHours}<span className="text-xl text-white/40">h</span>
                    </p>
                    <p className="text-xs text-white/40 mb-1">recuperação estimada</p>
                  </div>
                ) : (
                  <p className="text-3xl font-black text-white/20 mt-1">—</p>
                )}
              </Card>
            </div>
          </motion.div>

          {/* ── Taxa de sudorese — histórico de sessões ── */}
          <motion.div variants={fadeUp}>
            <Card>
              <p className="section-title">Taxa de Sudorese — Últimas Sessões</p>
              {historyData.length > 0 ? (
                <div className="h-44 mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyData} barSize={14} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fill: tickColor, fontSize: 9, fontWeight: 600 }}
                        axisLine={false} tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        content={({ active, payload, label }) => (
                          <ChartTooltip active={active} payload={payload?.map(p => ({ ...p, name: 'Suor' }))} label={label} unit=" L/h" />
                        )}
                        cursor={false}
                      />
                      <Bar dataKey="sweat" radius={[5, 5, 3, 3]}>
                        {historyData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {Object.entries(INTENSITY_COLOR).map(([key, color]) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="text-[10px] text-white/40 font-medium capitalize">{INTENSITY_LABEL[key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyChart minSessions={1} currentSessions={totalSessions} />
              )}
            </Card>
          </motion.div>

          {/* ── Tendência 14 dias (área) ── */}
          <motion.div variants={fadeUp}>
            <Card>
              <p className="section-title">Tendência de Sudorese — 14 Dias</p>
              {trendData.length > 0 ? (
                <div className="h-40 mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <defs>
                        <linearGradient id="sweatGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#C41E3A" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#C41E3A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="day"
                        tick={{ fill: tickColor, fontSize: 10 }}
                        axisLine={false} tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip content={<ChartTooltip unit=" L/h" />} />
                      <Area
                        type="monotone" dataKey="sweat" name="Taxa"
                        stroke="#C41E3A" strokeWidth={2}
                        fill="url(#sweatGrad)"
                        dot={{ r: 3, fill: '#C41E3A', strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart minSessions={2} currentSessions={totalSessions} message={totalSessions < 2 ? `Registre ao menos 2 sessões para visualizar a tendência (${totalSessions}/2).` : 'Nenhuma sessão nos últimos 14 dias.'} />
              )}
            </Card>
          </motion.div>

          {/* ── Déficit hídrico por sessão ── */}
          <motion.div variants={fadeUp}>
            <Card>
              <p className="section-title">Déficit Hídrico — Últimas Sessões</p>
              {historyData.length > 0 ? (
                <div className="h-40 mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyData} barSize={14} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fill: tickColor, fontSize: 9, fontWeight: 600 }}
                        axisLine={false} tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        content={({ active, payload, label }) => (
                          <ChartTooltip active={active} payload={payload?.map(p => ({ ...p, name: 'Déficit' }))} label={label} unit=" ml" />
                        )}
                        cursor={false}
                      />
                      <Bar dataKey="deficit" radius={[5, 5, 3, 3]}>
                        {historyData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart minSessions={1} currentSessions={totalSessions} />
              )}
            </Card>
          </motion.div>

          {/* ── Distribuição por intensidade + Carga mensal ── */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Pie — intensidade */}
            <Card>
              <p className="section-title">Distribuição por Intensidade</p>
              {pieData.length > 0 ? (
                <div className="h-44 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={45} outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload?.length ? (
                            <div className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs shadow-card">
                              <p className="font-bold" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
                              <p className="text-white/60">{payload[0].value} sessões</p>
                            </div>
                          ) : null
                        }
                      />
                      <Legend
                        iconType="circle" iconSize={8}
                        formatter={(value) => <span className="text-[11px] text-white/60">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart minSessions={1} currentSessions={totalSessions} />
              )}
            </Card>

            {/* Monthly sessions */}
            <Card>
              <p className="section-title">Sessões por Mês</p>
              {monthlyData.length > 0 ? (
                <div className="h-44 mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} barSize={20} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <XAxis
                        dataKey="month"
                        tick={{ fill: tickColor, fontSize: 10 }}
                        axisLine={false} tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        content={({ active, payload, label }) =>
                          active && payload?.length ? (
                            <div className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs shadow-card">
                              <p className="font-bold text-white mb-1">{label}</p>
                              <p className="text-white/60">Sessões: <span className="font-bold text-white">{payload[0].value}</span></p>
                              <p className="text-white/60">Total: <span className="font-bold text-white">{formatDuration(payload[0].payload.minutes)}</span></p>
                            </div>
                          ) : null
                        }
                        cursor={false}
                      />
                      <Bar dataKey="sessions" radius={[6, 6, 4, 4]}>
                        {monthlyData.map((_, i) => (
                          <Cell key={i} fill={i === monthlyData.length - 1 ? '#C41E3A' : 'rgba(196,30,58,0.35)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart minSessions={1} currentSessions={totalSessions} />
              )}
            </Card>
          </motion.div>

          {/* ── Carga metabólica semanal ── */}
          <motion.div variants={fadeUp}>
            <Card>
              <p className="section-title">Carga Metabólica — Semana Atual</p>
              <WeeklyChart weeklyData={dashboard?.weeklyData} />
            </Card>
          </motion.div>

          {/* ── Observações clínicas (dinâmicas) ── */}
          <motion.div variants={fadeUp}>
            <p className="section-title">Observações Clínicas</p>
            <div className="space-y-3">
              {lastSession ? (
                <>
                  {/* Sweat rate note */}
                  <ClinicalNote
                    icon="💧"
                    color="border-sky-500/20 bg-sky-500/5"
                    title="Taxa de Sudorese"
                    desc={
                      lastSession.sweat_rate_lh >= 1.5
                        ? `Taxa de ${lastSession.sweat_rate_lh} L/h — considerada alta. Aumente a ingestão hídrica em 20% na próxima sessão.`
                        : lastSession.sweat_rate_lh >= 0.8
                        ? `Taxa de ${lastSession.sweat_rate_lh} L/h — dentro da faixa moderada. Mantenha o protocolo atual de hidratação.`
                        : `Taxa de ${lastSession.sweat_rate_lh ?? '—'} L/h — baixa. Verifique intensidade e condições ambientais.`
                    }
                  />
                  {/* Deficit note */}
                  <ClinicalNote
                    icon="⚖️"
                    color="border-amber-500/20 bg-amber-500/5"
                    title="Déficit Hídrico"
                    desc={
                      Math.abs(deficitMl) > 2000
                        ? `Perda de ${(Math.abs(deficitMl)/1000).toFixed(2)}L — déficit elevado. Reidratação de ${Math.round(Math.abs(deficitMl)*1.5)}ml nas próximas 4 horas.`
                        : `Perda de ${(Math.abs(deficitMl)/1000).toFixed(2)}L — dentro do aceitável. Reidratação de ${Math.round(Math.abs(deficitMl)*1.5)}ml recomendada.`
                    }
                  />
                  {/* Sodium note */}
                  {lastSession.sodium_loss_mg && (
                    <ClinicalNote
                      icon="🧂"
                      color="border-violet-500/20 bg-violet-500/5"
                      title="Perda de Sódio"
                      desc={`Perda estimada de ${lastSession.sodium_loss_mg}mg de sódio. ${lastSession.sodium_loss_mg > 1500 ? 'Sachê eletrolítico isotônico recomendado.' : 'Alimentação normal de reposição é suficiente.'}`}
                    />
                  )}
                </>
              ) : (
                <div className="border border-border rounded-2xl p-4 text-center text-xs text-white/30">
                  Observações clínicas aparecem após a primeira sessão completada.
                </div>
              )}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </AppLayout>
  );
}

function ClinicalNote({ icon, color, title, desc }) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      className={`flex items-start gap-3 p-4 rounded-2xl border ${color} cursor-default`}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div>
        <p className="font-bold text-sm mb-0.5">{title}</p>
        <p className="text-xs text-white/55 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}
