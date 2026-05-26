import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { PageLoader } from './components/ui/Spinner';

import Login           from './pages/Login';
import Register        from './pages/Register';
import Dashboard       from './pages/Dashboard';
import PreSession      from './pages/PreSession';
import ActiveMonitoring from './pages/ActiveMonitoring';
import PostSession     from './pages/PostSession';
import Analytics       from './pages/Analytics';
import MealPlan        from './pages/MealPlan';
import History         from './pages/History';
import Monitor         from './pages/Monitor';
import Notifications   from './pages/Notifications';
import Profile         from './pages/Profile';
import Settings        from './pages/Settings';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
        <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />

        {/* Protected */}
        <Route path="/dashboard"      element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/pre-session/:id" element={<RequireAuth><PreSession /></RequireAuth>} />
        <Route path="/active/:id"      element={<RequireAuth><ActiveMonitoring /></RequireAuth>} />
        <Route path="/post-session/:id" element={<RequireAuth><PostSession /></RequireAuth>} />
        <Route path="/monitor"        element={<RequireAuth><Monitor /></RequireAuth>} />
        <Route path="/analytics"      element={<RequireAuth><Analytics /></RequireAuth>} />
        <Route path="/meal-plan"      element={<RequireAuth><MealPlan /></RequireAuth>} />
        <Route path="/history"        element={<RequireAuth><History /></RequireAuth>} />
        <Route path="/notifications"  element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/profile"        element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/settings"       element={<RequireAuth><Settings /></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
