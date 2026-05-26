import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 size={16} className="text-emerald-400" />,
  error:   <XCircle size={16} className="text-rose-400" />,
  warning: <AlertCircle size={16} className="text-amber-400" />,
  info:    <Info size={16} className="text-sky-400" />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);

  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-3 bg-surface-2 border border-border-bright rounded-2xl px-4 py-3 shadow-2xl pointer-events-auto"
            >
              {ICONS[t.type]}
              <p className="text-sm font-medium flex-1 text-white/90">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-white/30 hover:text-white/60 transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};
