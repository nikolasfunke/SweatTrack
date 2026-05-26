export default function Spinner({ size = 24, className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-white/10 border-t-primary ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-surface-0 flex flex-col items-center justify-center gap-4 z-50">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-surface-3 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-gradient">S</span>
        </div>
      </div>
      <p className="text-white/40 text-sm font-medium animate-pulse">Carregando...</p>
    </div>
  );
}
