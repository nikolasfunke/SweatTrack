import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, CloudSun, Droplets, Download, Scale, TrendingDown, Zap,
} from 'lucide-react';
import { sessionApi } from '../services/api';
import { printSessionReport } from '../utils/printReport';
import {
  calcRecoveryFluid,
  formatDuration,
  getSweatRateLabel,
  INTENSITY_LABELS,
  relativeDate,
} from '../utils/calculations';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';

const SESSION_TYPE_LABEL = { training: 'Treino', match: 'Jogo', recovery: 'Recuperação' };
const INTENSITY_COLOR = { baixa: '#34d399', moderada: '#fbbf24', alta: '#f87171', variada: '#a78bfa' };

export default function PostSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionApi.getOne(id)
      .then((r) => setSession(r.data))
      .catch(() => {
        toast('Erro ao carregar sessão', 'error');
        navigate('/monitor', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <AppLayout>
        <Header title="Pós-Sessão" showBack />
        <div className="page-container">
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-primary animate-spin" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!session) return null;

  const intensity = session.intensity || 'moderada';
  const intensityColor = INTENSITY_COLOR[intensity] ?? '#C41E3A';
  const sweatLabel = getSweatRateLabel(session.sweat_rate_lh);
  const deficitMl = Math.abs(session.hydric_deficit_ml ?? 0);
  const recoveryMl = deficitMl > 0 ? calcRecoveryFluid(deficitMl) : null;
  const sessionDate = session.ended_at
    ? new Date(session.ended_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : relativeDate(session.created_at);

  return (
    <AppLayout>
      <Header title="Pós-Sessão" showBack />
      <div className="page-container md:max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-4">
          <div className="overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/20 via-rose-950/20 to-surface-1 p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/15">
                  <Activity size={20} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/80">
                    Resumo da Sessão
                  </p>
                  <h1 className="mt-1 text-xl font-black leading-tight">
                    {SESSION_TYPE_LABEL[session.session_type] ?? 'Sessão'}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-black"
                      style={{ background: `${intensityColor}20`, color: intensityColor }}
                    >
                      {INTENSITY_LABELS[intensity] ?? intensity}
                    </span>
                    <span className="text-[11px] text-white/45">{sessionDate}</span>
                  </div>
                </div>
              </div>
              {session.duration_minutes ? (
                <div className="rounded-2xl border border-border bg-black/15 px-3 py-2 text-right">
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Duração</p>
                  <p className="mt-0.5 text-sm font-black">{formatDuration(session.duration_minutes)}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-[24px] border border-primary/15 bg-black/15 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">Taxa de Suor</p>
              <div className="mt-2 flex items-end gap-2">
                <p className="text-5xl font-black leading-none">
                  {session.sweat_rate_lh ? Number(session.sweat_rate_lh).toFixed(2) : '—'}
                </p>
                {session.sweat_rate_lh ? <p className="pb-1 text-base font-bold text-white/35">L/h</p> : null}
              </div>
              {session.sweat_rate_lh ? (
                <p className={`mt-2 text-xs font-bold ${sweatLabel.color}`}>
                  {sweatLabel.label}
                </p>
              ) : (
                <p className="mt-2 text-xs text-white/35">
                  Peso pós-sessão não informado, então a taxa não pôde ser calculada.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={<TrendingDown size={14} className="text-rose-400" />}
              label="Déficit Hídrico"
              value={session.hydric_deficit_ml ? `${(deficitMl / 1000).toFixed(2)} L` : '—'}
              hint={session.hydric_deficit_ml ? (deficitMl > 2000 ? 'Elevado' : 'Dentro do esperado') : 'Sem cálculo'}
              hintClass={deficitMl > 2000 ? 'text-rose-400' : 'text-emerald-400'}
            />
            <MetricCard
              icon={<Zap size={14} className="text-amber-400" />}
              label="Perda de Sódio"
              value={session.sodium_loss_mg ? `${session.sodium_loss_mg} mg` : '—'}
              hint={session.sodium_loss_mg ? 'Estimativa da sessão' : 'Sem cálculo'}
            />
            <MetricCard
              icon={<Droplets size={14} className="text-sky-400" />}
              label="Ingestão Total"
              value={`${session.total_fluid_intake_ml ?? 0} ml`}
              hint="Registrada durante o treino"
            />
            <MetricCard
              icon={<CloudSun size={14} className="text-sky-400" />}
              label="Clima Externo"
              value={session.ambient_temp ? `${session.ambient_temp}°C` : '—'}
              hint={session.ambient_temp ? 'Capturado na finalização' : 'Não disponível'}
            />
          </div>

          {(session.pre_weight_kg || session.post_weight_kg) && (
            <Card>
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-white/35" />
                <p className="text-sm font-bold">Massa Corporal</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <WeightStat label="Pré-sessão" value={session.pre_weight_kg} />
                <WeightStat label="Pós-sessão" value={session.post_weight_kg} />
              </div>
              {session.pre_weight_kg && session.post_weight_kg ? (
                <div className="mt-3 rounded-2xl bg-surface-2 px-3 py-2 text-xs text-white/55">
                  Variação: <span className="font-bold text-rose-400">-{(session.pre_weight_kg - session.post_weight_kg).toFixed(2)} kg</span>
                </div>
              ) : null}
            </Card>
          )}

          {recoveryMl ? (
            <div className="rounded-[24px] border border-sky-500/20 bg-sky-500/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-400">
                Recuperação Recomendada
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Consuma <span className="font-bold text-white">{recoveryMl}ml</span> de fluidos nas próximas 4 horas
                {session.sodium_loss_mg > 1500 ? ' com reposição eletrolítica.' : ' para repor as perdas da sessão.'}
              </p>
            </div>
          ) : (
            <div className="rounded-[24px] border border-border bg-surface-1 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                Recuperação
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Como não houve peso pós-sessão, o app não calculou a perda total. Use ingestão hídrica regular e observe sinais clínicos.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Voltar
            </Button>
            <Button
              variant="primary"
              icon={<Download size={15} />}
              onClick={() => printSessionReport(session)}
            >
              Exportar PDF
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

function MetricCard({ icon, label, value, hint, hintClass = 'text-white/35' }) {
  return (
    <div className="rounded-[22px] border border-border bg-surface-1 p-3.5 shadow-card">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-medium text-white/40">{label}</span>
      </div>
      <p className="mt-2 text-lg font-black leading-tight">{value}</p>
      {hint ? <p className={`mt-1 text-[10px] font-bold ${hintClass}`}>{hint}</p> : null}
    </div>
  );
}

function WeightStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3">
      <p className="text-[10px] text-white/35">{label}</p>
      <p className="mt-1 text-xl font-black">{value ? `${value} kg` : '—'}</p>
    </div>
  );
}
