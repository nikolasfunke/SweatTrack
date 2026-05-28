import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Lock, Globe, Smartphone, Moon, ChevronRight,
  LogOut, Trash2, Shield, HelpCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { userApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-surface-4'}`}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
      />
    </button>
  );
}

function SettingRow({ icon, label, desc, children, onClick }) {
  return (
    <div
      className={`flex items-center justify-between py-3 border-b border-border last:border-0 ${onClick ? 'cursor-pointer hover:bg-surface-3 -mx-4 px-4 rounded-xl transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-surface-3 flex items-center justify-center text-white/50 flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold">{label}</p>
          {desc && <p className="text-xs text-white/30">{desc}</p>}
        </div>
      </div>
      {children || (onClick && <ChevronRight size={15} className="text-white/20" />)}
    </div>
  );
}

export default function Settings() {
  const { logout } = useAuth();
  const { dark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const [prefs, setPrefs] = useState({
    notifications: true,
    hydrationAlerts: true,
    units: 'metric',
  });
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  const toggle = (k) => (v) => setPrefs((p) => ({ ...p, [k]: v }));

  const handleChangePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { toast('Senhas não coincidem', 'warning'); return; }
    if (pwForm.next.length < 6) { toast('Mínimo 6 caracteres', 'warning'); return; }
    setSavingPw(true);
    try {
      await userApi.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      toast('Senha alterada!', 'success');
      setShowPwModal(false);
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao alterar senha', 'error');
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <AppLayout>
      <Header title="Configurações" showBack />
      <div className="page-container md:max-w-xl">
        <div className="space-y-5">

          {/* Notifications */}
          <Card>
            <p className="section-title mb-1">Notificações</p>
            <SettingRow icon={<Bell size={15} />} label="Notificações gerais" desc="Alertas e lembretes do app">
              <Toggle checked={prefs.notifications} onChange={toggle('notifications')} />
            </SettingRow>
            <SettingRow icon={<span className="text-sky-400 text-sm">💧</span>} label="Alertas de hidratação" desc="Lembretes de ingestão hídrica">
              <Toggle checked={prefs.hydrationAlerts} onChange={toggle('hydrationAlerts')} />
            </SettingRow>
          </Card>

          {/* Appearance */}
          <Card>
            <p className="section-title mb-1">Aparência</p>
            <SettingRow icon={<Moon size={15} />} label="Modo escuro" desc={dark ? 'Tema escuro ativo' : 'Tema claro ativo'}>
              <Toggle checked={dark} onChange={toggleTheme} />
            </SettingRow>
            <SettingRow icon={<Globe size={15} />} label="Unidades" desc={prefs.units === 'metric' ? 'Sistema métrico (kg, cm)' : 'Imperial (lb, in)'}>
              <button
                onClick={() => setPrefs((p) => ({ ...p, units: p.units === 'metric' ? 'imperial' : 'metric' }))}
                className="text-xs text-primary font-bold px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20"
              >
                {prefs.units === 'metric' ? 'Métrico' : 'Imperial'}
              </button>
            </SettingRow>
          </Card>

          {/* Security */}
          <Card>
            <p className="section-title mb-1">Segurança</p>
            <SettingRow icon={<Lock size={15} />} label="Alterar senha" desc="Atualize suas credenciais"
              onClick={() => setShowPwModal(true)} />
            <SettingRow icon={<Shield size={15} />} label="Privacidade de dados" desc="Controle seus dados" onClick={() => toast('Em breve', 'info')} />
          </Card>

          {/* About */}
          <Card>
            <p className="section-title mb-1">Sobre</p>
            <SettingRow icon={<HelpCircle size={15} />} label="Ajuda & Suporte" onClick={() => toast('suporte@sweattrack.com', 'info')} />
            <SettingRow icon={<Smartphone size={15} />} label="Versão do app" desc="SweatTrack v2.0.0">
              <span className="text-xs text-white/30 font-medium">v2.0.0</span>
            </SettingRow>
          </Card>

          {/* Logout / danger */}
          <div className="space-y-3 pb-4">
            <Button
              variant="outline"
              size="xl"
              onClick={handleLogout}
              icon={<LogOut size={16} />}
              className="border-border-bright"
            >
              Sair da conta
            </Button>
            <button
              onClick={() => toast('Entre em contato com o suporte para excluir sua conta', 'info')}
              className="w-full text-rose-400/60 hover:text-rose-400 text-sm font-medium transition-colors py-2"
            >
              Excluir conta
            </button>
          </div>
        </div>
      </div>

      {/* Change password modal */}
      <Modal open={showPwModal} onClose={() => setShowPwModal(false)} title="Alterar Senha">
        <div className="space-y-4">
          <Input label="Senha atual" type="password" placeholder="••••••••"
            value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} />
          <Input label="Nova senha" type="password" placeholder="••••••••"
            value={pwForm.next} onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} />
          <Input label="Confirmar nova senha" type="password" placeholder="••••••••"
            value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} />
          <Button variant="primary" size="xl" loading={savingPw} onClick={handleChangePassword}>
            Alterar Senha
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
