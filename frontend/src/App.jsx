import { Routes, Route } from 'react-router-dom'
import './App.css'
import Inicio from './pages/Inicio'
import Dashboard from './pages/Dashboard'
import PreSessao from './pages/PreSessao'
import DuranteSessao from './pages/DuranteSessao'
import PosSessao from './pages/PosSessao'
import Perfil from './pages/Perfil'
import HistoricoSessoes from './pages/HistoricoSessoes'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/PreSessao" element={<PreSessao />} />
      <Route path="/DuranteSessao" element={<DuranteSessao />} />
      <Route path="/PosSessao" element={<PosSessao />} />
      <Route path="/Perfil" element={<Perfil />} />
      <Route path="/HistoricoSessoes" element={<HistoricoSessoes />} />
    </Routes>
  );
}

export default App
