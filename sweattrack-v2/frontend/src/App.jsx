import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/ContextoAutenticacao';
import { PageLoader } from './components/ui/Spinner';

import Login              from './pages/Login';
import Cadastro           from './pages/Cadastro';
import Painel             from './pages/Painel';
import PreSessao          from './pages/PreSessao';
import MonitoramentoAtivo from './pages/MonitoramentoAtivo';
import PosSessao          from './pages/PosSessao';
import Analises           from './pages/Analises';
import PlanoAlimentar     from './pages/PlanoAlimentar';
import Historico          from './pages/Historico';
import Monitorar          from './pages/Monitorar';
import Notificacoes       from './pages/Notificacoes';
import Perfil             from './pages/Perfil';
import Configuracoes      from './pages/Configuracoes';

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
  if (user) return <Navigate to="/painel" replace />;
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
        <Route path="/cadastro" element={<RedirectIfAuth><Cadastro /></RedirectIfAuth>} />

        {/* Protected */}
        <Route path="/painel"           element={<RequireAuth><Painel /></RequireAuth>} />
        <Route path="/pre-sessao/:id"   element={<RequireAuth><PreSessao /></RequireAuth>} />
        <Route path="/ativo/:id"        element={<RequireAuth><MonitoramentoAtivo /></RequireAuth>} />
        <Route path="/pos-sessao/:id"   element={<RequireAuth><PosSessao /></RequireAuth>} />
        <Route path="/monitorar"        element={<RequireAuth><Monitorar /></RequireAuth>} />
        <Route path="/analises"         element={<RequireAuth><Analises /></RequireAuth>} />
        <Route path="/plano-alimentar"  element={<RequireAuth><PlanoAlimentar /></RequireAuth>} />
        <Route path="/historico"        element={<RequireAuth><Historico /></RequireAuth>} />
        <Route path="/notificacoes"     element={<RequireAuth><Notificacoes /></RequireAuth>} />
        <Route path="/perfil"           element={<RequireAuth><Perfil /></RequireAuth>} />
        <Route path="/configuracoes"    element={<RequireAuth><Configuracoes /></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

