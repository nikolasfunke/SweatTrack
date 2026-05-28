export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default:  'bg-surface-3 text-white/70',
    primary:  'bg-primary/20 text-rose-300 border border-primary/30',
    success:  'bg-emerald-500/20 text-emerald-300',
    warning:  'bg-amber-500/20 text-amber-300',
    danger:   'bg-rose-500/20 text-rose-300',
    info:     'bg-sky-500/20 text-sky-300',
    alta:     'bg-rose-500/15 text-rose-400',
    moderada: 'bg-amber-500/15 text-amber-400',
    baixa:    'bg-emerald-500/15 text-emerald-400',
    variada:  'bg-violet-500/15 text-violet-400',
    otimo:    'bg-emerald-500/15 text-emerald-400',
  };
  return (
    <span className={`badge ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
