import { motion } from 'framer-motion';
import { ChevronLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from './Logo';
import NotificationPopup from '../ui/NotificationPopup';

export default function Header({ title, showBack = false, actions }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const clinicName = user?.clinicName || 'São Camilo';

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
              {/* Logo — only on mobile (sidebar shows it on desktop) */}
              <div className="md:hidden">
                <Logo size="sm" />
              </div>
              {/* Info icon — desktop only, matches Figma header */}
              <button className="hidden md:flex w-8 h-8 rounded-full bg-sky-500/15 items-center justify-center text-sky-400 hover:bg-sky-500/25 transition-colors flex-shrink-0">
                <Info size={15} />
              </button>
            </>
          )}
          {title && (
            <h1 className={`font-bold truncate ${showBack ? 'text-base' : 'text-sm text-white/60'}`}>
              {title}
            </h1>
          )}
        </div>

        {/* Center — clinic name on desktop */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 flex-col items-center pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
            {clinicName.toUpperCase()}
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {actions}
          <NotificationPopup />
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
