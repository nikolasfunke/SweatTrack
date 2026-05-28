import React from 'react';
import logoFull from "../assets/logo_sweatTrack.svg";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import PageTransition from "../components/PageTransition";

function Perfil() {
  return (

<PageTransition>

    <div className="min-h-screen bg-[#F3F4F6] font-sans pb-24 max-w-md mx-auto relative shadow-2xl">

      <Header/>

      {/* TITULO */}
      <div className="px-6 pt-6">
        <p className="text-[10px] font-black tracking-[0.25em] text-[#C40024] uppercase mb-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C40024]" />
          Conta &amp; Configurações
        </p>
        <h1 className="text-[42px] leading-[42px] font-black text-[#111111] tracking-tight">
          Perfil
        </h1>
      </div>

      {/* CARD DE PERFIL */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-[22px] p-6 shadow-[0_5px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">

          <div className="absolute top-0 right-0 w-20 h-20 bg-[#F8EEEE] rounded-bl-[22px]" />

          {/* Avatar */}
          <div className="w-16 h-16 rounded-[18px] bg-[#C40024] overflow-hidden mb-4 relative z-10">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Dr. Silva"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-xl font-black text-[#111] tracking-tight relative z-10">Dr. Carlos Silva</p>
          <p className="text-[10px] font-black tracking-[0.18em] text-[#C40024] uppercase mt-1 relative z-10">
            Fisiologista do Esporte
          </p>

          <div className="inline-flex items-center gap-1.5 mt-3 bg-green-50 px-3 py-1 rounded-full relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[9px] font-black uppercase tracking-wider text-green-700">Conta Ativa · São Camilo</span>
          </div>

          <div className="h-px bg-[#F2F4F7] my-4" />

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "CRM", value: "SP-123456" },
              { label: "Especialidade", value: "Esporte" },
              { label: "Unidade", value: "Ipiranga" },
              { label: "Membro desde", value: "Jan 2023" },
            ].map((item, i) => (
              <div key={i} className="bg-[#F2F4F7] rounded-xl px-3 py-2">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-sm font-black text-[#5C6672]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="px-6 mt-3 grid grid-cols-3 gap-3">
        {[
          { number: "84", label: "Sessões" },
          { number: "12", label: "Atletas" },
          { number: "3k", label: "Dados Reg." },
        ].map((s, i) => (
          <div key={i} className="bg-[#EFEFF1] rounded-[18px] p-4 text-center">
            <h3 className="text-3xl font-black text-[#222]">{s.number}</h3>
            <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 font-black mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* MENU: CONTA */}
      <div className="px-6 mt-6">
        <div className="bg-[#F2F4F7] rounded-[20px] overflow-hidden">
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-5 pt-4 pb-2">Conta</p>

          {[
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C40024" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              ),
              iconBg: "bg-red-50",
              title: "Dados Pessoais",
              sub: "Nome, e-mail, telefone",
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
              iconBg: "bg-gray-200",
              title: "Segurança",
              sub: "Senha e autenticação",
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              ),
              iconBg: "bg-blue-100",
              title: "Notificações",
              sub: "Alertas e lembretes",
            },
          ].map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-5 py-3.5 border-t border-black/5 text-left hover:bg-[#e8eaed] transition"
            >
              <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{item.title}</p>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{item.sub}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* MENU: DADOS CLÍNICOS */}
      <div className="px-6 mt-3">
        <div className="bg-[#F2F4F7] rounded-[20px] overflow-hidden">
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-5 pt-4 pb-2">Dados Clínicos</p>

          {[
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C40024" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" />
                </svg>
              ),
              iconBg: "bg-red-50",
              title: "Meus Pacientes",
              sub: "12 pacientes ativos",
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="15" y2="17" />
                </svg>
              ),
              iconBg: "bg-gray-200",
              title: "Relatórios Gerados",
              sub: "84 arquivos exportados",
            },
          ].map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-5 py-3.5 border-t border-black/5 text-left hover:bg-[#e8eaed] transition"
            >
              <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{item.title}</p>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{item.sub}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* CARD PLANO */}
      <div className="px-6 mt-3">
        <div className="bg-[#C40024] rounded-[22px] p-5 flex items-center gap-4 shadow-[0_10px_30px_rgba(196,0,36,0.25)]">
          <div className="w-11 h-11 rounded-[14px] bg-white/20 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-white">Plano Institucional São Camilo</p>
            <p className="text-xs text-red-200 font-semibold mt-1">Acesso completo · Renovação em Dez 2025</p>
          </div>
        </div>
      </div>

      {/* BOTÃO SAIR */}
      <div className="px-6 mt-4">
        <button className="w-full py-4 rounded-2xl bg-[#F2F4F7] text-[#C40024] font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-red-50 active:scale-95 transition-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair da Conta
        </button>
      </div>

      <Navbar active="PERFIL" />

    </div>

    </PageTransition>
    
  );
}

export default Perfil;
