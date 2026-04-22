import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.svg";

function Inicio() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-100 relative overflow-hidden">

      {/* Background */}
      <div className="absolute w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl top-[-100px] right-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-gray-400/20 rounded-full blur-3xl bottom-[-120px] left-[-120px]" />

      <motion.div
        layout
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative w-full max-w-sm p-8 rounded-3xl bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-white/40"
      >

        {/* LOGO (some quando abre form) */}
        <AnimatePresence>
          {!showForm && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center mb-10"
            >
              <img src={logo} alt="Logo" className="w-28 drop-shadow-md" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTEÚDO */}
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-4"
            >
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 rounded-full bg-white text-red-600 font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                LOGIN
              </button>

              <button className="w-full py-3 rounded-full bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
                CADASTRO
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                placeholder="Email"
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
              />

              <input
                type="password"
                placeholder="Senha"
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
              />

              <button className="w-full py-3 rounded-full bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 transition-all">
                Entrar
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700 mt-2"
              >
                ← Voltar
              </button>
            </motion.form>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}

export default Inicio;