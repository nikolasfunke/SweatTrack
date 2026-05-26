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

export function printSessionReport(session) {
  const deficitMl = Math.abs(session.hydric_deficit_ml ?? 0);
  const sodiumMg  = session.sodium_loss_mg ?? 0;
  const sweat     = parseFloat(session.sweat_rate_lh ?? 0);
  const duration  = session.duration_minutes ?? 0;
  const temp      = session.internal_temp;
  const intensity = session.intensity ?? 'moderada';
  const typeLabel = { training: 'Treino', match: 'Jogo', recovery: 'Recuperação' }[session.session_type] ?? 'Sessão';
  const recoveryMl = deficitMl > 0 ? Math.round(deficitMl * 1.5) : null;
  const recoveryH  = deficitMl > 0 ? Math.max(8, Math.round(deficitMl / 200)) : 8;

  const dateStr = session.ended_at
    ? new Date(session.ended_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date(session.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const intColor = intensityColor(intensity);
  const sweatClass = sweat >= 1.5 ? 'alert' : sweat >= 0.8 ? 'warn' : 'ok';
  const tempClass  = temp > 38.5 ? 'alert' : 'ok';

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
      <div class="card">
        <div class="label">Perda de Sódio</div>
        <div class="value">${sodiumMg > 0 ? sodiumMg+' mg' : '—'}</div>
        <div class="sub ${sodiumMg > 1500 ? 'warn' : 'ok'}">${sodiumMg > 1500 ? 'Reposição recomendada' : sodiumMg > 0 ? 'Nível aceitável' : ''}</div>
      </div>
      <div class="card">
        <div class="label">Temperatura Interna</div>
        <div class="value ${temp ? tempClass : ''}">${temp ? temp+'°C' : '—'}</div>
        <div class="sub ${temp ? tempClass : ''}">${temp > 38.5 ? 'ALERTA' : temp ? 'Normal' : ''}</div>
      </div>
    </div>

    ${(session.pre_weight_kg || session.post_weight_kg) ? `
    <div class="section-title">Variação de Peso Corporal</div>
    <div class="grid-3">
      <div class="card"><div class="label">Pré-Treino</div><div class="value">${session.pre_weight_kg ?? '—'} kg</div></div>
      <div class="card"><div class="label">Pós-Treino</div><div class="value">${session.post_weight_kg ?? '—'} kg</div></div>
      ${session.pre_weight_kg && session.post_weight_kg ? `<div class="card highlight"><div class="label">Variação</div><div class="value alert">-${(session.pre_weight_kg - session.post_weight_kg).toFixed(2)} kg</div></div>` : ''}
    </div>` : ''}

    <div class="section-title">Protocolo de Recuperação</div>
    <div class="step"><div class="step-num">1</div><div class="step-body"><div class="title">Reidratação Imediata</div><div class="desc">${recoveryMl ? `Consumir ${recoveryMl}ml de fluidos nas próximas 4 horas (150% da perda de ${(deficitMl/1000).toFixed(2)}L).` : 'Manter hidratação regular pós-sessão com 500–800ml de fluidos.'}</div></div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><div class="title">Reposição de Eletrólitos</div><div class="desc">${sodiumMg > 1500 ? `Perda estimada de ${sodiumMg}mg de sódio. Sachê eletrolítico isotônico recomendado.` : 'Alimentação normal de reposição de eletrólitos é suficiente.'}</div></div></div>
    <div class="step"><div class="step-num">3</div><div class="step-body"><div class="title">Monitoramento de Urina</div><div class="desc">Acompanhe a coloração da urina até atingir o tom amarelo-claro (Padrão 1–2 na escala de WUTS).</div></div></div>

    <div class="recovery-box">
      <div class="kicker">Análise Biopsicossocial</div>
      <div class="headline">Recuperação estimada: ${recoveryH} horas</div>
      <div class="note">Baseado no déficit hídrico (${(deficitMl/1000).toFixed(2)}L) e intensidade ${intensity} da sessão.</div>
    </div>

    <div class="footer">Gerado pelo SweatTrack Clinical Intelligence · ${new Date().toLocaleDateString('pt-BR')} · Documento clínico confidencial</div>

    <script>window.onload=()=>{setTimeout(()=>window.print(),400)}<\/script>
  </body></html>`;

  const w = window.open('', '_blank', 'width=800,height=900');
  w.document.write(html);
  w.document.close();
}

export function printAnalyticsReport({ dashboard, history, trend, userName }) {
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
    <p class="meta">${userName ? userName+' · ' : ''}Gerado em ${new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })} · SweatTrack Clinical Intelligence</p>

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
        <div class="label">Taxa de Suor Máx.</div>
        <div class="value alert">${stats.max_sweat_rate ? parseFloat(stats.max_sweat_rate).toFixed(2)+' L/h' : '—'}</div>
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
