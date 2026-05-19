import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ active }) {

  const navigate = useNavigate();

  return (

    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#F8F5F5] border-t border-black/[0.03] flex justify-around items-center pt-3 pb-5 px-2 rounded-t-[30px] shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-50">

      {/* INÍCIO */}
      <button
        onClick={() => navigate("/Dashboard")}
        className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${
          active === "inicio"
            ? "text-[#C40024] bg-red-50 -mt-2"
            : "text-gray-400"
        }`}
      >

        <svg width="18" height="18" viewBox="0 0 24 24" fill={active === "inicio" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>

        <span className="text-[9px] font-bold uppercase">
          Início
        </span>

      </button>

      {/* MONITORAR */}
      <button
        onClick={() => navigate("/PreSessao")}
        className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${
          active === "monitorar"
            ? "text-[#C40024] bg-red-50 -mt-2"
            : "text-gray-400"
        }`}
      >

        <svg width="18" height="18" viewBox="0 0 24 24" fill={active === "monitorar" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>

        <span className="text-[9px] font-bold uppercase">
          Monitorar
        </span>

      </button>

      {/* ANÁLISES */}
      <button
      onClick={() => navigate("/PosSessao")}
        className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${
          active === "analises"
            ? "text-[#C40024] bg-red-50 -mt-2"
            : "text-gray-400"
        }`}
      >

        <svg width="18" height="18" viewBox="0 0 24 24" fill={active === "analises" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M18 20V10" />
          <path d="M12 20V4" />
          <path d="M6 20v-4" />
        </svg>

        <span className="text-[9px] font-bold uppercase">
          Análises
        </span>

      </button>

      {/* PERFIL */}
      <button
        onClick={() => navigate("/Perfil")}
        className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${
          active === "PERFIL"
            ? "text-[#C40024] bg-red-50 -mt-2"
            : "text-gray-400"
        }`}
      >

        <svg width="18" height="18" viewBox="0 0 24 24" fill={active === "PERFIL" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>

        <span className="text-[9px] font-bold uppercase">
          Perfil
        </span>

      </button>

    </nav>

  );
}

export default Navbar;