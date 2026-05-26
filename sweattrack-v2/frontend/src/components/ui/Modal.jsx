import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', full: 'max-w-2xl' };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            className={`relative w-full ${sizes[size]} bg-surface-1 border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10`}
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          >
            {/* Handle bar (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {title && (
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
                <h3 className="font-bold text-base">{title}</h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center hover:bg-surface-4 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
