import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Weight, Thermometer, Wind } from 'lucide-react';
import { sessionApi } from '../services/api';
import { useToast } from '../components/ui/Toast';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import UrineScale from '../components/charts/UrineScale';

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function PreSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    preWeightKg: '',
    urineColor: null,
    thirstLevel: 5,
    ambientTemp: '',
    humidity: '',
  });
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.preWeightKg) { toast('Insira a massa corporal', 'warning'); return; }
    setSaving(true);
    try {
      await sessionApi.updatePre(id, {
        preWeightKg: parseFloat(form.preWeightKg),
        urineColor: form.urineColor,
        thirstLevel: form.thirstLevel,
      });
      toast('Dados salvos!', 'success');
    } catch {
      toast('Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async () => {
    if (!form.preWeightKg) { toast('Insira a massa corporal antes de iniciar', 'warning'); return; }
    setStarting(true);
    try {
      await sessionApi.updatePre(id, {
        preWeightKg: parseFloat(form.preWeightKg),
        urineColor: form.urineColor,
        thirstLevel: form.thirstLevel,
      });
      await sessionApi.start(id);
      toast('Sessão iniciada!', 'success');
      navigate(`/active/${id}`);
    } catch {
      toast('Erro ao iniciar sessão', 'error');
    } finally {
      setStarting(false);
    }
  };

  return (
    <AppLayout>
      <Header title="Pré-Sessão" showBack />
      <div className="page-container md:max-w-2xl">
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">

          {/* Title */}
          <motion.div variants={fadeUp}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Módulo de Performance</p>
            <h1 className="text-2xl font-black mt-1">
              Pré-Sessão<br />
              <span className="text-gradient">Sweat-Track</span>
            </h1>
            <p className="text-xs text-white/40 mt-1">
              Registre os dados basais para calibração precisa da taxa de sudorese e hidratação durante o treinamento.
            </p>
          </motion.div>

          {/* Body mass */}
          <motion.div variants={fadeUp}>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Weight size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">Massa Corporal</p>
                  <p className="text-xs text-white/30">Baseline em jejum</p>
                </div>
              </div>
              <Input
                type="number"
                step="0.1"
                min="30"
                max="200"
                placeholder="00.0"
                value={form.preWeightKg}
                onChange={set('preWeightKg')}
                suffix="KG"
                className="text-center text-2xl font-black"
              />
            </Card>
          </motion.div>

          {/* Urine color */}
          <motion.div variants={fadeUp}>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <span className="text-lg">💧</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Escala de Hidratação</p>
                  <p className="text-xs text-white/30">Coloração da urina (WUTS)</p>
                </div>
              </div>
              <UrineScale
                selected={form.urineColor}
                onChange={(v) => setForm((f) => ({ ...f, urineColor: v }))}
              />
            </Card>
          </motion.div>

          {/* Thirst */}
          <motion.div variants={fadeUp}>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  <span className="text-lg">🫧</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Percepção de Sede</p>
                  <p className="text-xs text-white/30">Escala 0–10</p>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={form.thirstLevel}
                  onChange={(e) => setForm((f) => ({ ...f, thirstLevel: parseInt(e.target.value) }))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-white/30 font-medium">
                  <span>0 — Sem sede</span>
                  <span className="text-white font-bold text-sm">{form.thirstLevel}/10</span>
                  <span>10 — Sede extrema</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Environment (optional) */}
          <motion.div variants={fadeUp}>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  <Thermometer size={18} className="text-sky-400" />
                </div>
                <div>
                  <p className="font-bold text-sm">Condições Ambientais</p>
                  <p className="text-xs text-white/30">Temperatura e umidade (opcional)</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Temperatura"
                  type="number"
                  placeholder="24"
                  value={form.ambientTemp}
                  onChange={set('ambientTemp')}
                  suffix="°C"
                />
                <Input
                  label="Umidade"
                  type="number"
                  placeholder="65"
                  value={form.humidity}
                  onChange={set('humidity')}
                  suffix="%"
                />
              </div>
            </Card>
          </motion.div>

          {/* Protocol label */}
          <motion.div variants={fadeUp} className="text-center text-xs text-white/20 font-medium">
            PROTOCOLO SÃO CAMILO v1.1
          </motion.div>

          {/* Actions */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 pb-4">
            <Button variant="outline" onClick={handleSave} loading={saving}>
              Salvar Dados
            </Button>
            <Button variant="primary" size="lg" onClick={handleStart} loading={starting}>
              Iniciar Sessão
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
