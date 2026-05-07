import { Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import PreSessao from './pages/PreSessao'
import DuranteSessao from './pages/DuranteSessao'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/inicio" element={<Inicio />} />
      <Route path="/PreSessao" element={<PreSessao />} />
      <Route path="/DuranteSessao" element={<DuranteSessao />} />
    </Routes>
  );
}

export default App
