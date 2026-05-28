import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Droplets, Activity, AlertTriangle, Salad, CheckCheck, ChevronRight } from 'lucide-react';
import { userApi } from '../../services/api';

const TYPE_ICON = {
  hydration: <Droplets size={14} className="text-sky-400" />,
  nutrition: <Salad size={14} className="text-emerald-400" />,
  recovery:  <Activity size={14} className="text-violet-400" />,
  alert:     <AlertTriangle size={14} className="text-amber-400" />,
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function NotificationPopup() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    userApi.notifications()
      .then((r) => setNotifications(r.data))
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const preview = notifications.slice(0, 3);

  const markRead = async (n) => {
    if (n.is_read) return;
    try {
      await userApi.markRead(n.id);
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: 1 } : x));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => userApi.markRead(n.id).catch(() => {})));
    setNotifications((prev) => prev.map((x) => ({ ...x, is_read: 1 })));
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-white/60 hover:text-white transition-colors"
      >
        <Bell size={17} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute right-0 top-11 w-80 bg-surface-1 border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">Notificações</p>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                    {unreadCount} novas
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[10px] font-bold text-white/40 hover:text-white transition-colors"
                >
                  <CheckCheck size={12} /> Marcar todas
                </button>
              )}
            </div>

            {/* List */}
            {preview.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell size={24} className="text-white/15" />
                <p className="text-xs text-white/30 font-medium">Nenhuma notificação</p>
              </div>
            ) : (
              <div>
                {preview.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-2 transition-colors border-b border-border last:border-0 ${!n.is_read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {TYPE_ICON[n.type] || TYPE_ICON.info}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-snug ${!n.is_read ? 'text-white' : 'text-white/60'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-white/30 flex-shrink-0 mt-0.5">{timeAgo(n.created_at)}</span>
                      </div>
                      {n.message && (
                        <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                      )}
                    </div>
                    {!n.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Footer */}
            {notifications.length > 0 && (
              <button
                onClick={() => { setOpen(false); navigate('/notifications'); }}
                className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-border"
              >
                Ver todas as notificações <ChevronRight size={13} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
