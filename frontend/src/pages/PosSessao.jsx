import React from 'react';
import logoFull from "../assets/logo_sweatTrack.svg";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";

function PosSessao() {

const navigate = useNavigate();

return (

    <PageTransition>

<div className="min-h-screen bg-[#F3F4F6] font-sans pb-24 max-w-md mx-auto relative shadow-2xl">
<Header/>


{/* TITULO */}
<div className="px-6 pt-6">

<p className="text-[10px] font-black tracking-[0.25em] text-[#C40024] uppercase mb-2">
Relatório de Performance
</p>

<h1 className="text-[44px] leading-[42px] font-black text-[#1A1A1A] tracking-tight">
Resumo Pós-<br />
Sessão
</h1>

<div className="w-16 h-[4px] bg-[#C40024] rounded-full mt-4" />

</div>

{/* CARD PRINCIPAL */}
<div className="px-6 mt-7">

<div className="bg-white rounded-[24px] p-6 relative overflow-hidden shadow-[0_5px_20px_rgba(0,0,0,0.03)]">

{/* DETALHE VISUAL */}
<div className="absolute top-0 right-0 w-28 h-28 bg-[#F8F5F5] rounded-bl-full opacity-80" />

<div className="absolute top-8 right-8 opacity-20">

<svg
width="52"
height="52"
viewBox="0 0 24 24"
fill="none"
stroke="#C40024"
strokeWidth="1.7"
strokeLinecap="round"
strokeLinejoin="round"
>
<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
</svg>

</div>

<p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-black mb-4 relative z-10">
Taxa de Sudorese
</p>

<div className="flex items-end gap-1 relative z-10">

<h2 className="text-6xl font-black text-[#E3002B] leading-none">
1.42
</h2>

<span className="text-2xl font-black text-gray-400 mb-1">
L/h
</span>

</div>

<p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-[220px] relative z-10">
Considerada <span className="text-[#E3002B] font-bold">moderada-alta</span> para as condições atuais (24°C / 65% UR).
</p>

</div>

</div>

{/* CARDS INFERIORES */}
<div className="px-6 mt-4 grid grid-cols-2 gap-3">

<div className="bg-[#EFEFF1] rounded-[20px] p-5">

<div className="mb-4">

<svg
width="18"
height="18"
viewBox="0 0 24 24"
fill="none"
stroke="#E3002B"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
>
<path d="M3 6h18"></path>
<path d="M3 12h18"></path>
<path d="M3 18h18"></path>
<path d="M6 3l2 3-2 3"></path>
<path d="M12 9l2 3-2 3"></path>
<path d="M18 15l2 3-2 3"></path>
</svg>

</div>

<p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 font-black mb-2">
Perda Total
</p>

<h3 className="text-4xl font-black text-[#222]">
2.15<span className="text-2xl"> L</span>
</h3>

</div>

<div className="bg-[#EFEFF1] rounded-[20px] p-5">

<div className="mb-4">

<svg
width="18"
height="18"
viewBox="0 0 24 24"
fill="none"
stroke="#E3002B"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
>
<circle cx="12" cy="13" r="8"></circle>
<path d="M12 9v4l2 2"></path>
<path d="M9 2h6"></path>
</svg>

</div>

<p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 font-black mb-2">
Duração
</p>

<h3 className="text-4xl font-black text-[#222]">
90<span className="text-2xl"> min</span>
</h3>

</div>

</div>

{/* PROTOCOLO */}
<div className="px-6 mt-8">

<h2 className="text-2xl font-black text-[#222] mb-6">
Protocolo de Recuperação
</h2>

<div className="flex flex-col gap-5">

{/* ITEM 1 */}
<div className="flex gap-4 items-start">

<div className="w-9 h-9 rounded-xl bg-[#E3002B] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
1
</div>

<div>

<h3 className="text-[15px] font-black text-[#222] mb-1">
Reidratação Imediata
</h3>

<p className="text-sm text-gray-500 leading-relaxed">
Consumir 3.2L de fluidos nas próximas 4 horas (150% da perda total).
</p>

</div>

</div>

{/* ITEM 2 */}
<div className="flex gap-4 items-start">

<div className="w-9 h-9 rounded-xl bg-[#E5E7EB] text-[#E3002B] flex items-center justify-center font-black text-sm shrink-0">
2
</div>

<div>

<h3 className="text-[15px] font-black text-[#222] mb-1">
Reposição de Eletrólitos
</h3>

<p className="text-sm text-gray-500 leading-relaxed">
Sua perda de sódio estimada foi de 1.800mg. Recomenda-se sachê eletrolítico isotônico.
</p>

</div>

</div>

{/* ITEM 3 */}
<div className="flex gap-4 items-start">

<div className="w-9 h-9 rounded-xl bg-[#E5E7EB] text-[#E3002B] flex items-center justify-center font-black text-sm shrink-0">
3
</div>

<div>

<h3 className="text-[15px] font-black text-[#222] mb-1">
Monitoramento de Urina
</h3>

<p className="text-sm text-gray-500 leading-relaxed">
Acompanhe a coloração da urina até atingir o tom amarelo-claro (Padrão 1-2 na escala de VUTS).
</p>

</div>

</div>

</div>

</div>

{/* CARD VERMELHO */}
<div className="px-6 mt-8">

<div className="bg-[#E3002B] rounded-[22px] p-6 text-white shadow-[0_10px_30px_rgba(227,0,43,0.25)]">

<p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-80 mb-3">
Análise Biopsicossocial
</p>

<h2 className="text-4xl leading-[38px] font-black mb-5">
Sua recuperação levará aprox. 14 horas.
</h2>

<div className="flex gap-2 items-start">

<div className="mt-1">
<svg
width="14"
height="14"
viewBox="0 0 24 24"
fill="currentColor"
>
<circle cx="12" cy="12" r="10"></circle>
</svg>
</div>

<p className="text-xs opacity-90 leading-relaxed">
Baseado em dados de temperatura e intensidade da sessão.
</p>

</div>

</div>

</div>

{/* BOTÃO */}
<div className="px-6 mt-8">

<button
onClick={() => navigate("/HistoricoSessoes")}
className="w-full py-5 rounded-2xl bg-[#E3002B] text-white font-black text-sm tracking-wide shadow-[0_10px_25px_rgba(227,0,43,0.25)] hover:bg-red-700 active:scale-95 transition-all"
>
SALVAR NO PRONTUÁRIO
</button>

</div>

<Navbar active="analises" />

</div>

</PageTransition>

);

}

export default PosSessao;