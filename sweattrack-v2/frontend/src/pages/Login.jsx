import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Droplets, Activity, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const FEATURES = [
  { icon: Droplets,  label: 'Monitoramento hídrico em tempo real' },
  { icon: Activity,  label: 'Taxa de sudorese e déficit calórico' },
  { icon: BarChart3, label: 'Relatórios clínicos exportáveis' },
  { icon: Shield,    label: 'Protocolo São Camilo v1.1' },
];

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast('Bem-vindo de volta!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ email: 'demo@sweattrack.com', password: 'demo1234' });

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col md:flex-row">

      {/* ── Brand panel ─────────────────────────────────── */}
      <div className="relative bg-primary md:w-[420px] md:min-h-screen flex flex-col overflow-hidden flex-shrink-0">

        {/* Decorative radial overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 55%, rgba(255,255,255,0.18) 0%, transparent 55%), radial-gradient(circle at 85% 15%, rgba(0,0,0,0.25) 0%, transparent 50%)',
          }}
        />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 p-8 md:p-10 pt-14 md:pt-16">

          {/* Clinic badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 mb-10 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">
              São Camilo — Nutri-Esportiva
            </span>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
              <Droplets size={30} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.25em]">Sweat</p>
              <h1 className="text-white text-4xl font-black leading-none tracking-tight">Track</h1>
            </div>
          </div>

          <p className="text-white/75 text-sm leading-relaxed max-w-[280px] mb-8">
            Plataforma clínica de monitoramento de hidratação e performance esportiva de alta precisão.
          </p>

          {/* Feature list */}
          <div className="hidden md:flex flex-col gap-3 mb-auto">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-white/80" />
                </div>
                <span className="text-white/75 text-sm">{label}</span>
              </div>
            ))}
          </div>

          {/* Footer label */}
          <p className="hidden md:block text-white/30 text-[10px] font-bold uppercase tracking-widest mt-10">
            PROTOCOLO SÃO CAMILO v1.1
          </p>
        </div>

        {/* Mobile wave divider */}
        <div className="relative z-10 md:hidden">
          <svg
            viewBox="0 0 390 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full block"
            style={{ marginBottom: '-1px' }}
          >
            <path
              d="M0 40 L0 22 Q97.5 0 195 16 Q292.5 32 390 8 L390 40 Z"
              className="fill-surface-0"
            />
          </svg>
        </div>
      </div>

      {/* ── Form panel ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 md:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="w-full max-w-sm"
        >

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-black">Bem-vindo de volta</h2>
            <p className="text-sm text-white/40 mt-1">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={set('email')}
              icon={<Mail size={16} />}
              required
            />
            <Input
              label="Senha"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              icon={<Lock size={16} />}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              required
            />

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" variant="primary" size="xl" loading={loading} className="mt-2">
              Entrar
            </Button>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={fillDemo}
              className="w-full py-2.5 text-xs text-white/30 hover:text-white/60 transition-colors border border-dashed border-border hover:border-border-bright rounded-xl"
            >
              Preencher com conta demo
            </button>
          </div>

          <p className="text-center text-sm text-white/40 mt-6">
            Não tem conta?{' '}
            <Link
              to="/register"
              className="text-primary font-semibold hover:text-primary-light transition-colors"
            >
              Cadastrar
            </Link>
          </p>

          {/* Bottom protocol label on mobile */}
          <p className="md:hidden text-center text-[10px] text-white/20 font-bold uppercase tracking-widest mt-10">
            PROTOCOLO SÃO CAMILO v1.1
          </p>
        </motion.div>
      </div>
    </div>
  );
}
