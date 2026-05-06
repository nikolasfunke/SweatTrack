import { Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Inicio from './pages/Inicio'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/inicio" element={<Inicio />} />
    </Routes>
  );
}

export default App
