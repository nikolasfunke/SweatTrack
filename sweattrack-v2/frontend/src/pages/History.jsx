import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Filter, Search, Droplets, Clock, Activity, Plus,
  Thermometer, Zap, Scale, Download, TrendingDown,
} from 'lucide-react';
import { printSessionReport } from '../utils/printReport';
import { sessionApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import SessionCard from '../components/session/SessionCard';
import {
  formatDuration, relativeDate, INTENSITY_LABELS,
  getSweatRateLabel, calcRecoveryFluid,
} from '../utils/calculations';

const SESSION_TYPE_LABEL = { training: 'Treino', match: 'Jogo', recovery: 'Recuperação' };
const INTENSITY_COLOR = { baixa: '#34d399', moderada: '#fbbf24', alta: '#f87171', variada: '#a78bfa' };

export default function History() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    sessionApi.list()
      .then((r) => setSessions(r.data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const isVirgin = loaded && sessions.length === 0;

  const filtered = sessions.filter((s) => {
    if (filter !== 'all' && s.intensity !== filter) return false;
    if (search && !s.session_type?.includes(search.toLowerCase())) return false;
    return true;
  });

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const totalMin = completedSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const avgSweat = completedSessions.length
    ? (completedSessions.reduce((acc, s) => acc + (parseFloat(s.sweat_rate_lh) || 0), 0) / completedSessions.length).toFixed(2)
    : '0.00';

  const handleSessionClick = (s) => {
    if (s.status === 'completed') {
      setSelected(s);
    } else {
      navigate(`/pre-session/${s.id}`);
    }
  };

  return (
    <AppLayout>
      <Header title="Histórico" actions={
        <button
          onClick={() => setShowFilter(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white px-3 py-1.5 rounded-xl bg-surface-2 border border-border transition-colors"
        >
          <Filter size={13} /> Filtrar
        </button>
      } />

      <div className="page-container md:max-w-2xl">
        <div className="space-y-5">

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Calendar size={15} className="text-primary" />, val: completedSessions.length, label: 'Sessões' },
              { icon: <Clock size={15} className="text-sky-400" />, val: formatDuration(totalMin), label: 'Total' },
              { icon: <Droplets size={15} className="text-amber-400" />, val: `${avgSweat}L/h`, label: 'Média suor' },
            ].map(({ icon, val, label }) => (
              <Card key={label} className="text-center p-3">
                <div className="flex justify-center mb-1">{icon}</div>
                <p className="font-black text-sm">{val}</p>
                <p className="text-[10px] text-white/30">{label}</p>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Buscar sessões..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 text-sm"
            />
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 no-scrollbar overflow-x-auto pb-1">
            {['all', 'baixa', 'moderada', 'alta', 'variada'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-surface-2 text-white/40 hover:text-white border border-border'
                }`}
              >
                {f === 'all' ? 'Todas' : INTENSITY_LABELS[f]}
              </button>
            ))}
          </div>

          {/* Session list */}
          <div className="space-y-2">
            {isVirgin ? (
              <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
                  <Activity size={26} className="text-white/20" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/60">Histórico vazio</p>
                  <p className="text-xs text-white/30 mt-1 max-w-[220px] mx-auto leading-relaxed">
                    Suas sessões de treino e monitoramento aparecerão aqui após você criar a primeira.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:opacity-80 transition-opacity"
                >
                  <Plus size={13} /> Ir para o dashboard
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-white/30 text-sm">
                Nenhuma sessão encontrada
              </div>
            ) : (
              filtered.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <SessionCard session={s} onClick={() => handleSessionClick(s)} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Filter modal */}
      <Modal open={showFilter} onClose={() => setShowFilter(false)} title="Filtrar Sessões">
        <div className="space-y-3">
          <p className="text-sm text-white/50">Intensidade</p>
          {['all', 'baixa', 'moderada', 'alta', 'variada'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setShowFilter(false); }}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-surface-2 text-white/50 hover:bg-surface-3'
              }`}
            >
              {f === 'all' ? 'Todas' : INTENSITY_LABELS[f]}
            </button>
          ))}
        </div>
      </Modal>

      {/* Session detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} size="full">
        {selected && <SessionDetailContent session={selected} onClose={() => setSelected(null)} />}
      </Modal>
    </AppLayout>
  );
}

function SessionDetailContent({ session, onClose }) {
  const sweatLabel = getSweatRateLabel(session.sweat_rate_lh);
  const deficitMl = Math.abs(session.hydric_deficit_ml ?? 0);
  const recoveryMl = deficitMl > 0 ? calcRecoveryFluid(deficitMl) : null;
  const intColor = INTENSITY_COLOR[session.intensity] ?? '#C41E3A';

  const sessionDate = session.ended_at
    ? new Date(session.ended_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : relativeDate(session.created_at);

  return (
    <div className="space-y-4 -mt-1">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Activity size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-lg leading-tight">
              {SESSION_TYPE_LABEL[session.session_type] ?? 'Sessão'}
            </h3>
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: `${intColor}20`, color: intColor }}
            >
              {INTENSITY_LABELS[session.intensity] ?? session.intensity}
            </span>
          </div>
          <p className="text-xs text-white/40 mt-0.5">{sessionDate}</p>
          {session.duration_minutes && (
            <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1">
              <Clock size={11} /> {formatDuration(session.duration_minutes)}
            </p>
          )}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <MetricTile
          icon={<Droplets size={14} className="text-sky-400" />}
          label="Taxa de Suor"
          value={session.sweat_rate_lh ? `${session.sweat_rate_lh} L/h` : '—'}
          sub={session.sweat_rate_lh ? sweatLabel.label : undefined}
          subColor={sweatLabel.color}
        />
        <MetricTile
          icon={<TrendingDown size={14} className="text-rose-400" />}
          label="Déficit Hídrico"
          value={session.hydric_deficit_ml ? `${(deficitMl / 1000).toFixed(2)} L` : '—'}
          sub={deficitMl > 2000 ? 'Elevado' : deficitMl > 0 ? 'Normal' : undefined}
          subColor={deficitMl > 2000 ? 'text-rose-400' : 'text-emerald-400'}
        />
        <MetricTile
          icon={<Zap size={14} className="text-amber-400" />}
          label="Perda de Sódio"
          value={session.sodium_loss_mg ? `${session.sodium_loss_mg} mg` : '—'}
        />
        <MetricTile
          icon={<Thermometer size={14} className="text-violet-400" />}
          label="Temp. Interna"
          value={session.internal_temp ? `${session.internal_temp}°C` : '—'}
          sub={session.internal_temp ? (session.internal_temp > 38.5 ? 'ALERTA' : 'Normal') : undefined}
          subColor={session.internal_temp > 38.5 ? 'text-rose-400' : 'text-emerald-400'}
        />
      </div>

      {/* Pre / post weight */}
      {(session.pre_weight_kg || session.post_weight_kg) && (
        <div className="bg-surface-2 rounded-2xl p-3 flex items-center gap-4">
          <Scale size={15} className="text-white/30 flex-shrink-0" />
          <div className="flex gap-6">
            {session.pre_weight_kg && (
              <div>
                <p className="text-[10px] text-white/30">Pré-treino</p>
                <p className="font-bold text-sm">{session.pre_weight_kg} kg</p>
              </div>
            )}
            {session.post_weight_kg && (
              <div>
                <p className="text-[10px] text-white/30">Pós-treino</p>
                <p className="font-bold text-sm">{session.post_weight_kg} kg</p>
              </div>
            )}
            {session.pre_weight_kg && session.post_weight_kg && (
              <div>
                <p className="text-[10px] text-white/30">Variação</p>
                <p className="font-bold text-sm text-rose-400">
                  -{(session.pre_weight_kg - session.post_weight_kg).toFixed(2)} kg
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recovery insight */}
      {recoveryMl && (
        <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-3">
          <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">
            Recomendação de Recuperação
          </p>
          <p className="text-xs text-white/60 leading-relaxed">
            Consumir <span className="text-white font-bold">{recoveryMl}ml</span> de fluidos nas próximas 4 horas
            {session.sodium_loss_mg > 1500 ? ' com sachê eletrolítico isotônico.' : ' para reposição completa.'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        <Button variant="primary" icon={<Download size={15} />} onClick={() => printSessionReport(session)}>
          Exportar PDF
        </Button>
      </div>
    </div>
  );
}

function MetricTile({ icon, label, value, sub, subColor }) {
  return (
    <div className="bg-surface-2 rounded-2xl p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] text-white/40 font-medium">{label}</span>
      </div>
      <p className="font-black text-base leading-tight">{value}</p>
      {sub && <p className={`text-[10px] font-bold ${subColor ?? 'text-white/40'}`}>{sub}</p>}
    </div>
  );
}
