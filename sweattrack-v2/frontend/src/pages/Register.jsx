import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Building2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/layout/Logo';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'athlete', clinicName: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nome obrigatório';
    if (!form.email.includes('@')) e.email = 'Email inválido';
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Senhas não coincidem';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        clinicName: form.clinicName || undefined,
      });
      toast('Conta criada com sucesso!', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao criar conta', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8">
          <Logo size="lg" className="mb-6" />
          <h1 className="text-2xl font-black mb-1">Criar conta</h1>
          <p className="text-white/40 text-sm">Comece a monitorar sua performance hoje</p>
        </div>

        {/* Role selector */}
        <div className="mb-5">
          <label className="label">Tipo de conta</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 'athlete', label: 'Atleta', emoji: '🏃' },
              { val: 'coach',   label: 'Treinador', emoji: '📋' },
              { val: 'doctor',  label: 'Médico', emoji: '🩺' },
            ].map(({ val, label, emoji }) => (
              <button
                key={val}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: val }))}
                className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                  form.role === val
                    ? 'bg-primary/15 border-primary/40 text-white'
                    : 'bg-surface-2 border-border text-white/40 hover:border-border-bright'
                }`}
              >
                <div className="text-xl mb-1">{emoji}</div>
                {label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome completo"
            placeholder="Dr. João Silva"
            value={form.name}
            onChange={set('name')}
            icon={<User size={16} />}
            error={errors.name}
          />
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={set('email')}
            icon={<Mail size={16} />}
            error={errors.email}
          />
          {(form.role === 'doctor' || form.role === 'coach') && (
            <Input
              label="Clínica / Instituição"
              placeholder="São Camilo Sports"
              value={form.clinicName}
              onChange={set('clinicName')}
              icon={<Building2 size={16} />}
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Senha"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••"
              value={form.password}
              onChange={set('password')}
              icon={<Lock size={16} />}
              suffix={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-white/30 hover:text-white/60">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              error={errors.password}
            />
            <Input
              label="Confirmar"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              error={errors.confirmPassword}
            />
          </div>

          <Button type="submit" variant="primary" size="xl" loading={loading} className="mt-2">
            Criar conta
          </Button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:text-primary-light transition-colors">
            Entrar
          </Link>
        </p>

        <p className="text-center text-[11px] text-white/20 mt-4 leading-relaxed">
          Ao criar uma conta, você concorda com nossos<br />
          Termos de Uso e Política de Privacidade.
        </p>
      </motion.div>
    </div>
  );
}
