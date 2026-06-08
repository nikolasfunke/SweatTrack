/* Opens a styled print window that the user can save as PDF via the browser dialog. */
const RED = '#C41E3A';
const DARK = '#111111';
const base = `
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Helvetica Neue',Arial,sans-serif;background:#fff;color:#111;padding:32px;max-width:720px;margin:0 auto;font-size:13px}
    .logo{display:flex;align-items:center;gap:10px;margin-bottom:24px}
    .logo img{height:36px}
    .logo-text{font-size:22px;font-weight:900;color:${RED}}
    .divider{border:none;border-top:2px solid ${RED};margin:16px 0}
    .tag{display:inline-block;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
    h1{font-size:22px;font-weight:900;margin-bottom:4px;color:${DARK}}
    .meta{font-size:11px;color:#666;margin-bottom:20px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
    .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px}
    .card{border:1.5px solid #e5e5e5;border-radius:12px;padding:14px}
    .card .label{font-size:10px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
    .card .value{font-size:20px;font-weight:900;color:${DARK};line-height:1}
    .card .sub{font-size:10px;margin-top:4px;font-weight:700}
    .card.highlight{border-color:${RED};background:#fff5f7}
    .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#888;margin:20px 0 10px}
    .step{display:flex;gap:12px;padding:12px;border:1.5px solid #e5e5e5;border-radius:12px;margin-bottom:8px;align-items:flex-start}
    .step-num{width:24px;height:24px;background:${RED};color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;flex-shrink:0;margin-top:1px}
    .step-body .title{font-weight:700;font-size:13px;margin-bottom:3px}
    .step-body .desc{font-size:12px;color:#555;line-height:1.5}
    .recovery-box{background:#fff5f7;border:1.5px solid ${RED};border-radius:12px;padding:16px;margin-top:16px}
    .recovery-box .kicker{font-size:10px;font-weight:900;color:${RED};text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px}
    .recovery-box .headline{font-size:16px;font-weight:900}
    .recovery-box .note{font-size:11px;color:#666;margin-top:4px}
    .footer{margin-top:32px;padding-top:12px;border-top:1px solid #e5e5e5;text-align:center;font-size:10px;color:#aaa}
    .alert{color:#C41E3A} .warn{color:#d97706} .ok{color:#059669}
    .ai-section{margin-top:24px;page-break-inside:avoid}
    .ai-section .section-header{display:flex;align-items:center;gap:8px;margin-bottom:16px}
    .ai-section .section-header .sparkle{font-size:16px}
    .ai-section .section-header .title{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:${RED}}
    .ai-topic{border:1.5px solid #e5e5e5;border-radius:12px;padding:16px;margin-bottom:12px;page-break-inside:avoid}
    .ai-topic .topic-header{display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #f0f0f0}
    .ai-topic .topic-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
    .ai-topic .topic-name{font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:${DARK}}
    .ai-topic .topic-content{font-size:12px;color:#333;line-height:1.7}
    .ai-topic .topic-content h1,.ai-topic .topic-content h2,.ai-topic .topic-content h3{font-size:13px;font-weight:800;color:${DARK};margin:12px 0 6px}
    .ai-topic .topic-content p{margin:6px 0}
    .ai-topic .topic-content ul,.ai-topic .topic-content ol{margin:6px 0;padding-left:20px}
    .ai-topic .topic-content li{margin:3px 0}
    .ai-topic .topic-content strong{font-weight:800;color:${DARK}}
    .ai-topic .topic-content em{font-style:italic;color:#555}
    .ai-disclaimer{text-align:center;font-size:9px;color:#aaa;margin-top:12px;padding:8px;border:1px dashed #ddd;border-radius:8px}
    @media print{body{padding:20px}button{display:none!important}}
  </style>
`;
function logoHtml() {
  return `<div class="logo">
    <img src="${window.location.origin}/logo.png" onerror="this.style.display='none'"/>
    <span class="logo-text">Sweat-Track</span>
  </div>`;
}
function intensityColor(v) {
  return { baixa: '#059669', moderada: '#d97706', alta: '#C41E3A', variada: '#7c3aed' }[v] ?? RED;
}

