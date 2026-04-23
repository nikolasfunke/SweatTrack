import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoFull from "../assets/logo_sweatTrack.svg";
import logoIcon from "../assets/logo.svg";
import bgVideo from "../assets/bg_video_pre.mp4";
import bgStatic from "../assets/bg_static.jpeg";

function Inicio() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center pt-36 relative overflow-hidden">
      {/*  FUTURO FUNDO ANIMADO */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black -z-10" /> */}
      <div className="absolute inset-0 -z-20">
        {/* IMAGEM */}
        <img
          src={bgStatic}
          className="absolute w-full h-full object-cover blur-[2px] scale-120 brightness-75 opacity-80"
        />

        {/* VÍDEO */}
        <motion.video
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1 }}
          className="w-full h-full object-cover blur-[2px] scale-120 brightness-75"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/10 via-red-900/10 to-black/40 -z-10" />

      {/* LOGO */}
      <AnimatePresence>
        <motion.img
          src={logoFull}
          initial={{ opacity: 0, y: -40 }}
          animate={{
            opacity: 1,
            y: showForm ? -20 : 0, // leve ajuste quando abre o form
          }}
          transition={{ duration: 0.4 }}
          className="w-86 mx-auto mb-46 drop-shadow-md"
        />
      </AnimatePresence>

      {/* CONTEÚDO */}
      <div className="w-full max-w-xs px-6">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="buttons"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="flex flex-col gap-4"
            >
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 rounded-full bg-gradient-to-r from-red-700 to-red-900 text-white font-semibold shadow-[0_4px_24px_rgba(131,2,2,0.5)] hover:shadow-[0_8px_32px_rgba(131,2,2,0.6)] hover:scale-[1.03] active:scale-[0.97] transition duration-200"
              >
                LOGIN
              </button>

              <button className="w-full py-3 rounded-full bg-white/15 backdrop-blur-lg text-white font-medium shadow-md border border-white/20 hover:bg-white/25 hover:scale-[1.02] active:scale-[0.98] transition">
                CADASTRO
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: -60 }}
              exit={{ opacity: 0, y: -40 }}
              className="flex flex-col gap-4"
            >
              <input
                placeholder="Email"
                className="px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <input
                type="password"
                placeholder="Senha"
                className="px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <button className="w-full py-3 rounded-full bg-[#830202] text-white font-semibold hover:bg-red-700 transition">
                Entrar
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-900/90 mt-2"
              >
                ← Voltar
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Inicio;
