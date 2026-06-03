import { useState, useEffect } from 'react';
import {
  Activity, Clock, Droplets, TrendingDown, Scale, Download, Trash2, AlertTriangle, Sparkles, Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Modal, { ConfirmModal } from '../ui/Modal';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';
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

function SessionDetailContent({ session: initialSession, onClose, onDeleted }) {
  const [localSession, setLocalSession] = useState(initialSession);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [aiTopic, setAiTopic] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!localSession || aiTopic) return;
    const analysisObj = (typeof localSession.ai_analysis === 'string' ? JSON.parse(localSession.ai_analysis) : localSession.ai_analysis) || {};
    if (analysisObj['overview']) setAiTopic('overview');
    else if (analysisObj['recovery']) setAiTopic('recovery');
    else if (analysisObj['improvements']) setAiTopic('improvements');
  }, [localSession, aiTopic]);

  const sweatLabel = getSweatRateLabel(localSession.sweat_rate_lh);
  const deficitMl = Math.abs(localSession.hydric_deficit_ml ?? 0);
  const recoveryMl = deficitMl > 0 ? calcRecoveryFluid(deficitMl) : null;
  const intColor = INTENSITY_COLOR[localSession.intensity] ?? '#C41E3A';

  // Weight variation in percentage
  const hasWeightVariation = localSession.pre_weight_kg && localSession.post_weight_kg;
  const weightLossKg = hasWeightVariation ? localSession.pre_weight_kg - localSession.post_weight_kg : 0;
  const weightLossPct = hasWeightVariation ? (weightLossKg / localSession.pre_weight_kg) * 100 : 0;
  const isWeightAlert = weightLossPct > 2;

  const sessionDate = localSession.ended_at
    ? new Date(localSession.ended_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : relativeDate(localSession.created_at);

  async function handleDelete() {
    setDeleting(true);
    try {
      await sessionApi.delete(localSession.id);
      setShowConfirm(false);
      onClose();
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  }

  async function handleAnalyze(topic) {
    setAiTopic(topic);
    const analysisObj = (typeof localSession.ai_analysis === 'string' ? JSON.parse(localSession.ai_analysis) : localSession.ai_analysis) || {};
    if (analysisObj[topic]) {
      return; // Already generated
    }
    setAiLoading(true);
    try {
      const res = await sessionApi.analyze(localSession.id, topic);
      setLocalSession(prev => {
        const prevAnalysis = (typeof prev.ai_analysis === 'string' ? JSON.parse(prev.ai_analysis) : prev.ai_analysis) || {};
        return { ...prev, ai_analysis: { ...prevAnalysis, [topic]: res.data.analysis } };
      });
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao gerar análise por IA', 'error');
    } finally {
      setAiLoading(false);
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
              {SESSION_TYPE_LABEL[localSession.session_type] ?? 'Sessão'}
            </h3>
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: `${intColor}20`, color: intColor }}
            >
              {INTENSITY_LABELS[localSession.intensity] ?? localSession.intensity}
            </span>
          </div>
          <p className="text-xs text-white/40 mt-0.5">{sessionDate}</p>
          {localSession.duration_minutes && (
            <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1">
              <Clock size={11} /> {formatDuration(localSession.duration_minutes)}
            </p>
          )}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <MetricTile
          icon={<Droplets size={14} className="text-sky-400" />}
          label="Taxa de Suor"
          value={localSession.sweat_rate_lh ? `${localSession.sweat_rate_lh} L/h` : '—'}
          sub={localSession.sweat_rate_lh ? sweatLabel.label : undefined}
          subColor={sweatLabel.color}
        />
        <MetricTile
          icon={<TrendingDown size={14} className="text-rose-400" />}
          label="Déficit Hídrico"
          value={localSession.hydric_deficit_ml ? `${(deficitMl / 1000).toFixed(2)} L` : '—'}
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
      {localSession.ambient_temp && (
        <div className="bg-surface-2 rounded-2xl p-3 flex items-center gap-3">
          <Scale size={14} className="text-sky-400 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-white/30">Temperatura Ambiente (no momento)</p>
            <p className="font-bold text-sm">{localSession.ambient_temp}°C</p>
          </div>
        </div>
      )}

      {/* Pre / post weight */}
      {(localSession.pre_weight_kg || localSession.post_weight_kg) && (
        <div className="bg-surface-2 rounded-2xl p-3 flex items-center gap-4">
          <Scale size={15} className="text-white/30 flex-shrink-0" />
          <div className="flex gap-6">
            {localSession.pre_weight_kg && (
              <div>
                <p className="text-[10px] text-white/30">Pré-treino</p>
                <p className="font-bold text-sm">{localSession.pre_weight_kg} kg</p>
              </div>
            )}
            {localSession.post_weight_kg && (
              <div>
                <p className="text-[10px] text-white/30">Pós-treino</p>
                <p className="font-bold text-sm">{localSession.post_weight_kg} kg</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Symptoms */}
      {localSession.symptoms && Array.isArray(localSession.symptoms) && localSession.symptoms.length > 0 && (
        <div className="bg-surface-2 rounded-2xl p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-rose-400" />
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Sintomas Registrados</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {localSession.symptoms.map((sym) => (
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

      {/* AI Analysis Section */}
      <div className="rounded-[22px] border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-surface-1 p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <p className="text-sm font-black text-primary uppercase tracking-widest">Análise Assistida por IA</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'recovery', label: 'Recuperação' },
            { id: 'improvements', label: 'Melhorias' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => handleAnalyze(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                aiTopic === t.id
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'bg-surface-2 text-white/50 hover:text-white/80 border border-border'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {aiTopic && (
          <div className="bg-black/20 rounded-xl p-4 min-h-[100px]">
            {aiLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-white/40">
                <Loader2 size={20} className="animate-spin text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Gerando insights...</span>
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none text-white/80">
                <ReactMarkdown>
                  {((typeof localSession.ai_analysis === 'string' ? JSON.parse(localSession.ai_analysis) : localSession.ai_analysis) || {})[aiTopic] || ''}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
        
        <p className="mt-4 text-[9px] text-white/30 uppercase tracking-widest text-center leading-relaxed">
          ⚠️ Gerado por Inteligência Artificial a partir de dados brutos. Pode conter imprecisões. Consulte um especialista.
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        <Button variant="primary" icon={<Download size={15} />} onClick={() => printSessionReport(localSession)}>
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
