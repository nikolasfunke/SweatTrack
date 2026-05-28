import { motion } from 'framer-motion';
import { URINE_COLORS } from '../../utils/calculations';

export default function UrineScale({ selected, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {URINE_COLORS.map((c) => (
          <motion.button
            key={c.level}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange?.(c.level)}
            className={`flex-1 h-8 rounded-lg transition-all duration-150 border-2 ${
              selected === c.level
                ? 'border-white scale-110 shadow-lg'
                : 'border-transparent opacity-60 hover:opacity-90'
            }`}
            style={{ backgroundColor: c.color }}
            title={`Nível ${c.level}: ${c.label}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-white/30 font-medium px-0.5">
        <span>Ótimo</span>
        <span>Desidratado</span>
      </div>
      {selected && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs font-semibold"
          style={{ color: URINE_COLORS[selected - 1]?.level <= 4 ? '#a3e635' : '#f97316' }}
        >
          Nível {selected} — {URINE_COLORS[selected - 1]?.label}
        </motion.p>
      )}
    </div>
  );
}
