import { NavLink } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import { Home, Activity, BarChart3, Settings, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const BASE_NAV = [
  { to: '/dashboard',  label: 'Início',    icon: Home },
  { to: '/monitor',    label: 'Monitorar', icon: Activity },
  { to: '/analytics',  label: 'Análises',  icon: BarChart3 },
  { to: '/settings',   label: 'Ajustes',   icon: Settings },
];

export default function BottomNav() {
  const { dark } = useTheme();
  const { user } = useAuth();
  const inactiveColor = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  const NAV = user?.isAdmin
    ? [...BASE_NAV, { to: '/admin/users', label: 'Usuários', icon: Users }]
    : BASE_NAV;

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
        <div className="flex items-center justify-around px-2 py-2" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}>
          <LayoutGroup id="bottom-nav">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="flex-1">
                {({ isActive }) => (
                  <motion.div
                    className="nav-link justify-center py-1.5"
                    whileTap={{ scale: 0.88 }}
                  >
                    <div className="relative flex items-center justify-center">
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute -inset-x-3.5 -inset-y-2 rounded-xl bg-primary shadow-red-glow"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon
                        size={21}
                        className="relative z-10"
                        strokeWidth={isActive ? 2.5 : 1.8}
                        color={isActive ? '#ffffff' : inactiveColor}
                      />
                    </div>
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
