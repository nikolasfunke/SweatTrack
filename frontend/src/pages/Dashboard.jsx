import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logoFull from "../assets/logo_sweatTrack.svg";
import Navbar from "../components/Navbar";
import Header from "../components/Header";

// ── small SVG icons ──────────────────────────────────────────────
const PlusCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);



const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const RunnerIcon = ({ color = "#c0392b" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13" cy="4" r="2" />
    <path d="M7 21l3-6 3 3 2-8" />
    <path d="M17 21l-2-4" />
    <path d="M6 12l2-3 4 1 2-3" />
  </svg>
);

// ── Hydration Ring ───────────────────────────────────────────────
function HydrationRing({ percent = 82 }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - percent / 100);



  return (
    <div className="flex items-center justify-center my-4">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* track */}
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        {/* progress */}
        <circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke="#c0392b"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="70" y="67" textAnchor="middle" fontSize="22" fontWeight="700" fill="#111827">{percent}%</text>
        <text x="70" y="83" textAnchor="middle" fontSize="9" fill="#6b7280" letterSpacing="1">NÍVEL HÍDRICO</text>
      </svg>
    </div>
  );
}

// ── Session card ─────────────────────────────────────────────────
function SessionCard({ icon, title, date, duration, intensity, intensityColor }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-start gap-3 py-4 border-b border-gray-100 last:border-0"
    >
      <div className="mt-1 p-2 bg-red-50 rounded-xl">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{date}</p>
        <div className="flex gap-4 mt-1">
          <span className="text-xs text-gray-500">Duração: <span className="font-medium text-gray-700">{duration}</span></span>
          <span className="text-xs text-gray-500">Intensidade: <span className="font-semibold" style={{ color: intensityColor }}>{intensity}</span></span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const sessions = [
    {
      icon: <RunnerIcon color="#c0392b" />,
      title: "Atleta Pro: R. Alves",
      date: "hoje, às 08:47",
      duration: "45 min",
      intensity: "ALTA",
      intensityColor: "#c0392b",
    },
    {
      icon: <RunnerIcon color="#e67e22" />,
      title: "Atleta: M. Santos",
      date: "Ontem, às 16:20",
      duration: "1h 15 min",
      intensity: "MODERADA",
      intensityColor: "#e67e22",
    },
    {
      icon: <RunnerIcon color="#7c3aed" />,
      title: "Pacientes: Clínica 4",
      date: "Ontem, às 14:00",
      duration: "2h 30 min",
      intensity: "VARIADA",
      intensityColor: "#7c3aed",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-24 max-w-md mx-auto relative shadow-2xl">

      <Header/>

      {/* ── Content ── */}
      <div className="px-6 pt-8 pb-6 flex flex-col gap-4">

        {/* ── Hero greeting ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-[10px] text-[#DA0027] font-bold tracking-widest mb-1 uppercase">Dashboard de Performance</p>
          <h1 className="text-3xl font-black leading-tight text-gray-900">Olá, Dr. Silva</h1>
          <p className="text-xs text-gray-500 mt-3 font-medium leading-relaxed pr-8">O status clínico dos seus pacientes está estável.</p>

          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            className="mt-5 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#DA0027] text-white text-sm font-bold tracking-wide shadow-[0_8px_20px_rgba(218,0,39,0.3)] hover:bg-red-700 active:scale-95 transition-all"
            onClick={() => navigate("/PreSessao")}
          >
           
            <PlusCircleIcon />
            NOVA SESSÃO
          </motion.button>
        </motion.div>

        {/* ── Hydration card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-bold text-gray-800">Status de Hidratação</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Monitoramento biométrico em tempo real</p>
            </div>
            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">ÓTIMO</span>
          </div>

          <HydrationRing percent={82} />

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            {[
              { label: "TAXA DE SUOR", value: "1.2 L/h" },
              { label: "SÓDIO", value: "850 mg/L" },
              { label: "TEMPERATURA", value: "37.2 ºC" },
              { label: "ALERTA", value: "Normal", valueClass: "text-green-600 font-black" },
            ].map((s, i) => (
              <div key={i} className="bg-[#F2F4F7] rounded-xl px-3 py-2">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-sm font-black text-[#5C6672] ${s.valueClass || ""}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Brand banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-[20px] bg-[#DA0027] p-5 flex items-center gap-3 shadow-[0_8px_20px_rgba(218,0,39,0.3)]"
        >
          <img src={logoFull} alt="SweatTrack" className="h-8 brightness-0 invert opacity-90" />
          <div>
            <p className="text-[10px] font-black text-white tracking-widest uppercase">Sweat-Track</p>
            <p className="text-xs text-red-100 mt-1 font-medium leading-relaxed">Tecnologia proprietária São Camilo para análise termoregulatória de alta precisão.</p>
          </div>
        </motion.div>

        {/* ── Quick access ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-[#F2F4F7] rounded-[20px] overflow-hidden"
        >
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-5 pt-4 pb-2">Acesso Rápido</p>
          {[
            { icon: <FileIcon />, label: "Relatórios Exportáveis" },
            { icon: <ClipboardIcon />, label: "Histórico de Testes" },
          ].map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ backgroundColor: "#e8eaed" }}
              className="w-full flex items-center gap-3 px-5 py-3.5 border-t border-black/5 text-sm font-bold text-gray-800 transition text-left"
            >
              {item.icon}
              {item.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Recent sessions ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-black text-gray-900">Sessões Recentes</h2>
            <button className="text-[10px] font-bold text-[#DA0027] uppercase tracking-wider hover:underline transition">Ver todas</button>
          </div>

          <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-4">
            {sessions.map((s, i) => (
              <SessionCard key={i} {...s} />
            ))}
          </div>
        </motion.div>

      </div>

      <Navbar active="inicio" />
      

    </div>
  );
}

export default Dashboard;
