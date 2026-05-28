import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Droplets, Activity, StopCircle, Lightbulb, MapPin, CloudSun } from 'lucide-react';
import { sessionApi } from '../services/api';
import { useToast } from '../components/ui/Toast';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { formatTimer } from '../utils/calculations';
import { isMobileViewport } from '../utils/device';

const FLUID_OPTIONS = [150, 250, 500];

export default function ActiveMonitoring() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [elapsed, setElapsed] = useState(0);
  const [fluidLogs, setFluidLogs] = useState([]);
  const [totalFluid, setTotalFluid] = useState(0);
  const [sweatRate, setSweatRate] = useState(1.4);
  const [hydricDeficit, setHydricDeficit] = useState(-450);
  const [showFinish, setShowFinish] = useState(false);
  const [showFluid, setShowFluid] = useState(false);
  const [customFluid, setCustomFluid] = useState('');
  const [postWeight, setPostWeight] = useState('');
  const [finishing, setFinishing] = useState(false);
  const [ambientTemp, setAmbientTemp] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle');
  const tickRef = useRef(null);

  useEffect(() => {
    tickRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  // Fetch real ambient temperature from device location via Open-Meteo (no API key required)
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude.toFixed(4)}&longitude=${coords.longitude.toFixed(4)}&current_weather=true`
          );
          const data = await res.json();
          const temp = data.current_weather?.temperature;
          if (temp !== undefined) {
            setAmbientTemp(temp);
            setGeoStatus('ok');
          } else {
            setGeoStatus('error');
          }
        } catch {
          setGeoStatus('error');
        }
      },
      () => setGeoStatus('denied'),
      { timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  // Simulate small real-time fluctuations for estimated sweat rate
  useEffect(() => {
    const sim = setInterval(() => {
      setSweatRate((r) => parseFloat((r + (Math.random() - 0.5) * 0.05).toFixed(2)));
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

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await sessionApi.finish(id, {
        postWeightKg: postWeight ? parseFloat(postWeight) : null,
        durationMinutes: Math.round(elapsed / 60),
        ambientTemp: ambientTemp ?? undefined,
      });
      toast('Sessão finalizada com sucesso', 'success');
      if (isMobileViewport()) {
        navigate(`/post-session/${id}`, { replace: true });
      } else {
        navigate('/monitor', { replace: true, state: { openSessionId: Number(id) } });
      }
    } catch {
      toast('Erro ao finalizar sessão', 'error');
      setFinishing(false);
    }
  };

  const deficitColor = hydricDeficit < 0 ? 'text-rose-400' : 'text-emerald-400';

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
            <div className="flex items-center gap-2">
              {geoStatus === 'loading' && (
                <span className="flex items-center gap-1 text-[10px] text-white/30">
                  <MapPin size={10} className="animate-pulse" /> Localizando...
                </span>
              )}
              {geoStatus === 'ok' && ambientTemp !== null && (
                <span className="flex items-center gap-1 text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
                  <MapPin size={10} /> {ambientTemp}°C ext.
                </span>
              )}
              <span className="font-mono text-sm text-white/60 font-medium">
                {formatTimer(elapsed)}
              </span>
            </div>
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
              <div className="bg-surface-2 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CloudSun size={14} className="text-sky-400" />
                  <span className="text-xs text-white/40">Clima Externo</span>
                </div>
                <p className="text-xl font-black text-white">
                  {ambientTemp !== null ? `${ambientTemp}°C` : '—'}
                </p>
                <p className="text-[10px] text-white/30 mt-1">
                  {geoStatus === 'ok' ? 'Capturado em tempo real' : 'Aguardando localização'}
                </p>
              </div>
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

      {/* Finish modal */}
      <Modal open={showFinish} onClose={() => setShowFinish(false)} title="Encerrar Sessão">
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            O peso pós-sessão é opcional. Se você informar, o sistema consegue calcular o déficit hídrico real.
          </p>
          <Input
            label="Massa Corporal Pós-Sessão (opcional)"
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
            Finalizar Sessão
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
