import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Ruler, Weight, Activity, Calendar, Save, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export default function Profile() {
  const { user, refetch, logout } = useAuth();
  const toast = useToast();

  const handleLogout = () => { logout(); window.location.href = '/'; };
  const [form, setForm] = useState({
    name: user?.name || '',
    clinicName: user?.clinicName || '',
    heightCm: user?.profile?.heightCm || '',
    weightKg: user?.profile?.weightKg || '',
    sport: user?.profile?.sport || '',
    birthDate: user?.profile?.birthDate?.split('T')[0] || '',
    gender: user?.profile?.gender || '',
    vo2max: user?.profile?.vo2max || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile({
        name: form.name,
        clinicName: form.clinicName,
        heightCm: form.heightCm ? parseFloat(form.heightCm) : undefined,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
        sport: form.sport || undefined,
        birthDate: form.birthDate || undefined,
        gender: form.gender || undefined,
        vo2max: form.vo2max ? parseFloat(form.vo2max) : undefined,
      });
      await refetch();
      toast('Perfil atualizado!', 'success');
    } catch {
      toast('Erro ao salvar perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initial = user?.name?.[0]?.toUpperCase() || 'U';
  const roleLabels = { athlete: 'Atleta', coach: 'Treinador', doctor: 'Médico' };

  return (
    <AppLayout>
      <Header title="Perfil" showBack />
      <div className="page-container md:max-w-2xl">
        <div className="space-y-5">

          {/* Avatar section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-6"
          >
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-3xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                <span className="text-4xl font-black text-primary">{initial}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-red-glow">
                <User size={14} className="text-white" />
              </div>
            </div>
            <h2 className="text-xl font-black">{user?.name}</h2>
            <p className="text-sm text-white/40">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge bg-primary/15 text-primary border border-primary/20">
                {roleLabels[user?.role] || user?.role}
              </span>
              {user?.clinicName && (
                <span className="badge bg-surface-3 text-white/50">{user.clinicName}</span>
              )}
            </div>
          </motion.div>

          {/* Basic info */}
          <Card>
            <p className="section-title mb-4">Informações Pessoais</p>
            <div className="space-y-4">
              <Input label="Nome completo" value={form.name} onChange={set('name')}
                icon={<User size={15} />} />
              <Input label="Clínica / Instituição" value={form.clinicName} onChange={set('clinicName')}
                placeholder="São Camilo" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Data de Nascimento" type="date" value={form.birthDate}
                  onChange={set('birthDate')} icon={<Calendar size={15} />} />
                <div>
                  <label className="label">Gênero</label>
                  <select className="input-field" value={form.gender} onChange={set('gender')}>
                    <option value="">Selecionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Physical data */}
          <Card>
            <p className="section-title mb-4">Dados Físicos</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Altura" type="number" step="0.5" placeholder="175"
                  value={form.heightCm} onChange={set('heightCm')} suffix="cm"
                  icon={<Ruler size={15} />} />
                <Input label="Peso" type="number" step="0.1" placeholder="70.0"
                  value={form.weightKg} onChange={set('weightKg')} suffix="kg"
                  icon={<Weight size={15} />} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Esporte" placeholder="Futebol" value={form.sport}
                  onChange={set('sport')} icon={<Activity size={15} />} />
                <Input label="VO₂ Máx" type="number" step="0.1" placeholder="55.0"
                  value={form.vo2max} onChange={set('vo2max')} suffix="ml/kg/min" />
              </div>
            </div>
          </Card>

          {/* Stats */}
          {form.heightCm && form.weightKg && (
            <Card>
              <p className="section-title mb-3">Dados Calculados</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-2 rounded-xl p-3 text-center">
                  <p className="text-xs text-white/40">IMC</p>
                  <p className="text-xl font-black">
                    {(parseFloat(form.weightKg) / Math.pow(parseFloat(form.heightCm) / 100, 2)).toFixed(1)}
                  </p>
                </div>
                <div className="bg-surface-2 rounded-xl p-3 text-center">
                  <p className="text-xs text-white/40">Peso Ideal (Lorentz)</p>
                  <p className="text-xl font-black">
                    {form.gender === 'female'
                      ? Math.round(parseFloat(form.heightCm) - 100 - (parseFloat(form.heightCm) - 150) / 2)
                      : Math.round(parseFloat(form.heightCm) - 100 - (parseFloat(form.heightCm) - 150) / 4)
                    }kg
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Button variant="primary" size="xl" loading={saving} onClick={handleSave}
            icon={<Save size={16} />}>
            Salvar Perfil
          </Button>

          <div className="md:hidden pb-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-2 border border-primary/20 text-sm font-semibold text-primary hover:bg-primary hover:text-white active:bg-primary/80 active:text-white transition-colors"
            >
              <LogOut size={15} />
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
