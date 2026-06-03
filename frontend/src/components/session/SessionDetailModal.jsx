import { useState } from 'react';
import {
  Activity, Clock, Droplets, TrendingDown, Scale, Download, Trash2, AlertTriangle,
} from 'lucide-react';
import Modal, { ConfirmModal } from '../ui/Modal';
import Button from '../ui/Button';
import { printSessionReport } from '../../utils/printReport';
import { sessionApi } from '../../services/api';
import {
  formatDuration, relativeDate, INTENSITY_LABELS,
  getSweatRateLabel, calcRecoveryFluid,
} from '../../utils/calculations';

const SESSION_TYPE_LABEL = { training: 'Treino', match: 'Jogo', recovery: 'Recuperação' };
const INTENSITY_COLOR = { baixa: '#34d399', moderada: '#fbbf24', alta: '#f87171', variada: '#a78bfa' };

export default function SessionDetailModal({ session, open, onClose, onDeleted }) {
  return (
    <Modal open={open} onClose={onClose} size="full">
      {session && <SessionDetailContent session={session} onClose={onClose} onDeleted={onDeleted} />}
    </Modal>
  );
}

function SessionDetailContent({ session, onClose, onDeleted }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const sweatLabel = getSweatRateLabel(session.sweat_rate_lh);
  const deficitMl = Math.abs(session.hydric_deficit_ml ?? 0);
  const recoveryMl = deficitMl > 0 ? calcRecoveryFluid(deficitMl) : null;
  const intColor = INTENSITY_COLOR[session.intensity] ?? '#C41E3A';

  // Weight variation in percentage
  const hasWeightVariation = session.pre_weight_kg && session.post_weight_kg;
  const weightLossKg = hasWeightVariation ? session.pre_weight_kg - session.post_weight_kg : 0;
  const weightLossPct = hasWeightVariation ? (weightLossKg / session.pre_weight_kg) * 100 : 0;
  const isWeightAlert = weightLossPct > 2;

  const sessionDate = session.ended_at
    ? new Date(session.ended_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : relativeDate(session.created_at);

  async function handleDelete() {
    setDeleting(true);
    try {
      await sessionApi.delete(session.id);
      setShowConfirm(false);
      onClose();
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4 -mt-1">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Activity size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-lg leading-tight">
              {SESSION_TYPE_LABEL[session.session_type] ?? 'Sessão'}
            </h3>
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: `${intColor}20`, color: intColor }}
            >
              {INTENSITY_LABELS[session.intensity] ?? session.intensity}
            </span>
          </div>
          <p className="text-xs text-white/40 mt-0.5">{sessionDate}</p>
          {session.duration_minutes && (
            <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1">
              <Clock size={11} /> {formatDuration(session.duration_minutes)}
            </p>
          )}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <MetricTile
          icon={<Droplets size={14} className="text-sky-400" />}
          label="Taxa de Suor"
          value={session.sweat_rate_lh ? `${session.sweat_rate_lh} L/h` : '—'}
          sub={session.sweat_rate_lh ? sweatLabel.label : undefined}
          subColor={sweatLabel.color}
        />
        <MetricTile
          icon={<TrendingDown size={14} className="text-rose-400" />}
          label="Déficit Hídrico"
          value={session.hydric_deficit_ml ? `${(deficitMl / 1000).toFixed(2)} L` : '—'}
          sub={deficitMl > 2000 ? 'Elevado' : deficitMl > 0 ? 'Normal' : undefined}
          subColor={deficitMl > 2000 ? 'text-rose-400' : 'text-emerald-400'}
        />
        <MetricTile
          icon={<Scale size={14} className={isWeightAlert ? 'text-rose-400' : 'text-emerald-400'} />}
          label="Variação de Peso"
          value={hasWeightVariation ? `-${weightLossPct.toFixed(1)}%` : '—'}
          sub={hasWeightVariation ? (isWeightAlert ? 'Desidratação > 2%' : 'Dentro do esperado') : undefined}
          subColor={isWeightAlert ? 'text-rose-400' : 'text-emerald-400'}
          alert={isWeightAlert}
        />
      </div>

      {/* Ambient temp row */}
      {session.ambient_temp && (
        <div className="bg-surface-2 rounded-2xl p-3 flex items-center gap-3">
          <Scale size={14} className="text-sky-400 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-white/30">Temperatura Ambiente (no momento)</p>
            <p className="font-bold text-sm">{session.ambient_temp}°C</p>
          </div>
        </div>
      )}

      {/* Pre / post weight */}
      {(session.pre_weight_kg || session.post_weight_kg) && (
        <div className="bg-surface-2 rounded-2xl p-3 flex items-center gap-4">
          <Scale size={15} className="text-white/30 flex-shrink-0" />
          <div className="flex gap-6">
            {session.pre_weight_kg && (
              <div>
                <p className="text-[10px] text-white/30">Pré-treino</p>
                <p className="font-bold text-sm">{session.pre_weight_kg} kg</p>
              </div>
            )}
            {session.post_weight_kg && (
              <div>
                <p className="text-[10px] text-white/30">Pós-treino</p>
                <p className="font-bold text-sm">{session.post_weight_kg} kg</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Symptoms */}
      {session.symptoms && Array.isArray(session.symptoms) && session.symptoms.length > 0 && (
        <div className="bg-surface-2 rounded-2xl p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-rose-400" />
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Sintomas Registrados</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {session.symptoms.map((sym) => (
              <span key={sym} className="text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                {sym}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weight loss alert */}
      {isWeightAlert && (
        <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-3 flex items-start gap-2">
          <AlertTriangle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-0.5">
              Alerta de Desidratação
            </p>
            <p className="text-xs text-rose-300/80 leading-relaxed">
              Perda de {weightLossPct.toFixed(1)}% da massa corporal (&gt; 2%). Reforçar reposição hídrica.
            </p>
          </div>
        </div>
      )}

      {/* Recovery insight */}
      {recoveryMl && (
        <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-3">
          <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">
            Recomendação de Recuperação
          </p>
          <p className="text-xs text-white/60 leading-relaxed">
            Consumir <span className="text-white font-bold">{recoveryMl}ml</span> de fluidos nas próximas 4 horas para reposição completa.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        <Button variant="primary" icon={<Download size={15} />} onClick={() => printSessionReport(session)}>
          Exportar PDF
        </Button>
      </div>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full flex items-center justify-center gap-1.5 text-rose-400/50 hover:text-rose-400 text-xs font-medium py-1 transition-colors"
      >
        <Trash2 size={11} />
        Deletar treino
      </button>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Deletar treino?"
        message="Esta ação não pode ser desfeita. O treino e todos os dados associados serão removidos permanentemente."
      />
    </div>
  );
}

function MetricTile({ icon, label, value, sub, subColor, alert }) {
  return (
    <div className={`rounded-2xl p-3 space-y-1 ${alert ? 'bg-rose-500/10 border border-rose-500/25' : 'bg-surface-2'}`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] text-white/40 font-medium">{label}</span>
      </div>
      <p className={`font-black text-base leading-tight ${alert ? 'text-rose-400' : ''}`}>{value}</p>
      {sub && <p className={`text-[10px] font-bold ${subColor ?? 'text-white/40'}`}>{sub}</p>}
    </div>
  );
}
