import { motion } from 'framer-motion';
import { getHydrationStatus } from '../../utils/calculations';

export default function HydrationGauge({ value = 82, size = 160 }) {
  const status = getHydrationStatus(value);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  // Only use 270° arc (from 135° to 405°)
  const arcLength = circumference * 0.75;
  const offset = circumference - (arcLength * Math.min(value, 100)) / 100;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={8}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth={8}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C41E3A" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <motion.span
          className="text-4xl font-black tabular-nums leading-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {value}<span className="text-xl text-white/50">%</span>
        </motion.span>
        <span className={`text-xs font-bold ${status.color}`}>{status.label}</span>
        <span className="text-[10px] text-white/30 font-medium">Nível Hídrico</span>
      </div>
    </div>
  );
}
