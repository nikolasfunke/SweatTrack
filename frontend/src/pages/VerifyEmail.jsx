import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, RefreshCw, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import Logo from '../components/layout/Logo';

const COOLDOWN_SECONDS = 60;

export default function VerifyEmail() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Foco automático no primeiro input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  const handleDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError('');
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setCode(text.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Digite os 6 dígitos do código.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.verifyEmail(fullCode);
      setSuccess(true);
      updateUser({ isVerified: true });
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Código inválido. Tente novamente.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await authApi.resendVerification();
      setCooldown(COOLDOWN_SECONDS);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao reenviar código.');
    } finally {
      setResending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Logo size="lg" className="mb-6 justify-center" />
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
            <Mail size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-black mb-2">Verifique seu e-mail</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Enviamos um código de 6 dígitos para{' '}
            <span className="text-white/80 font-semibold">{user?.email}</span>.
            <br />Insira-o abaixo para ativar sua conta.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
              <p className="text-lg font-bold text-green-400">E-mail verificado!</p>
              <p className="text-white/40 text-sm">Redirecionando para o dashboard…</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Inputs do código */}
              <div
                className="flex items-center justify-center gap-3 mb-6"
                onPaste={handlePaste}
              >
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-12 h-14 rounded-xl text-center text-2xl font-black bg-surface-2 border transition-all outline-none
                      ${digit
                        ? 'border-primary/60 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                        : 'border-border text-white/60'
                      }
                      focus:border-primary focus:shadow-[0_0_16px_rgba(99,102,241,0.35)]
                    `}
                  />
                ))}
              </div>

              {/* Erro */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5"
                  >
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botão verificar */}
              <button
                onClick={handleVerify}
                disabled={loading || code.join('').length < 6}
                className="w-full h-12 rounded-xl bg-primary font-bold text-white text-sm transition-all
                  hover:bg-primary-light active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 mb-4"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Verificar e-mail'}
              </button>

              {/* Reenviar código */}
              <div className="text-center">
                <button
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                  {cooldown > 0
                    ? `Reenviar em ${cooldown}s`
                    : 'Reenviar código'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sair */}
        {!success && (
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-white/40 mb-3">Não tem acesso ao e-mail informado?</p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 hover:bg-white/5 transition-all px-4 py-2 rounded-xl border border-border/50 hover:border-border"
            >
              <LogOut size={14} />
              Sair e usar outro e-mail
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
