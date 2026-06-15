import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from './Logo';
import NotificationPopup from '../ui/NotificationPopup';

export default function Header({ title, showBack = false, actions }) {
  const { user } = useAuth();
  const { dark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-surface-0/90 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">

        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-white/60 hover:text-white transition-colors flex-shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <>
              <div className="md:hidden">
                <Logo size="xl" />
              </div>
            </>
          )}
          {title && (
            <h1 className={`font-bold truncate ${showBack ? 'text-base' : 'text-sm text-white/60'}`}>
              {title}
            </h1>
          )}
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center">
          <img src="/Full-Logo.svg" alt="SweatTrack" className="h-9 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-2">
          {actions}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors flex-shrink-0 overflow-hidden"
            title={dark ? 'Modo claro' : 'Modo escuro'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dark ? 'moon' : 'sun'}
                initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex items-center justify-center"
              >
                {dark ? <Moon size={15} className="text-white/60" /> : <Sun size={15} className="text-amber-500" />}
              </motion.span>
            </AnimatePresence>
          </button>
          <NotificationPopup />
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 hover:bg-primary/30 transition-colors"
            title="Meu perfil"
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </button>
        </div>
      </div>
    </header>
  );
}