/* Lightweight markdown → HTML (handles headers, bold, italic, lists, paragraphs) */
function markdownToHtml(md) {
  if (!md) return '';
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>');
  // Wrap remaining loose text lines in <p>
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (/^<(h[1-3]|ul|ol|li|p)/.test(trimmed)) return trimmed;
    return `<p>${trimmed}</p>`;
  }).join('\n');
  return html;
}

/* Builds the AI analysis HTML block for the PDF */
function aiSectionHtml(aiAnalysis) {
  const analysis = typeof aiAnalysis === 'string' ? JSON.parse(aiAnalysis) : aiAnalysis;
  if (!analysis) return '';

  const topics = [
    { id: 'overview',     label: 'Visão Geral',  icon: '📊', bg: '#EFF6FF', border: '#BFDBFE', iconBg: '#DBEAFE' },
    { id: 'recovery',     label: 'Recuperação',   icon: '💧', bg: '#F0FDF4', border: '#BBF7D0', iconBg: '#DCFCE7' },
    { id: 'improvements', label: 'Melhorias',     icon: '🎯', bg: '#FFF7ED', border: '#FED7AA', iconBg: '#FFEDD5' },
  ];

  const rendered = topics
    .filter(t => analysis[t.id])
    .map(t => `
      <div class="ai-topic" style="border-color:${t.border};background:${t.bg}">
        <div class="topic-header" style="border-bottom-color:${t.border}">
          <div class="topic-icon" style="background:${t.iconBg}">${t.icon}</div>
          <div class="topic-name">${t.label}</div>
        </div>
        <div class="topic-content">${markdownToHtml(analysis[t.id])}</div>
      </div>
    `).join('');

  if (!rendered) return '';

  return `
    <div class="ai-section">
      <hr class="divider"/>
      <div class="section-header">
        <span class="sparkle">✨</span>
        <span class="title">Análise Assistida por IA</span>
      </div>
      ${rendered}
      <div class="ai-disclaimer">⚠️ Conteúdo gerado por Inteligência Artificial a partir de dados brutos. Pode conter imprecisões. Consulte um profissional de saúde.</div>
    </div>
  `;
}

