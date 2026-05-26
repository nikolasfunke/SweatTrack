import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Droplets, Clock, CheckCircle2, Save, Download,
  Beaker, Pill, Eye, TrendingDown, Activity, Thermometer,
} from 'lucide-react';
import { printSessionReport } from '../utils/printReport';
import { sessionApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { formatDuration, calcRecoveryFluid, getSweatRateLabel } from '../utils/calculations';

const stagger = { animate: { transition: { staggerChildren: 0.09 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const SESSION_TYPE_LABEL = { training: 'Treino', match: 'Jogo', recovery: 'Recuperação' };
const INTENSITY_COLOR = { baixa: '#34d399', moderada: '#fbbf24', alta: '#f87171', variada: '#a78bfa' };

export default function PostSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    sessionApi.getOne(id)
      .then((r) => setSession(r.data))
      .catch(() => toast('Erro ao carregar sessão', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = () => {
    setSaved(true);
    toast('Salvo no prontuário!', 'success');
  };

  if (loading) return (
    <AppLayout>
      <Header title="Resumo Pós-Sessão" showBack />
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-primary animate-spin" />
      </div>
    </AppLayout>
  );

  const deficitMl    = Math.abs(session?.hydric_deficit_ml ?? 0);
  const sodiumMg     = session?.sodium_loss_mg ?? 0;
  const duration     = session?.duration_minutes ?? 0;
  const sweatRate    = session?.sweat_rate_lh ?? 0;
  const intTemp      = session?.internal_temp ?? null;
  const sessionType  = SESSION_TYPE_LABEL[session?.session_type] ?? 'Sessão';
  const intensity    = session?.intensity ?? 'moderada';
  const intColor     = INTENSITY_COLOR[intensity] ?? '#C41E3A';
  const sweatLabel   = getSweatRateLabel(sweatRate);

  const recoveryHours = deficitMl > 0 ? Math.max(8, Math.round(deficitMl / 200)) : 8;

  const recoverySteps = [
    {
      icon: <Droplets size={18} className="text-sky-400" />,
      title: 'Reidratação Imediata',
      desc: deficitMl > 0
        ? `Consuma ${calcRecoveryFluid(deficitMl)}ml de fluidos nas próximas 4 horas (150% da perda total de ${(deficitMl / 1000).toFixed(2)}L).`
        : 'Mantenha hidratação regular pós-sessão com 500–800ml de fluidos.',
      color: 'border-sky-500/20 bg-sky-500/5',
    },
    {
      icon: <Pill size={18} className="text-amber-400" />,
      title: 'Reposição de Eletrólitos',
      desc: sodiumMg > 0
        ? `Perda de sódio estimada em ${sodiumMg}mg. ${sodiumMg > 1500 ? 'Sachê eletrolítico isotônico recomendado.' : 'Alimentação normal de reposição é suficiente.'}`
        : 'Inclua fontes de sódio na alimentação pós-treino.',
      color: 'border-amber-500/20 bg-amber-500/5',
    },
    {
      icon: <Eye size={18} className="text-violet-400" />,
      title: 'Monitoramento de Urina',
      desc: 'Acompanhe a coloração da urina até atingir o tom amarelo-claro (Padrão 1-2 na escala de WUTS).',
      color: 'border-violet-500/20 bg-violet-500/5',
    },
  ];

  const sessionDate = session?.ended_at
    ? new Date(session.ended_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  return (
    <AppLayout>
      <Header title="Resumo Pós-Sessão" showBack />
      <div className="page-container md:max-w-2xl">
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">

          {/* Header */}
          <motion.div variants={fadeUp}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Relatório de Performance</p>
            <h1 className="text-2xl font-black mt-1">
              Resumo<br />Pós-Sessão
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{ background: `${intColor}20`, color: intColor }}
              >
                {intensity.toUpperCase()}
              </span>
              <span className="text-xs text-white/40">{sessionType}</span>
              {sessionDate && <span className="text-xs text-white/30">· {sessionDate}</span>}
            </div>
          </motion.div>

          {/* Main metrics */}
          <motion.div variants={fadeUp}>
            <Card glow>
              <p className="section-title">Taxa de Sudorese</p>
              <div className="flex items-end gap-2 mb-1">
                <p className="text-5xl font-black tabular-nums">
                  {sweatRate > 0 ? sweatRate.toFixed(2) : '—'}
                </p>
                {sweatRate > 0 && <p className="text-xl text-white/40 font-bold mb-1">L/h</p>}
              </div>
              {sweatRate > 0 && (
                <p className="text-xs text-white/50 bg-surface-2 rounded-xl px-3 py-2 mb-4">
                  Classificada como{' '}
                  <span className={`font-bold ${sweatLabel.color}`}>{sweatLabel.label.toLowerCase()}</span>
                  {intTemp && ` para as condições registradas (${intTemp}°C).`}
                  {!intTemp && '.'}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-surface-2 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingDown size={13} className="text-rose-400" />
                    <p className="text-xs text-white/40">Perda Total</p>
                  </div>
                  <p className="text-xl font-black text-rose-400">
                    {deficitMl > 0 ? `${(deficitMl / 1000).toFixed(2)}L` : '—'}
                  </p>
                </div>
                <div className="bg-surface-2 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock size={13} className="text-white/40" />
                    <p className="text-xs text-white/40">Duração</p>
                  </div>
                  <p className="text-xl font-black">{duration > 0 ? formatDuration(duration) : '—'}</p>
                </div>
              </div>

              {/* Extra metrics row */}
              {(sodiumMg > 0 || intTemp) && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {sodiumMg > 0 && (
                    <div className="bg-surface-2 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Beaker size={13} className="text-amber-400" />
                        <p className="text-xs text-white/40">Sódio perdido</p>
                      </div>
                      <p className="text-lg font-black text-amber-400">{sodiumMg}mg</p>
                    </div>
                  )}
                  {intTemp && (
                    <div className="bg-surface-2 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Thermometer size={13} className={intTemp > 38.5 ? 'text-rose-400' : 'text-violet-400'} />
                        <p className="text-xs text-white/40">Temp. Interna</p>
                      </div>
                      <p className={`text-lg font-black ${intTemp > 38.5 ? 'text-rose-400' : 'text-violet-400'}`}>
                        {intTemp}°C
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Pre / Post weight */}
          {(session?.pre_weight_kg || session?.post_weight_kg) && (
            <motion.div variants={fadeUp}>
              <Card>
                <p className="section-title">Variação de Peso</p>
                <div className="flex items-center justify-around py-1">
                  <div className="text-center">
                    <p className="text-[10px] text-white/30 mb-1">Pré-treino</p>
                    <p className="text-2xl font-black">{session.pre_weight_kg ?? '—'}</p>
                    <p className="text-xs text-white/30">kg</p>
                  </div>
                  {session.pre_weight_kg && session.post_weight_kg && (
                    <div className="text-center">
                      <p className="text-[10px] text-white/30 mb-1">Variação</p>
                      <p className="text-2xl font-black text-rose-400">
                        -{(session.pre_weight_kg - session.post_weight_kg).toFixed(2)}
                      </p>
                      <p className="text-xs text-white/30">kg</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-[10px] text-white/30 mb-1">Pós-treino</p>
                    <p className="text-2xl font-black">{session.post_weight_kg ?? '—'}</p>
                    <p className="text-xs text-white/30">kg</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Recovery protocol */}
          <motion.div variants={fadeUp}>
            <p className="section-title">Protocolo de Recuperação</p>
            <div className="space-y-3">
              {recoverySteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`flex items-start gap-3 p-4 rounded-2xl border ${step.color}`}
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-surface-2 font-black text-sm flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {step.icon}
                      <p className="font-bold text-sm">{step.title}</p>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recovery estimate */}
          <motion.div variants={fadeUp}>
            <div className="bg-gradient-to-r from-primary/20 to-rose-900/10 border border-primary/20 rounded-2xl p-4">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                Análise Biopsicossocial
              </p>
              <p className="font-black text-lg">
                Sua recuperação levará aprox. <span className="text-gradient">{recoveryHours}h</span>.
              </p>
              <p className="text-xs text-white/50 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Baseado no déficit hídrico e intensidade da sessão.
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 pb-4">
            <Button
              variant="outline"
              onClick={() => session && printSessionReport(session)}
              icon={<Download size={16} />}
            >
              Exportar PDF
            </Button>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </motion.div>

        </motion.div>
      </div>
    </AppLayout>
  );
}
