import { NavLink } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import { Home, Activity, BarChart3, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const NAV = [
  { to: '/dashboard',  label: 'Início',    icon: Home },
  { to: '/monitor',    label: 'Monitorar', icon: Activity },
  { to: '/analytics',  label: 'Análises',  icon: BarChart3 },
  { to: '/profile',    label: 'Perfil',    icon: User },
];

export default function BottomNav() {
  const { dark } = useTheme();
  const inactiveColor = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden">
      <div
        className="border-t border-border"
        style={{
          background: dark
            ? 'rgba(17,17,17,0.92)'
            : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="flex items-center justify-around px-1 py-1 safe-area-inset-bottom">
          <LayoutGroup id="bottom-nav">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="flex-1">
                {({ isActive }) => (
                  <motion.div
                    className="nav-link gap-1 py-2"
                    whileTap={{ scale: 0.88 }}
                    animate={{ color: isActive ? '#C41E3A' : inactiveColor }}
                  >
                    <div className="relative flex items-center justify-center">
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute -inset-2.5 bg-primary/12 rounded-xl"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon
                        size={22}
                        className="relative z-10"
                        strokeWidth={isActive ? 2.5 : 1.8}
                        color={isActive ? '#C41E3A' : inactiveColor}
                      />
                    </div>
                    <span
                      className="text-[10px] font-semibold tracking-wide"
                      style={{ color: isActive ? '#C41E3A' : inactiveColor }}
                    >
                      {label.toUpperCase()}
                    </span>
                  </motion.div>
                )}
              </NavLink>
            ))}
          </LayoutGroup>
        </div>
      </div>
    </nav>
  );
}