export function printSessionReport(session) {
  const deficitMl = Math.abs(session.hydric_deficit_ml ?? 0);
  const sweat     = parseFloat(session.sweat_rate_lh ?? 0);
  const duration  = session.duration_minutes ?? 0;
  const intensity = session.intensity ?? 'moderada';
  const typeLabel = { training: 'Treino', match: 'Jogo', recovery: 'Recuperação' }[session.session_type] ?? 'Sessão';
  const recoveryMl = deficitMl > 0 ? Math.round(deficitMl * 1.5) : null;
  const recoveryH  = deficitMl > 0 ? Math.max(8, Math.round(deficitMl / 200)) : 8;
  // Weight variation in percentage
  const hasWeightVariation = session.pre_weight_kg && session.post_weight_kg;
  const weightLossKg = hasWeightVariation ? session.pre_weight_kg - session.post_weight_kg : 0;
  const weightLossPct = hasWeightVariation ? (weightLossKg / session.pre_weight_kg) * 100 : 0;
  const isWeightAlert = weightLossPct > 2;
  const dateStr = session.ended_at 
    ? new Date(session.ended_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date(session.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const intColor = intensityColor(intensity);
  const sweatClass = sweat >= 1.5 ? 'alert' : sweat >= 0.8 ? 'warn' : 'ok';
  const html = `<!DOCTYPE html><html lang="pt-BR"><head>${base}<title>Relatório de Sessão — ${dateStr}</title></head><body>
    ${logoHtml()}
    <hr class="divider"/>
    <span class="tag" style="background:${intColor}20;color:${intColor}">${intensity.toUpperCase()}</span>
    <h1>Relatório Pós-Sessão<br/>${typeLabel}</h1>
    <p class="meta">${dateStr} · ${duration > 0 ? (Math.floor(duration/60) > 0 ? Math.floor(duration/60)+'h ' : '') + (duration%60 > 0 ? duration%60+'min' : '') : '—'} · SweatTrack Clinical Intelligence</p>
    <div class="section-title">Métricas Fisiológicas</div>
    <div class="grid">
      <div class="card highlight">
        <div class="label">Taxa de Sudorese</div>
        <div class="value ${sweatClass}">${sweat > 0 ? sweat.toFixed(2)+' L/h' : '—'}</div>
        <div class="sub ${sweatClass}">${sweat >= 1.5 ? 'Muito Alta' : sweat >= 1.0 ? 'Alta' : sweat >= 0.5 ? 'Moderada' : sweat > 0 ? 'Baixa' : ''}</div>
      </div>
      <div class="card">
        <div class="label">Déficit Hídrico</div>
        <div class="value ${deficitMl > 2000 ? 'alert' : 'ok'}">${deficitMl > 0 ? (deficitMl/1000).toFixed(2)+' L' : '—'}</div>
        <div class="sub ${deficitMl > 2000 ? 'alert' : 'ok'}">${deficitMl > 2000 ? 'Elevado' : deficitMl > 0 ? 'Aceitável' : ''}</div>
      </div>
    </div>
    ${hasWeightVariation ? `
    <div class="section-title">Variação de Peso Corporal</div>
    <div class="grid-3">
      <div class="card"><div class="label">Pré-Treino</div><div class="value">${session.pre_weight_kg ?? '—'} kg</div></div>
      <div class="card"><div class="label">Pós-Treino</div><div class="value">${session.post_weight_kg ?? '—'} kg</div></div>
      <div class="card ${isWeightAlert ? 'highlight' : ''}"><div class="label">Variação</div><div class="value ${isWeightAlert ? 'alert' : 'ok'}">-${weightLossPct.toFixed(1)}%</div><div class="sub">${weightLossKg.toFixed(2)} kg</div></div>
    </div>
    ${isWeightAlert ? `
    <div class="recovery-box" style="border-color:#C41E3A;background:#fff5f7;margin-top:8px;margin-bottom:16px">
      <div class="kicker">⚠ Alerta de Desidratação</div>
      <div class="headline" style="font-size:14px">Perda de ${weightLossPct.toFixed(1)}% da massa corporal</div>
      <div class="note">A perda excedeu 2% do peso inicial, indicando desidratação significativa. Reforçar a reposição hídrica imediatamente.</div>
    </div>` : ''}` : (session.pre_weight_kg || session.post_weight_kg) ? `
    <div class="section-title">Variação de Peso Corporal</div>
    <div class="grid">
      <div class="card"><div class="label">Pré-Treino</div><div class="value">${session.pre_weight_kg ?? '—'} kg</div></div>
      <div class="card"><div class="label">Pós-Treino</div><div class="value">${session.post_weight_kg ?? '—'} kg</div></div>
    </div>` : ''}
    ${session.symptoms && Array.isArray(session.symptoms) && session.symptoms.length > 0 ? `
    <div class="section-title">Sintomas Registrados</div>
    <div class="grid">
      <div class="card" style="grid-column: span 2;">
        <div class="value ok" style="font-size:14px; color:#C41E3A">${session.symptoms.join(', ')}</div>
      </div>
    </div>` : ''}
    <div class="section-title">Protocolo de Recuperação</div>
    <div class="step"><div class="step-num">1</div><div class="step-body"><div class="title">Reidratação Imediata</div><div class="desc">${recoveryMl ? `Consumir ${recoveryMl}ml de fluidos nas próximas 4 horas (150% da perda de ${(deficitMl/1000).toFixed(2)}L).` : 'Manter hidratação regular pós-sessão com 500–800ml de fluidos.'}</div></div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><div class="title">Reposição de Eletrólitos</div><div class="desc">Alimentação normal de reposição de eletrólitos é suficiente. Para exercícios acima de 60 minutos, considere bebidas isotônicas.</div></div></div>
    <div class="step"><div class="step-num">3</div><div class="step-body"><div class="title">Monitoramento de Urina</div><div class="desc">Acompanhe a coloração da urina até atingir o tom amarelo-claro (Padrão 1–2 na escala de WUTS).</div></div></div>
    <div class="recovery-box">
      <div class="kicker">Análise Biopsicossocial</div>
      <div class="headline">Recuperação estimada: ${recoveryH} horas</div>
      <div class="note">Baseado no déficit hídrico (${(deficitMl/1000).toFixed(2)}L) e intensidade ${intensity} da sessão.</div>
    </div>
    ${session.ai_analysis ? aiSectionHtml(session.ai_analysis) : ''}
    <div class="footer">Gerado pelo SweatTrack Clinical Intelligence · ${new Date().toLocaleDateString('pt-BR')} · Documento clínico confidencial</div>
    <script>window.onload=()=>{setTimeout(()=>window.print(),400)}<\/script>
  </body></html>`;
  const w = window.open('', '_blank', 'width=800,height=900');
  w.document.write(html);
  w.document.close();
}
export function printAnalyticsReport({ dashboard, history, trend, userName, periodLabel }) {
  const stats       = dashboard?.stats ?? {};
  const totalSessions = dashboard?.totalSessions ?? 0;
  const lastSession = dashboard?.lastSession ?? null;
  const monthly     = history?.monthly ?? [];
  const byIntensity = history?.byIntensity ?? [];
  const INTENSITY_LABEL = { baixa:'Baixa', moderada:'Moderada', alta:'Alta', variada:'Variada' };
  const html = `<!DOCTYPE html><html lang="pt-BR"><head>${base}<title>Relatório Analítico — SweatTrack</title></head><body>
    ${logoHtml()}
    <hr class="divider"/>
    <span class="tag" style="background:${RED}20;color:${RED}">Relatório Analítico</span>
    <h1>Análise de Desempenho</h1>
    <p class="meta">${userName ? userName+' · ' : ''}${periodLabel ? 'Período: '+periodLabel+' · ' : ''}Gerado em ${new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })} · SweatTrack Clinical Intelligence</p>
    <div class="section-title">Sumário Geral</div>
    <div class="grid">
      <div class="card highlight">
        <div class="label">Total de Sessões</div>
        <div class="value">${totalSessions}</div>
      </div>
      <div class="card">
        <div class="label">Taxa de Suor Média</div>
        <div class="value">${stats.avg_sweat_rate ? parseFloat(stats.avg_sweat_rate).toFixed(2)+' L/h' : '—'}</div>
      </div>
      <div class="card">
        <div class="label">Duração Média</div>
        <div class="value">${stats.avg_duration ? Math.round(stats.avg_duration)+' min' : '—'}</div>
      </div>
      <div class="card">
        <div class="label">Var. de Peso Méd.</div>
        <div class="value alert">-${stats.avg_weight_loss_pct ? parseFloat(stats.avg_weight_loss_pct).toFixed(1)+'%' : '—'}</div>
      </div>
    </div>
    ${byIntensity.length > 0 ? `
    <div class="section-title">Distribuição por Intensidade</div>
    <div class="grid">
      ${byIntensity.map(r => `
        <div class="card">
          <div class="label" style="color:${intensityColor(r.intensity)}">${INTENSITY_LABEL[r.intensity] ?? r.intensity}</div>
          <div class="value">${r.count} sessões</div>
          <div class="sub">Suor médio: ${r.avg_sweat ? parseFloat(r.avg_sweat).toFixed(2)+' L/h' : '—'}</div>
        </div>`).join('')}
    </div>` : ''}
    ${monthly.length > 0 ? `
    <div class="section-title">Histórico Mensal</div>
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr style="background:#f5f5f5">
        <th style="padding:8px 12px;text-align:left;border-radius:8px 0 0 8px">Mês</th>
        <th style="padding:8px 12px;text-align:center">Sessões</th>
        <th style="padding:8px 12px;text-align:center">Suor Médio</th>
        <th style="padding:8px 12px;text-align:center;border-radius:0 8px 8px 0">Total</th>
      </tr></thead>
      <tbody>
        ${monthly.map((r,i) => `
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:8px 12px;font-weight:700">${r.month ?? r.month_key}</td>
            <td style="padding:8px 12px;text-align:center">${r.sessions}</td>
            <td style="padding:8px 12px;text-align:center">${r.avg_sweat ? parseFloat(r.avg_sweat).toFixed(2)+' L/h' : '—'}</td>
            <td style="padding:8px 12px;text-align:center">${r.total_minutes ? Math.floor(r.total_minutes/60)+'h '+(r.total_minutes%60)+'min' : '—'}</td>
          </tr>`).join('')}
      </tbody>
    </table>` : ''}
    ${lastSession ? `
    <div class="section-title">Última Sessão Registrada</div>
    <div class="grid">
      <div class="card highlight">
        <div class="label">Taxa de Sudorese</div>
        <div class="value alert">${lastSession.sweat_rate_lh ? lastSession.sweat_rate_lh+' L/h' : '—'}</div>
      </div>
      <div class="card">
        <div class="label">Déficit Hídrico</div>
        <div class="value">${lastSession.hydric_deficit_ml ? (Math.abs(lastSession.hydric_deficit_ml)/1000).toFixed(2)+' L' : '—'}</div>
      </div>
    </div>` : ''}
    <div class="footer">Gerado pelo SweatTrack Clinical Intelligence · ${new Date().toLocaleDateString('pt-BR')} · Documento clínico confidencial</div>
    <script>window.onload=()=>{setTimeout(()=>window.print(),400)}<\/script>
  </body></html>`;
  const w = window.open('', '_blank', 'width=800,height=900');
  w.document.write(html);
  w.document.close();
}
export function printTeamReport(teamData) {
  const { name, description, coach_name, coach_email, members, period } = teamData;

  const periodLabels = {
    all: 'Todo o histórico',
    month: 'Últimos 30 dias',
    week: 'Últimos 7 dias',
    day: 'Últimas 24 horas'
  };
  const selectedPeriodLabel = periodLabels[period] || 'Todo o histórico';
  
  // Calculate team-wide summary metrics from members
  const validSweatRates = members.filter(m => m.avg_sweat_rate !== null).map(m => parseFloat(m.avg_sweat_rate));
  const avgSweatRate = validSweatRates.length > 0
    ? (validSweatRates.reduce((a, b) => a + b, 0) / validSweatRates.length).toFixed(2)
    : null;
  const validWeightLoss = members.filter(m => m.avg_weight_loss_pct !== null).map(m => parseFloat(m.avg_weight_loss_pct));
  const avgWeightLoss = validWeightLoss.length > 0
    ? (validWeightLoss.reduce((a, b) => a + b, 0) / validWeightLoss.length).toFixed(1)
    : null;
  const totalCompletedSessions = members.reduce((sum, m) => sum + (m.total_sessions || 0), 0);
  const html = `<!DOCTYPE html><html lang="pt-BR"><head>${base}<title>Relatório de Equipe — ${name}</title></head><body>
    <div class="logo">
      <img src="${window.location.origin}/Full-Logo.svg" onerror="this.style.display='none'" style="height: 36px;"/>
    </div>
    <hr class="divider"/>
    <span class="tag" style="background:${RED}20;color:${RED}">Relatório Desempenho Coletivo</span>
    <h1>Relatório de Equipe: ${name}</h1>
    <p class="meta">Treinador: ${coach_name} (${coach_email}) · Período: ${selectedPeriodLabel} · Gerado em ${new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })} · SweatTrack Clinical Intelligence</p>
    ${description ? `<div class="recovery-box" style="margin-top:0;margin-bottom:20px;background:#f9f9f9;border-color:#e5e5e5;padding:12px 16px;">
      <div class="kicker" style="color:#666">Descrição da Equipe</div>
      <div style="font-size:12px;color:#444;line-height:1.4">${description}</div>
    </div>` : ''}
    <div class="section-title">Estatísticas Gerais da Equipe</div>
    <div class="grid">
      <div class="card highlight">
        <div class="label">Taxa de Sudorese Média</div>
        <div class="value alert">${avgSweatRate ? avgSweatRate + ' L/h' : '—'}</div>
        <div class="sub alert">Média dos atletas ativos</div>
      </div>
      <div class="card">
        <div class="label">Perda de Peso Média por Treino</div>
        <div class="value ${avgWeightLoss && parseFloat(avgWeightLoss) > 2 ? 'alert' : 'ok'}">${avgWeightLoss ? '-' + avgWeightLoss + '%' : '—'}</div>
        <div class="sub ${avgWeightLoss && parseFloat(avgWeightLoss) > 2 ? 'alert' : 'ok'}">${avgWeightLoss && parseFloat(avgWeightLoss) > 2 ? 'Risco de Desidratação Alto' : 'Risco Controlado'}</div>
      </div>
      <div class="card">
        <div class="label">Total de Atletas</div>
        <div class="value">${members.length}</div>
        <div class="sub">Vínculo confirmado</div>
      </div>
      <div class="card">
        <div class="label">Sessões Concluídas</div>
        <div class="value">${totalCompletedSessions}</div>
        <div class="sub">Dados acumulados</div>
      </div>
    </div>
    <div class="section-title">Desempenho Individual dos Atletas</div>
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:8px">
      <thead><tr style="background:#f5f5f5;border-bottom:2px solid #e5e5e5">
        <th style="padding:10px 8px;text-align:left;font-weight:bold;color:#444">Atleta</th>
        <th style="padding:10px 8px;text-align:left;font-weight:bold;color:#444">Esporte/Posição</th>
        <th style="padding:10px 8px;text-align:center;font-weight:bold;color:#444">Sessões</th>
        <th style="padding:10px 8px;text-align:center;font-weight:bold;color:#444">Suor Médio</th>
        <th style="padding:10px 8px;text-align:center;font-weight:bold;color:#444">Déficit Médio</th>
        <th style="padding:10px 8px;text-align:center;font-weight:bold;color:#444">Perda Peso</th>
        <th style="padding:10px 8px;text-align:right;font-weight:bold;color:#444">Último Treino</th>
      </tr></thead>
      <tbody>
        ${members.map((m, i) => {
          const sweat = m.avg_sweat_rate ? parseFloat(m.avg_sweat_rate).toFixed(2) + ' L/h' : '—';
          const deficit = m.avg_hydric_deficit ? (Math.abs(m.avg_hydric_deficit) / 1000).toFixed(2) + ' L' : '—';
          const weightLoss = m.avg_weight_loss_pct ? '-' + parseFloat(m.avg_weight_loss_pct).toFixed(1) + '%' : '—';
          const lastDate = m.last_session_at
            ? new Date(m.last_session_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            : '—';
          const lastSweat = m.last_sweat_rate ? parseFloat(m.last_sweat_rate).toFixed(2) + ' L/h' : '';
          const lastStr = lastDate !== '—' && lastSweat ? `${lastDate} (${lastSweat})` : lastDate;
          const isHighRisk = m.avg_weight_loss_pct && parseFloat(m.avg_weight_loss_pct) > 2;
          return `
            <tr style="border-bottom:1px solid #eee; background: ${isHighRisk ? '#fff5f7' : 'transparent'}">
              <td style="padding:10px 8px;text-align:left;vertical-align:middle">
                <div style="font-weight:bold;color:#111">${m.name}</div>
                <div style="font-size:9px;color:#666">${m.email}</div>
              </td>
              <td style="padding:10px 8px;text-align:left;vertical-align:middle;color:#444">
                ${m.sport || m.position ? `${m.sport || ''} ${m.position ? `(${m.position})` : ''}` : '—'}
              </td>
              <td style="padding:10px 8px;text-align:center;vertical-align:middle;color:#111">${m.total_sessions}</td>
              <td style="padding:10px 8px;text-align:center;vertical-align:middle;font-weight:bold;color:${m.avg_sweat_rate && parseFloat(m.avg_sweat_rate) >= 1.5 ? RED : '#111'}">${sweat}</td>
              <td style="padding:10px 8px;text-align:center;vertical-align:middle;color:#111">${deficit}</td>
              <td style="padding:10px 8px;text-align:center;vertical-align:middle;font-weight:bold;color:${isHighRisk ? RED : '#059669'}">${weightLoss}</td>
              <td style="padding:10px 8px;text-align:right;vertical-align:middle;color:#555">${lastStr}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
    <div class="footer">Gerado pelo SweatTrack Clinical Intelligence · ${new Date().toLocaleDateString('pt-BR')} · Documento clínico confidencial</div>
    <script>window.onload=()=>{setTimeout(()=>window.print(),400)}<\/script>
  </body></html>`;
  const w = window.open('', '_blank', 'width=800,height=900');
  w.document.write(html);
  w.document.close();
}