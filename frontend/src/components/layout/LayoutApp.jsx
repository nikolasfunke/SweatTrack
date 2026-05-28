import { motion } from 'framer-motion';
import BarraLateral from './BarraLateral';
import NavegacaoInferior from './NavegacaoInferior';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

export default function LayoutApp({ children }) {
  return (
    <div className="flex min-h-screen bg-surface-0">
      <BarraLateral />
      <main className="flex-1 min-w-0 flex flex-col">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1"
        >
          {children}
        </motion.div>
      </main>
      <NavegacaoInferior />
    </div>
  );
}
