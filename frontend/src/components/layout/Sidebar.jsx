import { NavLink, useNavigate } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import {
  Home, Activity, BarChart3, User, Settings,
  Utensils, History, LogOut, Bell, Users,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../../contexts/AuthContext';

const NAV = [
  { to: '/dashboard',  label: 'Início',         icon: Home },
  { to: '/monitor',    label: 'Monitorar',       icon: Activity },
  { to: '/analytics',  label: 'Análises',        icon: BarChart3 },
  { to: '/meal-plan',  label: 'Plano Alimentar', icon: Utensils },
  { to: '/history',    label: 'Histórico',       icon: History },
];

const BOTTOM_NAV = [
  { to: '/profile',   label: 'Perfil',           icon: User },
  { to: '/settings',  label: 'Configurações',    icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); window.location.href = '/'; };

  const adminNav = user?.isAdmin ? [{ to: '/admin/users', label: 'Usuários', icon: Users }] : [];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface-1 border-r border-border h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border">
        <Logo />
        {user?.clinicName && (
          <p className="text-xs text-white/30 font-medium mt-1 ml-10">{user.clinicName}</p>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto no-scrollbar">
        <p className="section-title px-2 mb-3">Menu</p>
        <LayoutGroup id="sidebar-nav">
          <div className="flex flex-col gap-2.5">
          {[...NAV, ...adminNav].map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <motion.div
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'text-white bg-primary shadow-red-glow'
                      : 'text-white/50 hover:text-white hover:bg-surface-3'
                  }`}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 inset-y-0 my-auto w-0.5 h-5 rounded-r-full bg-white"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-white' : undefined}
                  />
                  {label}
                </motion.div>
              )}
            </NavLink>
          ))}
          </div>
        </LayoutGroup>
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex flex-col gap-2.5">
        {BOTTOM_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <div
                className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'text-white bg-primary shadow-red-glow' : 'text-white/50 hover:text-white hover:bg-surface-3'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-white' : undefined} />
                {label}
              </div>
            )}
          </NavLink>
        ))}
        </div>

        {/* User chip */}
        <div className="mt-4 p-3 rounded-xl bg-surface-2 border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/30 hover:text-rose-400 transition-colors p-1"
            title="Sair"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
