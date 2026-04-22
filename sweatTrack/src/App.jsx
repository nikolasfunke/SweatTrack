import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Login from './pages/Login'
import Inicio from './pages/Inicio'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Login />,
    
    <Inicio/>
  );
}

export default App
