import React from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";

function HistoricoSessoes() {

  const navigate = useNavigate();

  const sessoes = [
    {
      id: 1,
      treino: "Treino de Resistência",
      data: "18 Maio 2026",
      duracao: "92 min",
      perda: "2.1L",
      status: "Recuperado"
    },

    {
      id: 2,
      treino: "Cardio Intervalado",
      data: "15 Maio 2026",
      duracao: "54 min",
      perda: "1.4L",
      status: "Moderado"
    },

    {
      id: 3,
      treino: "Sessão Funcional",
      data: "12 Maio 2026",
      duracao: "70 min",
      perda: "1.8L",
      status: "Alta perda"
    }
  ];

  return (

<PageTransition>

    <div className="min-h-screen bg-[#F3F4F6] font-sans pb-28 max-w-md mx-auto relative shadow-2xl">

      <Header />

      {/* TITULO */}
      <div className="px-6 pt-6">

        <p className="text-[10px] font-black tracking-[0.25em] text-[#C40024] uppercase mb-2">
          Histórico de Sessões
        </p>

        <h1 className="text-[44px] leading-[42px] font-black text-[#1A1A1A] tracking-tight">
          Registro de<br />
          Atividades
        </h1>

        <div className="w-16 h-[4px] bg-[#C40024] rounded-full mt-4" />

      </div>

      {/* CARD RESUMO */}
      <div className="px-6 mt-7">

        <div className="bg-[#E3002B] rounded-[26px] p-6 text-white shadow-[0_10px_30px_rgba(227,0,43,0.20)]">

          <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-80 mb-3">
            Desempenho Geral
          </p>

          <h2 className="text-5xl font-black leading-none">
            24
          </h2>

          <p className="mt-3 text-sm opacity-90 leading-relaxed">
            Sessões monitoradas nos últimos 30 dias.
          </p>

        </div>

      </div>

      {/* LISTA */}
      <div className="px-6 mt-7 flex flex-col gap-4">

        {sessoes.map((sessao) => (

          <div
            key={sessao.id}
            className="bg-white rounded-[24px] p-5 shadow-[0_5px_20px_rgba(0,0,0,0.03)] relative overflow-hidden"
          >

            {/* DETALHE */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F8F5F5] rounded-bl-full opacity-80" />

            <div className="relative z-10">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-black mb-2">
                    Sessão registrada
                  </p>

                  <h2 className="text-2xl font-black text-[#222] leading-tight">
                    {sessao.treino}
                  </h2>

                </div>

                <div className="bg-[#F8F5F5] text-[#E3002B] px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide">
                  {sessao.status}
                </div>

              </div>

              <div className="flex items-center gap-2 mt-4">

                <div className="w-2 h-2 rounded-full bg-[#E3002B]" />

                <p className="text-sm text-gray-500">
                  {sessao.data}
                </p>

              </div>

              {/* METRICAS */}
              <div className="grid grid-cols-2 gap-3 mt-5">

                <div className="bg-[#F3F4F6] rounded-[18px] p-4">

                  <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 font-black mb-2">
                    Duração
                  </p>

                  <h3 className="text-3xl font-black text-[#222]">
                    {sessao.duracao}
                  </h3>

                </div>

                <div className="bg-[#F3F4F6] rounded-[18px] p-4">

                  <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 font-black mb-2">
                    Sudorese
                  </p>

                  <h3 className="text-3xl font-black text-[#E3002B]">
                    {sessao.perda}
                  </h3>

                </div>

              </div>

              <button className="w-full py-4 rounded-2xl bg-[#111] text-white font-black text-sm tracking-wide mt-5 hover:opacity-90 active:scale-95 transition-all">
                VISUALIZAR RELATÓRIO
              </button>

            </div>

          </div>

        ))}

      </div>

      <Navbar active="analises" />

    </div>

    </PageTransition>

  );

}

export default HistoricoSessoes;