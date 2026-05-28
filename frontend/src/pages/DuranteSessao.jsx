import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import logoFull from "../assets/logo_sweatTrack.svg";
import Navbar from "../components/Navbar";
import { IoReturnDownBackOutline } from "react-icons/io5";
import PageTransition from "../components/PageTransition";

function DuranteSessao() {

	const navigate = useNavigate();

	const [tempo, setTempo] = useState(255);
const [ingestaoSelecionada, setIngestaoSelecionada] = useState(250);

const [mostrarModal, setMostrarModal] = useState(false);
const [valorPersonalizado, setValorPersonalizado] = useState('');

useEffect(() => {

const interval = setInterval(() => {
setTempo((prev) => prev + 1);
}, 1000);

return () => clearInterval(interval);

}, []);

const formatarTempo = (segundos) => {

const hrs = String(Math.floor(segundos / 3600)).padStart(2, '0');
const mins = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
const secs = String(segundos % 60).padStart(2, '0');

return `${hrs}:${mins}:${secs}`;

};

const opcoesIngestao = [150, 250, 500];

return (

<PageTransition>

<div className="min-h-screen bg-[#F3F4F6] font-sans pb-24 max-w-md mx-auto relative shadow-2xl">

<header className="relative flex items-center justify-center p-6 bg-white shadow-sm h-24">

	<img src={logoFull} width={150} height={150} className="absolute left-1/2 transform -translate-x-1/2 translate-y-1" />

	<button
		type="button"
		onClick={() => navigate("/PreSessao")}
		className="absolute left-6 top-1 flex items-center gap-2 px-2 py-1 rounded-xl bg-[#DA0027] text-white text-xs font-bold shadow-[0_4px_12px_rgba(218,0,39,0.18)] hover:bg-red-700"
	>
		<span className="text-base"><IoReturnDownBackOutline /></span>
		<span className="hidden sm:inline">Voltar</span>
	</button>

	<div className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 border-2 border-white shadow-md overflow-hidden">
		<img
			src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
			alt="User"
		/>
	</div>

</header>

{/* TITULO */}
<div className="px-6 pt-6">

<p className="text-[10px] font-black tracking-[0.25em] text-[#C40024] uppercase mb-2 flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-[#C40024]" />
Monitoramento Ativo
</p>

<h1 className="text-[42px] leading-[42px] font-black text-[#111111] tracking-tight">
Durante a sessão
</h1>

<p className="text-sm text-gray-400 mt-2 font-medium">
Duração: {formatarTempo(tempo)}
</p>

</div>

{/* CARD PRINCIPAL */}
<div className="px-6 mt-8">

<div className="bg-white rounded-[22px] p-6 shadow-[0_5px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">

<div className="absolute top-0 right-0 w-20 h-20 bg-[#F8EEEE] rounded-bl-[22px]" />

<p className="text-[10px] font-black tracking-[0.18em] text-gray-400 uppercase mb-5 relative z-10">
Taxa de Sudorese Est.
</p>

<div className="flex items-end gap-2 relative z-10">

<h2 className="text-6xl font-black text-[#222] leading-none">
1.4
</h2>

<span className="text-[#C40024] font-black text-3xl mb-1">
L/h
</span>

</div>

<div className="mt-6 h-[3px] bg-gray-100 rounded-full overflow-hidden">
<div className="w-[65%] h-full bg-[#C40024] rounded-full" />
</div>

</div>

</div>

{/* CARDS PEQUENOS */}
<div className="px-6 mt-4 grid grid-cols-2 gap-3">

<div className="bg-[#EFEFF1] rounded-[18px] p-5">

<div className="mb-4">

<svg
width="18"
height="18"
viewBox="0 0 24 24"
fill="none"
stroke="#C40024"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
>
<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
</svg>

</div>

<p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 font-black mb-2">
Déficit Hídrico
</p>

<h3 className="text-3xl font-black text-[#222]">
-450<span className="text-xl">ml</span>
</h3>

</div>

<div className="bg-[#EFEFF1] rounded-[18px] p-5">

<div className="mb-4">

<svg
width="18"
height="18"
viewBox="0 0 24 24"
fill="none"
stroke="#0B5D80"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
>
<path d="M14 14.76V3.5a2 2 0 0 0-4 0v11.26a4 4 0 1 0 4 0z"></path>
</svg>

</div>

<p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 font-black mb-2">
Temp. Interna
</p>

<h3 className="text-3xl font-black text-[#222]">
38.2°C
</h3>

</div>

</div>

{/* REGISTRO */}
<div className="px-6 mt-8">

<h2 className="text-lg font-black text-[#222] mb-4">
Registro de Ingestão
</h2>

<div className="flex gap-3">

{opcoesIngestao.map((item) => (

<button
key={item}
onClick={() => setIngestaoSelecionada(item)}
className={`flex flex-col justify-center items-center rounded-2xl w-20 h-20 transition-all duration-200 ${
ingestaoSelecionada === item
? 'bg-white border-2 border-[#C40024] shadow-md'
: 'bg-[#F1F1F3]'
}`}
>

<span className="text-2xl font-black text-[#222]">
{item}
</span>

<span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
ml
</span>

</button>

))}

{/* BOTÃO PERSONAL */}
<button
onClick={() => setMostrarModal(true)}
className="bg-[#C40024] w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
>

<span className="text-3xl font-light leading-none">
+
</span>

<span className="text-[9px] font-black tracking-widest uppercase">
Personal
</span>

</button>

</div>

</div>

{/* CARD SUGESTÃO */}
<div className="px-6 mt-8">

<div className="bg-[#DDECF2] rounded-[20px] p-5 flex gap-4">

<div className="w-8 h-8 rounded-lg bg-[#1976A2] flex items-center justify-center text-white font-black shrink-0">
i
</div>

<div>

<h3 className="text-sm font-black text-[#14506D] mb-1">
Sugestão de Performance
</h3>

<p className="text-sm text-[#4B6B79] leading-relaxed">
Seu ritmo atual sugere uma ingestão de 200ml a cada 15 minutos para manter a homeostase.
</p>

</div>

</div>

</div>

{/* MODAL */}
{mostrarModal && (

<div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[100] px-6">

<div className="bg-white w-full max-w-[320px] rounded-[28px] p-6 shadow-2xl">

<h2 className="text-xl font-black text-[#222] mb-2">
Adicionar ingestão
</h2>

<p className="text-sm text-gray-400 mb-5 leading-relaxed">
Digite a quantidade ingerida durante a sessão.
</p>

<div className="bg-[#F3F4F6] rounded-2xl px-4 py-4 flex items-center">

<input
type="number"
placeholder="300"
value={valorPersonalizado}
onChange={(e) => setValorPersonalizado(e.target.value)}
className="bg-transparent w-full text-2xl font-black text-[#222] outline-none"
/>

<span className="text-sm font-bold text-gray-400">
ml
</span>

</div>

<div className="flex gap-3 mt-6">

<button
onClick={() => {
setMostrarModal(false);
setValorPersonalizado('');
}}
className="flex-1 py-3 rounded-2xl bg-[#F1F1F3] text-gray-500 font-bold hover:opacity-80 transition-all"
>
Cancelar
</button>

<button
onClick={() => {

if(valorPersonalizado){

setIngestaoSelecionada(Number(valorPersonalizado));

setMostrarModal(false);

setValorPersonalizado('');

}

}}
className="flex-1 py-3 rounded-2xl bg-[#C40024] text-white font-bold shadow-lg hover:bg-red-700 active:scale-95 transition-all"
>
Salvar
</button>

</div>

</div>

</div>

)}

<Navbar active="monitorar" />


</div>

</PageTransition>

);

}

export default DuranteSessao;