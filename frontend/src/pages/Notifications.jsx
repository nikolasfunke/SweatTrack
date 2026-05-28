import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Droplets, Activity, AlertTriangle, Salad, CheckCheck, ShieldCheck, ShieldX, Shield } from 'lucide-react';
import { userApi, adminApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';

const TYPE_ICON = {
  hydration:     <Droplets size={15} className="text-sky-400" />,
  nutrition:     <Salad size={15} className="text-emerald-400" />,
  recovery:      <Activity size={15} className="text-violet-400" />,
  alert:         <AlertTriangle size={15} className="text-amber-400" />,
  admin_request: <Shield size={15} className="text-primary" />,
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function AdminRequestCard({ n, onAction }) {
  const [loading, setLoading] = useState(null);

  const handle = async (action) => {
    setLoading(action);
    await onAction(n.id, action);
    setLoading(null);
  };

  if (n.action_taken) {
    return (
      <div className="rounded-2xl px-4 py-3.5 flex items-start gap-3 bg-surface-1 border border-border opacity-60">
        <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center flex-shrink-0 mt-0.5">
          {TYPE_ICON.admin_request}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/60">{n.title}</p>
          <p className="text-xs text-white/40 mt-1">{n.message}</p>
          <p className="text-[10px] text-white/25 mt-1.5">Já processado · {timeAgo(n.created_at)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl px-4 py-3.5 bg-primary/5 border border-primary/20">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Shield size={15} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-white">{n.title}</p>
            <span className="text-[10px] text-white/30 flex-shrink-0 mt-0.5">{timeAgo(n.created_at)}</span>
          </div>
          <p className="text-xs text-white/50 mt-1 leading-relaxed">{n.message}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handle('approve')}
              disabled={!!loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-colors disabled:opacity-40"
            >
              {loading === 'approve'
                ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                : <ShieldCheck size={13} />}
              Aprovar
            </button>
            <button
              onClick={() => handle('deny')}
              disabled={!!loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors disabled:opacity-40"
            >
              {loading === 'deny'
                ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                : <ShieldX size={13} />}
              Negar
            </button>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
      </div>
    </div>
  );
}

export default function Notifications() {
  const { user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    userApi.notifications()
      .then((r) => setNotifications(r.data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const unread = notifications.filter((n) => !n.is_read && !n.action_taken);

  const markRead = async (n) => {
    if (n.is_read || n.type === 'admin_request') return;
    try {
      await userApi.markRead(n.id);
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: 1 } : x));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    const readable = unread.filter((n) => n.type !== 'admin_request');
    await Promise.all(readable.map((n) => userApi.markRead(n.id).catch(() => {})));
    setNotifications((prev) => prev.map((x) =>
      x.type !== 'admin_request' ? { ...x, is_read: 1 } : x
    ));
  };

  const handleAdminAction = async (notificationId, action) => {
    try {
      await adminApi.handleRequest(notificationId, action);
      setNotifications((prev) =>
        prev.map((x) => x.id === notificationId ? { ...x, action_taken: 1, is_read: 1 } : x)
      );
      toast(action === 'approve' ? 'Admin aprovado com sucesso' : 'Solicitação negada', 'success');
    } catch {
      toast('Erro ao processar solicitação', 'error');
    }
  };

  return (
    <AppLayout>
      <Header
        title="Notificações"
        showBack
        actions={
          unread.filter((n) => n.type !== 'admin_request').length > 0 ? (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-80 transition-opacity"
            >
              <CheckCheck size={13} /> Marcar todas
            </button>
          ) : null
        }
      />

      <div className="page-container md:max-w-2xl">
        {loaded && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
              <Bell size={26} className="text-white/20" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/60">Nenhuma notificação</p>
              <p className="text-xs text-white/30 mt-1">Você está em dia com tudo.</p>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
            {unread.length > 0 && (
              <p className="section-title px-1 mb-2">Novas ({unread.length})</p>
            )}
            {notifications.map((n, i) => {
              const isFirstRead = n.is_read && i > 0 && !notifications[i - 1].is_read;

              if (n.type === 'admin_request' && user?.isAdmin) {
                return (
                  <div key={n.id}>
                    {isFirstRead && <p className="section-title px-1 mt-4 mb-2">Anteriores</p>}
                    <AdminRequestCard n={n} onAction={handleAdminAction} />
                  </div>
                );
              }

              return (
                <div key={n.id}>
                  {isFirstRead && <p className="section-title px-1 mt-4 mb-2">Anteriores</p>}
                  <button
                    onClick={() => markRead(n)}
                    className={`w-full text-left rounded-2xl px-4 py-3.5 flex items-start gap-3 transition-colors border ${
                      !n.is_read
                        ? 'bg-primary/5 border-primary/15 hover:bg-primary/10'
                        : 'bg-surface-1 border-border hover:bg-surface-2'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {TYPE_ICON[n.type] || TYPE_ICON.alert}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className={`text-sm font-semibold ${!n.is_read ? 'text-white' : 'text-white/60'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-white/30 flex-shrink-0 mt-0.5">{timeAgo(n.created_at)}</span>
                      </div>
                      {n.message && (
                        <p className="text-xs text-white/40 mt-1 leading-relaxed">{n.message}</p>
                      )}
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
