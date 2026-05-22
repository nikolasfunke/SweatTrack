import React, { useState } from 'react';
import logoIcon from "../assets/logo.svg";
import logoFull from "../assets/logo_sweatTrack.svg";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PageTransition from "../components/PageTransition";

function PreSessao() {
    const navigate = useNavigate();
// Estados para controlar os inputs do usuário
const [peso, setPeso] = useState('00.0');
const [hidratacao, setHidratacao] = useState(3); // Índice da cor selecionada (0 a 6)
const [sede, setSede] = useState(5); // Nível de sede (0 a 10)

// Array com as cores da escala de urina (do mais claro ao mais escuro)
const urineColors = [
'#FFF9DE', // 0
'#FEEFB3', // 1
'#FDE073', // 2
'#EFC030', // 3 (Padrão selecionado na imagem)
'#D9A400', // 4
'#B07D00', // 5
'#8B4513', // 6
];

return (

<PageTransition>

// Container principal simulando a tela do celular com fundo off-white
<div className="min-h-screen bg-[#F8F9FA] font-sans pb-24 max-w-md mx-auto relative shadow-2xl">
<Header/>

{/* ÁREA DE TÍTULOS */}
<div className="px-6 pt-8 pb-6">
<p className="text-[10px] text-[#DA0027] font-bold tracking-widest mb-1 uppercase">
Módulo de Performance
</p>
<h1 className="text-3xl font-black leading-tight text-gray-900">
Pré-Sessão <br />
<span className="text-gray-400">SWEAT-TRACK</span>
</h1>
<p className="text-xs text-gray-500 mt-3 font-medium leading-relaxed pr-8">
Registre os dados basais para calibração precisa da taxa de sudorese e hidratação durante o treinamento.
</p>
</div>

{/* CARDS DE INPUT */}
<div className="px-6 flex flex-col gap-4">
{/* 1. CARD MASSA CORPORAL */}
<div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
<div className="flex justify-between items-center mb-1">
<h2 className="text-sm font-bold text-gray-800">Massa Corporal</h2>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DA0027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
<line x1="7" y1="7" x2="7.01" y2="7"></line>
</svg>
</div>
<p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-4">
Baseline em Jejum
</p>
<div className="bg-[#F2F4F7] rounded-xl p-4 flex justify-between items-center">
<input
type="number"
value={peso}
onChange={(e) => setPeso(e.target.value)}
className="bg-transparent text-3xl font-black text-[#5C6672] w-full focus:outline-none"
/>
<span className="text-gray-400 font-bold text-sm">KG</span>
</div>
</div>

{/* 2. CARD ESCALA DE HIDRATAÇÃO */}
<div className="bg-[#F2F4F7] rounded-[20px] p-5">
<h2 className="text-sm font-bold text-gray-800 mb-1">Escala de Hidratação</h2>
<p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-4">
Coloração da Urina
</p>
<div className="flex justify-between items-center gap-1">
{urineColors.map((cor, index) => (
<button
key={index}
onClick={() => setHidratacao(index)}
style={{ backgroundColor: cor }}
className={`flex-1 h-12 rounded-lg transition-all duration-200 ${
hidratacao === index
? 'border-[3px] border-[#DA0027] scale-110 shadow-md'
: 'border border-black/5 opacity-90 hover:opacity-100'
}`}
/>
))}
</div>
<div className="flex justify-between text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-3">
<span>Hidratado</span>
<span>Desidratado</span>
</div>
</div>

{/* 3. CARD PERCEPÇÃO DE SEDE */}
<div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
<div className="flex items-center gap-2 mb-6">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DA0027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
</svg>
<h2 className="text-sm font-bold text-gray-800">Percepção de Sede</h2>
</div>
{/* SLIDER (Range Input) */}
<div className="relative w-full">
<input
type="range"
min="0"
max="10"
value={sede}
onChange={(e) => setSede(e.target.value)}
className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#DA0027]"
/>
<div className="flex justify-between text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-4">
<div className="flex flex-col items-center gap-1">
<span className="text-gray-800 text-xs">0</span>
Nenhuma
</div>
<div className="flex flex-col items-center gap-1">
<span className="text-gray-800 text-xs">5</span>
Moderada
</div>
<div className="flex flex-col items-center gap-1">
<span className="text-gray-800 text-xs">10</span>
Extrema
</div>
</div>
</div>
</div>

</div>

{/* BOTÃO E RODAPÉ */}
<div className="px-6 mt-8">
<button
onClick={() => navigate("/DuranteSessao")}
className="w-full py-4 rounded-2xl bg-[#DA0027] text-white font-bold text-sm tracking-wide shadow-[0_8px_20px_rgba(218,0,39,0.3)] hover:bg-red-700 active:scale-95 transition-all"
>
INICIAR SESSAO
</button>
<p className="text-center text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-3">
Sweat Track
</p>
</div>

<Navbar active="monitorar" />

</div>

</PageTransition>

);
}

export default PreSessao;
