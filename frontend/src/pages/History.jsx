import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Filter, Search, Droplets, Clock, Activity, Plus } from 'lucide-react';
import { sessionApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import SessionCard from '../components/session/SessionCard';
import SessionDetailModal from '../components/session/SessionDetailModal';
import { formatDuration, INTENSITY_LABELS } from '../utils/calculations';
import { isMobileViewport } from '../utils/device';


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
      if (isMobileViewport()) {
        navigate(`/post-session/${s.id}`);
        return;
      }

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
      <SessionDetailModal
        session={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </AppLayout>
  );
}
