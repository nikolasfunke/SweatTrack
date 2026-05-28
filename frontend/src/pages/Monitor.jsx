import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Activity, Clock, ChevronRight, Zap } from 'lucide-react';
import { sessionApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SessionCard from '../components/session/SessionCard';
import SessionDetailModal from '../components/session/SessionDetailModal';
import { useToast } from '../components/ui/Toast';
import { isMobileViewport } from '../utils/device';

const STEPS = [
  { emoji: '📋', title: 'Pré-Sessão', desc: 'Peso, cor da urina e nível de sede antes do treino.' },
  { emoji: '⚡', title: 'Monitoramento', desc: 'Registro de ingestão hídrica e temperatura durante o exercício.' },
  { emoji: '📊', title: 'Pós-Sessão', desc: 'Peso final, cálculo de sudorese e déficit hídrico.' },
];

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function Monitor() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ sessionType: 'training', intensity: 'moderada' });
  const [creating, setCreating] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    sessionApi.list()
      .then((r) => setSessions(r.data.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded || !location.state?.openSessionId || isMobileViewport()) return;

    const target = sessions.find((session) => session.id === location.state.openSessionId);
    if (target) {
      setSelectedSession(target);
    }
  }, [loaded, location.state, sessions]);

  const activeSessions = sessions.filter((s) => s.status === 'pre' || s.status === 'active');
  const recentDone = sessions.filter((s) => s.status === 'completed').slice(0, 3);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { data } = await sessionApi.create(form);
      toast('Sessão criada!', 'success');
      setShowModal(false);
      navigate(`/pre-session/${data.id}`);
    } catch {
      toast('Erro ao criar sessão', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSessionClick = (session) => {
    if (session.status === 'completed') {
      if (isMobileViewport()) {
        navigate(`/post-session/${session.id}`);
        return;
      }

      setSelectedSession(session);
      return;
    }

    if (session.status === 'active') {
      navigate(`/active/${session.id}`);
      return;
    }

    navigate(`/pre-session/${session.id}`);
  };

  return (
    <AppLayout>
      <Header
        title="Monitorar"
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowModal(true)}>
            Nova Sessão
          </Button>
        }
      />

      <div className="page-container md:max-w-2xl">
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">

          {/* CTA hero */}
          <motion.div variants={fadeUp}>
            <div className="bg-gradient-to-br from-primary/20 to-rose-900/10 border border-primary/20 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Activity size={22} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-base mb-0.5">Iniciar Monitoramento</p>
                  <p className="text-xs text-white/50 leading-relaxed mb-3">
                    Protocolo clínico completo de hidratação em 3 etapas, baseado nas diretrizes ABNE 2025.
                  </p>
                  <Button variant="primary" size="sm" icon={<Zap size={14} />} onClick={() => setShowModal(true)}>
                    Nova Sessão
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Active sessions */}
          {loaded && activeSessions.length > 0 && (
            <motion.div variants={fadeUp}>
              <p className="section-title">Em andamento</p>
              <div className="space-y-3">
                {activeSessions.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onClick={() => handleSessionClick(s)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Protocol steps */}
          <motion.div variants={fadeUp}>
            <p className="section-title">Como funciona</p>
            <Card>
              <div className="space-y-4">
                {STEPS.map((step, i) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-surface-2 flex items-center justify-center flex-shrink-0 text-base">
                      {step.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Etapa {i + 1}</span>
                      </div>
                      <p className="text-sm font-bold">{step.title}</p>
                      <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="absolute left-[1.75rem] mt-10 w-px h-6 bg-border" style={{ position: 'relative', marginLeft: '-2.75rem', marginTop: '0.5rem' }} />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent completed */}
          {loaded && recentDone.length > 0 && (
            <motion.div variants={fadeUp}>
              <div className="flex items-center justify-between mb-3">
                <p className="section-title">Sessões recentes</p>
                <button
                  onClick={() => navigate('/history')}
                  className="flex items-center gap-1 text-xs text-primary font-bold hover:opacity-80"
                >
                  Ver todas <ChevronRight size={12} />
                </button>
              </div>
              <div className="space-y-3">
                {recentDone.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onClick={() => handleSessionClick(s)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty state when no sessions at all */}
          {loaded && sessions.length === 0 && (
            <motion.div variants={fadeUp}>
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center">
                  <Clock size={24} className="text-white/20" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/60">Nenhuma sessão ainda</p>
                  <p className="text-xs text-white/30 mt-1 max-w-[220px] mx-auto leading-relaxed">
                    Crie sua primeira sessão para iniciar o monitoramento de hidratação.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nova Sessão">
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
                  onClick={() => setForm((f) => ({ ...f, sessionType: val }))}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                    form.sessionType === val
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
                  onClick={() => setForm((f) => ({ ...f, intensity: v }))}
                  className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                    form.intensity === v
                      ? 'bg-primary/15 border-primary/40 text-white'
                      : 'bg-surface-2 border-border text-white/40 hover:border-border-bright'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <Button variant="primary" size="xl" loading={creating} onClick={handleCreate}>
            Criar Sessão
          </Button>
        </div>
      </Modal>

      <SessionDetailModal
        session={selectedSession}
        open={!!selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </AppLayout>
  );
}
