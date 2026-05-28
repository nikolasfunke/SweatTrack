import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, Droplets, BarChart3, Shield, ArrowRight, ChevronDown } from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/layout/Logo';

const FEATURES = [
  { icon: Droplets, title: 'Monitoramento Hídrico', desc: 'Rastreie sua hidratação em tempo real com cálculo preciso da taxa de sudorese.' },
  { icon: Activity, title: 'Sessões Inteligentes', desc: 'Pré, durante e pós-sessão com protocolos baseados em evidências científicas.' },
  { icon: BarChart3, title: 'Analytics Avançado', desc: 'Relatórios de performance, tendências e recomendações personalizadas.' },
  { icon: Shield, title: 'Protocolo Clínico', desc: 'Tecnologia São Camilo para análise termoregulatória de alta precisão.' },
];

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-0 overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-0 w-[200px] h-[200px] bg-rose-500/5 rounded-full blur-2xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Entrar</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
            Começar grátis
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
              Tecnologia São Camilo
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
            Performance<br />
            <span className="text-gradient">começa pela</span><br />
            hidratação
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Monitoramento inteligente de sudorese, hidratação e nutrição esportiva.
            Baseado em evidências científicas para atletas de alto rendimento.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="primary" size="lg"
              onClick={() => navigate('/register')}
              className="min-w-[200px]"
            >
              Começar agora <ArrowRight size={16} />
            </Button>
            <Button
              variant="outline" size="lg"
              onClick={() => navigate('/login')}
              className="min-w-[160px]"
            >
              Fazer login
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-8 pt-8">
            {[['98%', 'Precisão'], ['2.5k+', 'Atletas'], ['50+', 'Clínicas']].map(([val, lab]) => (
              <div key={lab} className="text-center">
                <p className="text-2xl font-black text-gradient">{val}</p>
                <p className="text-xs text-white/30 font-medium">{lab}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Mockup preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
          className="mt-16 mx-auto max-w-sm"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75" />
            <div className="relative bg-surface-1 border border-border rounded-3xl p-5 shadow-2xl">
              {/* Mini dashboard mockup */}
              <div className="text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Dashboard</p>
                    <p className="font-bold text-sm">Olá, Dr. Silva 👋</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">S</div>
                </div>
                {/* Gauge mockup */}
                <div className="bg-surface-2 rounded-2xl p-4 flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" strokeDasharray="122 163" strokeLinecap="round" />
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#C41E3A" strokeWidth="5" strokeDasharray="100 163" strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-black">82%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Status de Hidratação</p>
                    <p className="font-bold text-sm text-emerald-400">Ótimo</p>
                    <p className="text-[10px] text-white/30">Monitoramento em tempo real</p>
                  </div>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {[['1.2 L/h', 'Taxa Suor'], ['850', 'Sódio mg/L'], ['37.2°C', 'Temp']].map(([v, l]) => (
                    <div key={l} className="bg-surface-2 rounded-xl p-2 text-center">
                      <p className="text-xs font-black text-white">{v}</p>
                      <p className="text-[9px] text-white/30">{l}</p>
                    </div>
                  ))}
                </div>
                {/* CTA button */}
                <div className="bg-primary rounded-xl py-2.5 text-center">
                  <p className="text-xs font-bold">+ Nova Sessão</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-12 flex justify-center text-white/20"
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial="initial" whileInView="animate" viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title} variants={fadeUp}
              className="bg-surface-1 border border-border rounded-2xl p-5 hover:border-primary/30 hover:bg-surface-2 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon size={20} className="text-primary" />
              </div>
              <h3 className="font-bold text-sm mb-2">{title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary/20 to-rose-900/10 border border-primary/20 rounded-3xl p-10 text-center"
        >
          <h2 className="text-3xl font-black mb-3">Pronto para elevar a performance?</h2>
          <p className="text-white/50 mb-6 max-w-md mx-auto">Junte-se a milhares de atletas e profissionais que já usam o SweatTrack.</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/register')} className="mx-auto min-w-[200px]">
            Criar conta grátis <ArrowRight size={16} />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6 text-center text-xs text-white/20">
        <Logo size="sm" className="justify-center mb-3" />
        <p>© 2025 SweatTrack — Tecnologia São Camilo. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
