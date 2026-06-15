import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { PageLoader } from './components/ui/Spinner';

const Login            = lazy(() => import('./pages/Login'));
const Register         = lazy(() => import('./pages/Register'));
const VerifyEmail      = lazy(() => import('./pages/VerifyEmail'));
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const PreSession       = lazy(() => import('./pages/PreSession'));
const ActiveMonitoring = lazy(() => import('./pages/ActiveMonitoring'));
const PostSession      = lazy(() => import('./pages/PostSession'));
const Analytics        = lazy(() => import('./pages/Analytics'));
const History          = lazy(() => import('./pages/History'));
const Monitor          = lazy(() => import('./pages/Monitor'));
const Notifications    = lazy(() => import('./pages/Notifications'));
const Profile          = lazy(() => import('./pages/Profile'));
const Settings         = lazy(() => import('./pages/Settings'));
const AdminUsers       = lazy(() => import('./pages/AdminUsers'));
const Teams            = lazy(() => import('./pages/Teams'));

/** Usuário autenticado E verificado pode acessar rotas internas. */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user.isVerified) return <Navigate to="/verify-email" replace />;
  return children;
}

/** Usuário autenticado mas NÃO verificado pode acessar /verify-email. */
function RequireUnverified({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.isVerified) return <Navigate to="/dashboard" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user.isVerified) return <Navigate to="/verify-email" replace />;
  if (!user.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user && !user.isVerified) return <Navigate to="/verify-email" replace />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login"    element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />

          {/* Verificação de e-mail */}
          <Route path="/verify-email" element={<RequireUnverified><VerifyEmail /></RequireUnverified>} />

          {/* Protected */}
          <Route path="/dashboard"        element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/pre-session/:id"  element={<RequireAuth><PreSession /></RequireAuth>} />
          <Route path="/active/:id"       element={<RequireAuth><ActiveMonitoring /></RequireAuth>} />
          <Route path="/post-session/:id" element={<RequireAuth><PostSession /></RequireAuth>} />
          <Route path="/monitor"          element={<RequireAuth><Monitor /></RequireAuth>} />
          <Route path="/analytics"        element={<RequireAuth><Analytics /></RequireAuth>} />
          <Route path="/history"          element={<RequireAuth><History /></RequireAuth>} />
          <Route path="/notifications"    element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/profile"          element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/settings"         element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/teams"            element={<RequireAuth><Teams /></RequireAuth>} />

          {/* Admin */}
          <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
