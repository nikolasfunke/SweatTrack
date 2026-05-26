export const URINE_COLORS = [
  { level: 1, label: 'Ótimo',        color: '#FFF9C4', textColor: '#666' },
  { level: 2, label: 'Ótimo',        color: '#FFF176', textColor: '#666' },
  { level: 3, label: 'Bom',          color: '#FFEE58', textColor: '#555' },
  { level: 4, label: 'Aceitável',    color: '#FFD600', textColor: '#444' },
  { level: 5, label: 'Atenção',      color: '#FFA000', textColor: '#fff' },
  { level: 6, label: 'Desidratado',  color: '#E65100', textColor: '#fff' },
  { level: 7, label: 'Grave',        color: '#BF360C', textColor: '#fff' },
  { level: 8, label: 'Crítico',      color: '#4E342E', textColor: '#fff' },
];

export const INTENSITY_LABELS = {
  baixa: 'BAIXA',
  moderada: 'MODERADA',
  alta: 'ALTA',
  variada: 'VARIADA',
};

export const INTENSITY_COLORS = {
  baixa: 'text-emerald-400 bg-emerald-400/10',
  moderada: 'text-amber-400 bg-amber-400/10',
  alta: 'text-rose-400 bg-rose-400/10',
  variada: 'text-violet-400 bg-violet-400/10',
};

export function calcSweatRate({ preWeight, postWeight, fluidMl, durationMin }) {
  if (!preWeight || !postWeight || !durationMin) return null;
  const weightLoss = preWeight - postWeight;
  const fluidL = (fluidMl || 0) / 1000;
  const totalSweat = weightLoss + fluidL;
  return parseFloat((totalSweat / (durationMin / 60)).toFixed(2));
}

export function calcHydricDeficit(preWeight, postWeight) {
  if (!preWeight || !postWeight) return null;
  return Math.round((preWeight - postWeight) * 1000);
}

export function formatDuration(minutes) {
  if (!minutes) return '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + 'min' : ''}` : `${m}min`;
}

export function formatTimer(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export function getHydrationStatus(index) {
  if (index >= 90) return { label: 'Ótimo', color: 'text-emerald-400' };
  if (index >= 75) return { label: 'Bom', color: 'text-lime-400' };
  if (index >= 60) return { label: 'Regular', color: 'text-amber-400' };
  if (index >= 40) return { label: 'Atenção', color: 'text-orange-400' };
  return { label: 'Crítico', color: 'text-rose-400' };
}

export function getSweatRateLabel(rate) {
  if (!rate) return { label: 'N/D', color: 'text-white/40' };
  if (rate < 0.5) return { label: 'Baixa', color: 'text-emerald-400' };
  if (rate < 1.0) return { label: 'Moderada', color: 'text-lime-400' };
  if (rate < 1.5) return { label: 'Alta', color: 'text-amber-400' };
  if (rate < 2.0) return { label: 'Muito Alta', color: 'text-orange-400' };
  return { label: 'Extrema', color: 'text-rose-400' };
}

export function calcRecoveryFluid(deficitMl) {
  return Math.round(deficitMl * 1.5);
}

export function relativeDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return 'Agora';
  if (diffH < 24) return `Hoje, às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffD === 1) return `Ontem, às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
