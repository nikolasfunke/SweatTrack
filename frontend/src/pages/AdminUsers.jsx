import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, Shield, ShieldOff, Search, RefreshCw } from 'lucide-react';
import { adminApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

const ROLE_LABEL = { athlete: 'Atleta', coach: 'Treinador', doctor: 'Médico' };
const ROLE_COLOR = { athlete: 'blue', coach: 'yellow', doctor: 'green' };

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [search, setSearch] = useState('');
  const [selfAdminWarning, setSelfAdminWarning] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    adminApi.listUsers()
      .then((r) => setUsers(r.data))
      .catch(() => toast('Erro ao carregar usuários', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async (u) => {
    if (u.role === 'admin') {
      toast('O perfil ADMIN é protegido e não pode ser alterado', 'error');
      return;
    }

    if (u.id === me?.id && u.is_admin) {
      setSelfAdminWarning(u);
      return;
    }

    setToggling(u.id);
    try {
      const { data } = await adminApi.toggleAdmin(u.id);
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, is_admin: data.is_admin } : x));
      toast(data.is_admin ? `${u.name} agora é admin` : `Admin removido de ${u.name}`, 'success');
    } catch {
      toast('Erro ao alterar status', 'error');
    } finally {
      setToggling(null);
    }
  };

  const handleSelfDemotionDecision = async (confirmed) => {
    const target = selfAdminWarning;
    setSelfAdminWarning(null);

    if (!confirmed || !target) {
      window.location.reload();
      return;
    }

    setToggling(target.id);
    try {
      await adminApi.toggleAdmin(target.id);
      toast('Seu acesso de admin foi removido', 'success');
    } catch {
      toast('Erro ao alterar status', 'error');
    } finally {
      window.location.reload();
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <Header
        title="Usuários"
        showBack={false}
        actions={
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-80 transition-opacity"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        }
      />

      <div className="page-container">
        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou tipo..."
            className="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-primary/50"
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total', value: users.length, color: 'text-white' },
            { label: 'Admins', value: users.filter((u) => u.is_admin).length, color: 'text-primary' },
            { label: 'Médicos', value: users.filter((u) => u.role === 'doctor').length, color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-3 text-center">
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* User list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {filtered.length === 0 && (
              <p className="text-center text-white/40 text-sm py-10">Nenhum usuário encontrado.</p>
            )}
            {filtered.map((u) => (
              <div key={u.id} className="card px-4 py-3.5 flex items-center gap-3">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  u.is_admin ? 'bg-primary/20 border border-primary/40 text-primary' : 'bg-surface-3 text-white/60'
                }`}>
                  {u.name?.[0]?.toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                    {u.is_admin && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/40 truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      ROLE_COLOR[u.role] === 'blue' ? 'bg-sky-500/10 text-sky-400' :
                      ROLE_COLOR[u.role] === 'yellow' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
                    {u.clinic_name && (
                      <span className="text-[10px] text-white/30">{u.clinic_name}</span>
                    )}
                    <span className="text-[10px] text-white/20 ml-auto">{timeAgo(u.created_at)}</span>
                  </div>
                </div>

                {/* Toggle admin */}
                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleToggle(u)}
                    disabled={toggling === u.id}
                    title={u.is_admin ? 'Remover admin' : 'Tornar admin'}
                    className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                      u.is_admin
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'bg-surface-3 text-white/30 hover:bg-surface-4 hover:text-white/60'
                    } disabled:opacity-40`}
                  >
                    {toggling === u.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : u.is_admin ? (
                      <ShieldOff size={16} />
                    ) : (
                      <Shield size={16} />
                    )}
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <Modal
        open={!!selfAdminWarning}
        onClose={() => handleSelfDemotionDecision(false)}
        title="Ei, você vai perder acesso!"
        size="sm"
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-rose-500/40 bg-gradient-to-br from-rose-950 via-rose-900 to-black shadow-[0_0_40px_rgba(190,24,93,0.22)]">
            <div className="border-b border-rose-400/20 bg-rose-500/10 px-4 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-rose-200/90">
                Zona sem retorno
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-rose-400/25 bg-rose-500/15 text-rose-200 shadow-[0_0_20px_rgba(251,113,133,0.25)]">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-base font-black uppercase tracking-wide text-rose-100">
                    Ei, você vai perder acesso!
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-rose-100/80">
                    Se continuar, sua conta atual deixará de ser administradora imediatamente.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-rose-400/20 bg-black/20 px-3 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-200/85">
                  Consequência
                </p>
                <p className="mt-1 text-xs leading-relaxed text-rose-50/75">
                  Você pode perder acesso a esta área assim que a página for recarregada. Só continue se tiver certeza absoluta.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant="danger"
              onClick={() => handleSelfDemotionDecision(true)}
              loading={toggling === selfAdminWarning?.id}
              className="w-full border border-rose-300/20 bg-rose-600 hover:bg-rose-700"
            >
              Sim, remover admin
            </Button>
            <Button
              variant="danger"
              onClick={() => handleSelfDemotionDecision(false)}
              className="w-full border border-rose-500/20 bg-rose-950 hover:bg-rose-900"
            >
              Não, manter acesso
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
