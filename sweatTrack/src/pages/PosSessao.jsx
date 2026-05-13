import React from 'react'
import logoFull from '../assets/logo_sweatTrack.svg'

function PosSessao() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-xl w-full p-8 bg-white rounded-3xl shadow-lg text-center">
        <img src={logoFull} alt="SweatTrack Logo" className="mx-auto mb-6 w-32" />
        <h1 className="text-3xl font-bold mb-4">Pós-Sessão</h1>
        <p className="text-gray-600">
          Página em construção. Aqui você verá os resultados de hidratação e recuperação após o treino.
        </p>
      </div>
    </div>
  )
}

export default PosSessao
