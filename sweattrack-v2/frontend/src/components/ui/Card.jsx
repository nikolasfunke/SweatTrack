import { motion } from 'framer-motion';

export default function Card({ children, className = '', onClick, hover = false, glow = false }) {
  const base = `card p-4 ${glow ? 'shadow-red-glow border-primary/30' : ''} ${className}`;
  if (onClick || hover) {
    return (
      <motion.div
        className={`${base} cursor-pointer`}
        onClick={onClick}
        whileHover={{ scale: 1.01, borderColor: 'rgba(196,30,58,0.4)' }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    );
  }
  return <div className={base}>{children}</div>;
}
