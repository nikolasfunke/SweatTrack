import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Thermometer, Zap, Droplets, ChevronRight,
  FileText, History, TrendingUp, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsApi, sessionApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import HydrationGauge from '../components/charts/HydrationGauge';
import WeeklyChart from '../components/charts/WeeklyChart';
import SessionCard from '../components/session/SessionCard';
import SessionDetailModal from '../components/session/SessionDetailModal';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { getSweatRateLabel } from '../utils/calculations';
import { isMobileViewport } from '../utils/device';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({ sessionType: 'training', intensity: 'moderada' });
  const [creating, setCreating] = useState(false);
  const [detailSession, setDetailSession] = useState(null);

  useEffect(() => {
    analyticsApi.dashboard().then((r) => setAnalytics(r.data)).catch(() => {});
    sessionApi.list()
      .then((r) => setSessions(r.data))
      .catch(() => {})
      .finally(() => setSessionsLoaded(true));
  }, []);

  const last = analytics?.lastSession;
  const sweatLabel = getSweatRateLabel(last?.sweat_rate_lh);
  const hydrationIndex = analytics?.hydrationIndex ?? null;
  const isVirgin = sessionsLoaded && sessions.length === 0;

  const handleCreateSession = async () => {
    setCreating(true);
    try {
      const { data } = await sessionApi.create(sessionForm);
      toast('Sessão criada!', 'success');
      setShowNewSession(false);
      navigate(`/pre-session/${data.id}`);
    } catch {
      toast('Erro ao criar sessão', 'error');
    } finally {
      setCreating(false);
    }
  };

  const openCompletedSession = (session) => {
    if (isMobileViewport()) {
      navigate(`/post-session/${session.id}`);
      return;
    }

    setDetailSession(session);
  };

  // Show first two words so "Dr. Silva" renders fully instead of just "Dr."
  const displayName = user?.name?.split(' ').slice(0, 2).join(' ') || 'Atleta';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <AppLayout>
      <Header />
      <div className="page-container md:max-w-4xl">
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">

          {/* Greeting */}
          <motion.div variants={fadeUp} className="pt-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                  Dashboard de Performance
                </p>
                <h1 className="text-2xl font-black mt-0.5">
                  {greeting}, {displayName}
                </h1>
                {user?.clinicName && (
                  <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
                    {user.clinicName}
                  </p>
                )}
              </div>
              {/* Button hidden on very small screens, shown on sm+ */}
              <div className="hidden sm:block flex-shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowNewSession(true)}
                  icon={<Plus size={16} />}
                >
                  Nova Sessão
                </Button>
              </div>
            </div>
            {/* Full-width button on mobile */}
            <div className="sm:hidden mt-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowNewSession(true)}
                icon={<Plus size={16} />}
                className="w-full"
              >
                Nova Sessão
              </Button>
            </div>
          </motion.div>

          {/* Virgin onboarding banner */}
          {isVirgin && (
            <motion.div variants={fadeUp}>
              <div className="bg-gradient-to-r from-primary/15 to-rose-900/5 border border-primary/30 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Zap size={22} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm mb-1">Bem-vindo ao SweatTrack!</p>
                    <p className="text-xs text-white/50 leading-relaxed mb-3">
                      Crie sua primeira sessão de monitoramento para visualizar métricas reais de
                      hidratação, taxa de suor e performance atlética.
                    </p>
                    <button
                      onClick={() => setShowNewSession(true)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:opacity-80 transition-opacity"
                    >
                      <Plus size={13} /> Criar primeira sessão
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hydration card */}
          <motion.div variants={fadeUp}>
            <Card glow className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="section-title mb-0">Status de Hidratação</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Monitoramento biométrico em tempo real.</p>
                </div>
                {hydrationIndex !== null && <Badge variant="otimo">ÓTIMO</Badge>}
              </div>
              <div className="flex items-center gap-6 mt-3">
                {hydrationIndex !== null ? (
                  <HydrationGauge value={hydrationIndex} size={140} />
                ) : (
                  <div className="w-[140px] h-[140px] flex items-center justify-center flex-shrink-0">
                    <div className="text-center">
                      <Droplets size={32} className="text-white/20 mx-auto mb-1" />
                      <p className="text-[10px] text-white/30">Sem dados</p>
                    </div>
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <StatRow
                    icon={<Zap size={14} className="text-amber-400" />}
                    label="Taxa de Suor"
                    value={last?.sweat_rate_lh ? `${last.sweat_rate_lh} L/h` : '—'}
                    sub={last?.sweat_rate_lh ? sweatLabel.label : undefined}
                    subColor={sweatLabel.color}
                  />
                  <StatRow
                    icon={<Droplets size={14} className="text-sky-400" />}
                    label="Sódio"
                    value={last?.sodium_loss_mg ? `${last.sodium_loss_mg} mg/L` : '—'}
                  />
                  <StatRow
                    icon={<Thermometer size={14} className="text-rose-400" />}
                    label="Temperatura"
                    value={last?.internal_temp ? `${last.internal_temp}°C` : '—'}
                    sub={last?.internal_temp ? (last.internal_temp > 38.5 ? 'ALERTA' : 'Normal') : undefined}
                    subColor={last?.internal_temp > 38.5 ? 'text-rose-400' : 'text-emerald-400'}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* SweatTrack promo */}
          <motion.div variants={fadeUp}>
            <div className="bg-gradient-to-r from-primary/20 to-rose-900/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">Sweat-Track</p>
                <p className="text-xs text-white/60 mt-0.5">
                  Tecnologia clínica para análise termoregulatória de alta precisão.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick access */}
          <motion.div variants={fadeUp}>
            <p className="section-title">Acesso Rápido</p>
            <div className="grid grid-cols-2 gap-3">
              <QuickCard
                icon={<FileText size={16} className="text-sky-400" />}
                label="Relatórios Exportáveis"
                onClick={() => navigate('/analytics')}
              />
              <QuickCard
                icon={<History size={16} className="text-violet-400" />}
                label="Histórico de Testes"
                onClick={() => navigate('/history')}
              />
            </div>
          </motion.div>

          {/* Weekly chart */}
          <motion.div variants={fadeUp}>
            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="section-title mb-0">Tendência Semanal</p>
                {!isVirgin && (
                  <button
                    onClick={() => navigate('/analytics')}
                    className="text-xs text-primary font-semibold flex items-center gap-1 hover:opacity-80"
                  >
                    Ver tudo <ChevronRight size={12} />
                  </button>
                )}
              </div>
              {isVirgin ? (
                <div className="h-28 flex items-center justify-center">
                  <p className="text-xs text-white/25 text-center max-w-[180px]">
                    A carga metabólica semanal aparece após sua primeira sessão
                  </p>
                </div>
              ) : (
                <WeeklyChart weeklyData={analytics?.weeklyData} />
              )}
            </Card>
          </motion.div>

          {/* Recent sessions */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-3">
              <p className="section-title mb-0">Sessões Recentes</p>
              <button
                onClick={() => navigate('/history')}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:opacity-80"
              >
                Ver todas <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {sessions.length === 0 ? (
                <EmptyState onNew={() => setShowNewSession(true)} />
              ) : (
                sessions.slice(0, 5).map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onClick={() =>
                      s.status === 'completed'
                        ? openCompletedSession(s)
                        : navigate(`/pre-session/${s.id}`)
                    }
                  />
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Session detail modal */}
      <SessionDetailModal
        session={detailSession}
        open={!!detailSession}
        onClose={() => setDetailSession(null)}
      />

      {/* New session modal */}
      <Modal open={showNewSession} onClose={() => setShowNewSession(false)} title="Nova Sessão">
        <div className="space-y-4">
          <div>
            <label className="label">Tipo de Sessão</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'training', label: 'Treino',  emoji: '🏋️' },
                { val: 'match',    label: 'Jogo',    emoji: '⚽' },
                { val: 'recovery', label: 'Recup.',  emoji: '🧘' },
              ].map(({ val, label, emoji }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSessionForm((f) => ({ ...f, sessionType: val }))}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                    sessionForm.sessionType === val
                      ? 'bg-primary/15 border-primary/40 text-white'
                      : 'bg-surface-2 border-border text-white/40 hover:border-border-bright'
                  }`}
                >
                  <div className="text-xl mb-1">{emoji}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Intensidade</label>
            <div className="grid grid-cols-4 gap-2">
              {['baixa', 'moderada', 'alta', 'variada'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSessionForm((f) => ({ ...f, intensity: v }))}
                  className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                    sessionForm.intensity === v
                      ? 'bg-primary/15 border-primary/40 text-white'
                      : 'bg-surface-2 border-border text-white/40 hover:border-border-bright'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" size="xl" loading={creating} onClick={handleCreateSession}>
            Criar Sessão
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}

function StatRow({ icon, label, value, sub, subColor }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-bold">{value}</span>
        {sub && <p className={`text-[10px] font-bold ${subColor || 'text-white/40'}`}>{sub}</p>}
      </div>
    </div>
  );
}

function QuickCard({ icon, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-2 border border-border hover:border-border-bright text-left transition-colors w-full"
    >
      <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="text-xs font-semibold text-white/70">{label}</span>
      <ChevronRight size={12} className="text-white/20 ml-auto" />
    </motion.button>
  );
}

function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
        <AlertCircle size={26} className="text-white/20" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white/60">Nenhuma sessão registrada</p>
        <p className="text-xs text-white/30 mt-1 max-w-[220px] mx-auto leading-relaxed">
          Registre seu primeiro treino para acompanhar hidratação e desempenho em tempo real.
        </p>
      </div>
      <Button variant="primary" size="sm" onClick={onNew} icon={<Plus size={14} />}>
        Criar primeira sessão
      </Button>
    </div>
  );
}
