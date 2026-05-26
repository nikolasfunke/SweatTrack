import { motion } from 'framer-motion';
import { Activity, Clock, Flame, ChevronRight } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDuration, relativeDate, INTENSITY_LABELS } from '../../utils/calculations';

export default function SessionCard({ session, onClick }) {
  const intensity = session.intensity || 'moderada';
  const badgeVariant = intensity === 'alta' ? 'alta' : intensity === 'moderada' ? 'moderada' : 'baixa';

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-border hover:border-border-bright cursor-pointer transition-colors"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
        <Activity size={18} className="text-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-white truncate">
          {session.session_type === 'match' ? 'Jogo' : session.session_type === 'recovery' ? 'Recuperação' : 'Treino'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-white/40">{relativeDate(session.created_at)}</span>
          {session.duration_minutes && (
            <span className="flex items-center gap-0.5 text-xs text-white/40">
              <Clock size={10} />
              {formatDuration(session.duration_minutes)}
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant={badgeVariant}>{INTENSITY_LABELS[intensity]}</Badge>
        <ChevronRight size={15} className="text-white/20" />
      </div>
    </motion.div>
  );
}
