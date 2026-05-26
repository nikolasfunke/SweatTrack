import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Droplets, Thermometer, Activity, StopCircle, Lightbulb } from 'lucide-react';
import { sessionApi } from '../services/api';
import { useToast } from '../components/ui/Toast';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { formatTimer } from '../utils/calculations';

const FLUID_OPTIONS = [150, 250, 500];

export default function ActiveMonitoring() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [elapsed, setElapsed] = useState(0);
  const [fluidLogs, setFluidLogs] = useState([]);
  const [totalFluid, setTotalFluid] = useState(0);
  const [sweatRate, setSweatRate] = useState(1.4);
  const [internalTemp, setInternalTemp] = useState(38.2);
  const [hydricDeficit, setHydricDeficit] = useState(-450);
  const [showFinish, setShowFinish] = useState(false);
  const [showFluid, setShowFluid] = useState(false);
  const [showTempModal, setShowTempModal] = useState(false);
  const [customFluid, setCustomFluid] = useState('');
  const [newTemp, setNewTemp] = useState('');
  const [postWeight, setPostWeight] = useState('');
  const [finishing, setFinishing] = useState(false);
  const tickRef = useRef(null);

  useEffect(() => {
    tickRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  // Simulate small real-time fluctuations
  useEffect(() => {
    const sim = setInterval(() => {
      setSweatRate((r) => parseFloat((r + (Math.random() - 0.5) * 0.05).toFixed(2)));
      setInternalTemp((t) => parseFloat((t + (Math.random() - 0.5) * 0.05).toFixed(1)));
    }, 8000);
    return () => clearInterval(sim);
  }, []);

  const logFluid = async (ml) => {
    try {
      await sessionApi.logFluid(id, { amountMl: ml, drinkType: 'water' });
      const entry = { id: Date.now(), ml, time: formatTimer(elapsed) };
      setFluidLogs((l) => [entry, ...l]);
      setTotalFluid((t) => t + ml);
      setHydricDeficit((d) => d + ml);
      toast(`+${ml}ml registrado`, 'success');
      setShowFluid(false);
      setCustomFluid('');
    } catch {
      toast('Erro ao registrar', 'error');
    }
  };

  const handleUpdateTemp = async () => {
    const val = parseFloat(newTemp);
    if (!val || val < 35 || val > 43) { toast('Temperatura inválida', 'warning'); return; }
    try {
      await sessionApi.updateTemp(id, { internalTemp: val });
      setInternalTemp(val);
      setShowTempModal(false);
      setNewTemp('');
      toast('Temperatura atualizada', 'success');
    } catch {
      toast('Erro ao atualizar', 'error');
    }
  };

  const handleFinish = async () => {
    if (!postWeight) { toast('Insira o peso pós-sessão', 'warning'); return; }
    setFinishing(true);
    try {
      await sessionApi.finish(id, {
        postWeightKg: parseFloat(postWeight),
        durationMinutes: Math.round(elapsed / 60),
      });
      navigate(`/post-session/${id}`);
    } catch {
      toast('Erro ao finalizar sessão', 'error');
      setFinishing(false);
    }
  };

  const deficitColor = hydricDeficit < 0 ? 'text-rose-400' : 'text-emerald-400';
  const tempAlert = internalTemp >= 39;

  return (
    <AppLayout>
      <Header title="Monitoramento Ativo" showBack />
      <div className="page-container md:max-w-2xl">
        <div className="space-y-4">

          {/* Status bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Monitoramento Ativo</span>
            </div>
            <span className="font-mono text-sm text-white/60 font-medium">
              Duração: {formatTimer(elapsed)}
            </span>
          </motion.div>

          {/* Main sweat rate card */}
          <Card glow>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-2">Taxa de Sudorese Est.</p>
            <motion.div
              className="text-center py-4"
              key={sweatRate}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-7xl font-black tabular-nums leading-none">
                {sweatRate.toFixed(1)}
              </p>
              <p className="text-xl text-white/40 font-bold mt-1">L/h</p>
            </motion.div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setShowTempModal(true)}
                className="bg-surface-2 rounded-xl p-3 text-center hover:bg-surface-3 transition-colors"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Thermometer size={14} className={tempAlert ? 'text-rose-400' : 'text-amber-400'} />
                  <span className="text-xs text-white/40">Temp. Interna</span>
                </div>
                <p className={`text-xl font-black ${tempAlert ? 'text-rose-400' : 'text-white'}`}>
                  {internalTemp.toFixed(1)}°C
                </p>
              </button>
              <div className="bg-surface-2 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Droplets size={14} className="text-sky-400" />
                  <span className="text-xs text-white/40">Déficit Hídrico</span>
                </div>
                <p className={`text-xl font-black ${deficitColor}`}>
                  {hydricDeficit > 0 ? '+' : ''}{hydricDeficit}ml
                </p>
              </div>
            </div>
          </Card>

          {/* Fluid intake */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-sm">Registro de Ingestão</p>
              <span className="text-xs text-white/40 font-medium">Total: {totalFluid}ml</span>
            </div>
            <div className="flex items-center gap-2">
              {FLUID_OPTIONS.map((ml) => (
                <button
                  key={ml}
                  onClick={() => logFluid(ml)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-2 border border-border hover:border-primary/40 hover:bg-primary/10 text-sm font-bold transition-all active:scale-95"
                >
                  {ml}
                  <span className="text-[10px] text-white/40 block">ml</span>
                </button>
              ))}
              <button
                onClick={() => setShowFluid(true)}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-red-glow active:scale-95 transition-transform"
              >
                <Plus size={18} />
              </button>
            </div>
            {/* Log entries */}
            <AnimatePresence>
              {fluidLogs.slice(0, 3).map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between text-xs text-white/50 mt-2 py-1 border-t border-border"
                >
                  <span>💧 +{entry.ml}ml</span>
                  <span>{entry.time}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </Card>

          {/* Performance suggestion */}
          <Card>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb size={16} className="text-sky-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">Sugestão de Performance</p>
                <p className="text-sm text-white/70 leading-relaxed">
                  Seu ritmo atual sugere uma ingestão de{' '}
                  <span className="text-white font-bold">200ml a cada 15 minutos</span>{' '}
                  para manter a homeostase hídrica.
                </p>
              </div>
            </div>
          </Card>

          {/* Temperature alert */}
          {tempAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3"
            >
              <Activity size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-400 text-sm">⚠️ Temperatura elevada</p>
                <p className="text-xs text-white/60 mt-1">
                  Temperatura interna acima de 39°C. Considere reduzir a intensidade e aumentar a ingestão hídrica.
                </p>
              </div>
            </motion.div>
          )}

          {/* Finish button */}
          <Button
            variant="danger"
            size="xl"
            onClick={() => setShowFinish(true)}
            icon={<StopCircle size={18} />}
          >
            Encerrar Sessão
          </Button>
        </div>
      </div>

      {/* Custom fluid modal */}
      <Modal open={showFluid} onClose={() => setShowFluid(false)} title="Registrar Ingestão">
        <div className="space-y-4">
          <Input
            label="Volume (ml)"
            type="number"
            placeholder="350"
            value={customFluid}
            onChange={(e) => setCustomFluid(e.target.value)}
            suffix="ml"
          />
          <Button
            variant="primary" size="xl"
            onClick={() => customFluid && logFluid(parseInt(customFluid))}
            disabled={!customFluid}
          >
            Registrar
          </Button>
        </div>
      </Modal>

      {/* Temp modal */}
      <Modal open={showTempModal} onClose={() => setShowTempModal(false)} title="Atualizar Temperatura">
        <div className="space-y-4">
          <Input
            label="Temperatura Interna (°C)"
            type="number"
            step="0.1"
            placeholder="38.2"
            value={newTemp}
            onChange={(e) => setNewTemp(e.target.value)}
            suffix="°C"
          />
          <Button variant="primary" size="xl" onClick={handleUpdateTemp}>
            Atualizar
          </Button>
        </div>
      </Modal>

      {/* Finish modal */}
      <Modal open={showFinish} onClose={() => setShowFinish(false)} title="Encerrar Sessão">
        <div className="space-y-4">
          <p className="text-sm text-white/60">Informe o peso pós-sessão para calcular o déficit hídrico real.</p>
          <Input
            label="Massa Corporal Pós-Sessão"
            type="number"
            step="0.1"
            placeholder="00.0"
            value={postWeight}
            onChange={(e) => setPostWeight(e.target.value)}
            suffix="KG"
          />
          <div className="bg-surface-2 rounded-xl p-3 text-sm text-white/50">
            <p>Duração: <span className="text-white font-bold">{formatTimer(elapsed)}</span></p>
            <p>Ingestão total: <span className="text-white font-bold">{totalFluid}ml</span></p>
          </div>
          <Button variant="danger" size="xl" loading={finishing} onClick={handleFinish}
            icon={<StopCircle size={16} />}
          >
            Finalizar e Ver Relatório
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
