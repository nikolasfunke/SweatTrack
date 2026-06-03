const db = require('../config/database');

function calcSweatMetrics({ preWeight, postWeight, fluidIntakeMl, durationMin }) {
  if (!preWeight || !postWeight || !durationMin) return {};
  const weightLossKg = preWeight - postWeight;
  const fluidIntakeLiters = (fluidIntakeMl || 0) / 1000;
  const totalSweatLiters = weightLossKg + fluidIntakeLiters;
  const sweatRateLh = durationMin > 0 ? (totalSweatLiters / (durationMin / 60)) : 0;
  const hydricDeficitMl = Math.round(weightLossKg * 1000);
  return {
    sweatRateLh: parseFloat(sweatRateLh.toFixed(2)),
    hydricDeficitMl,
    totalFluidLoss: parseFloat(totalSweatLiters.toFixed(2)),
  };
}

exports.create = async (req, res) => {
  try {
    const { sessionType = 'training', ambientTemp, humidity } = req.body;
    const [result] = await db.query(
      'INSERT INTO sessions (user_id, session_type, intensity, status, ambient_temp, humidity) VALUES (?, ?, ?, "pre", ?, ?)',
      [req.userId, sessionType, null, ambientTemp || null, humidity || null]
    );
    res.status(201).json({ id: result.insertId, status: 'pre' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar sessão' });
  }
};

exports.list = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*,
        (SELECT SUM(amount_ml) FROM fluid_logs WHERE session_id = s.id) AS total_intake_ml
       FROM sessions s
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC
       LIMIT 50`,
      [req.targetUserId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar sessões' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*,
        (SELECT SUM(amount_ml) FROM fluid_logs WHERE session_id = s.id) AS total_intake_ml,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'amount_ml',amount_ml,'drink_type',drink_type,'logged_at',logged_at))
         FROM fluid_logs WHERE session_id = s.id) AS fluid_logs
       FROM sessions s WHERE s.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Sessão não encontrada' });

    const session = rows[0];

    // Verificar se o usuário solicitante tem permissão para visualizar esta sessão
    if (session.user_id !== req.userId) {
      if (req.userRole === 'admin') {
        // Permitido
      } else if (req.userRole === 'coach') {
        const [accessRows] = await db.query(
          `SELECT 1 FROM team_members tm
           JOIN teams t ON tm.team_id = t.id
           WHERE t.coach_id = ? AND tm.athlete_id = ? AND tm.status = 'accepted'
           LIMIT 1`,
          [req.userId, session.user_id]
        );
        if (accessRows.length === 0) {
          return res.status(403).json({ error: 'Acesso negado: você não tem permissão para ver esta sessão' });
        }
      } else {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar sessão' });
  }
};

exports.updatePre = async (req, res) => {
  try {
    const { preWeightKg, urineColor, thirstLevel } = req.body;
    await db.query(
      'UPDATE sessions SET pre_weight_kg = ?, urine_color = ?, thirst_level = ? WHERE id = ? AND user_id = ?',
      [preWeightKg, urineColor, thirstLevel, req.params.id, req.userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar pré-sessão' });
  }
};

exports.start = async (req, res) => {
  try {
    await db.query(
      'UPDATE sessions SET status = "active", started_at = NOW() WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    res.json({ success: true, startedAt: new Date() });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao iniciar sessão' });
  }
};

exports.logFluid = async (req, res) => {
  try {
    const { amountMl, drinkType = 'water' } = req.body;
    if (!amountMl || amountMl <= 0)
      return res.status(400).json({ error: 'Volume inválido' });
    const [result] = await db.query(
      'INSERT INTO fluid_logs (session_id, amount_ml, drink_type) VALUES (?, ?, ?)',
      [req.params.id, amountMl, drinkType]
    );

    await db.query(
      'UPDATE sessions SET total_fluid_intake_ml = total_fluid_intake_ml + ? WHERE id = ?',
      [amountMl, req.params.id]
    );
    res.status(201).json({ id: result.insertId, amountMl, drinkType });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar ingestão' });
  }
};

exports.updateTemp = async (req, res) => {
  try {
    const { internalTemp } = req.body;
    await db.query(
      'UPDATE sessions SET internal_temp = ? WHERE id = ? AND user_id = ?',
      [internalTemp, req.params.id, req.userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar temperatura' });
  }
};

exports.finish = async (req, res) => {
  try {
    const { postWeightKg, durationMinutes, internalTemp, ambientTemp, intensity, symptoms } = req.body;
    const normalizedPostWeight = postWeightKg === null || postWeightKg === undefined || postWeightKg === ''
      ? null
      : parseFloat(postWeightKg);
    const [sess] = await db.query(
      'SELECT pre_weight_kg, total_fluid_intake_ml FROM sessions WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!sess.length) return res.status(404).json({ error: 'Sessão não encontrada' });

    const s = sess[0];
    const metrics = calcSweatMetrics({
      preWeight: s.pre_weight_kg,
      postWeight: normalizedPostWeight,
      fluidIntakeMl: s.total_fluid_intake_ml,
      durationMin: durationMinutes,
    });

    await db.query(
      `UPDATE sessions SET status = "completed", ended_at = NOW(),
       post_weight_kg = ?, duration_minutes = ?,
       sweat_rate_lh = ?, hydric_deficit_ml = ?,
       internal_temp = COALESCE(?, internal_temp),
       ambient_temp = COALESCE(?, ambient_temp),
       intensity = COALESCE(?, intensity),
       symptoms = ?
       WHERE id = ? AND user_id = ?`,
      [
        normalizedPostWeight, durationMinutes,
        metrics.sweatRateLh ?? null, metrics.hydricDeficitMl ?? null,
        internalTemp || null, ambientTemp || null,
        intensity || null,
        symptoms ? JSON.stringify(symptoms) : null,
        req.params.id, req.userId,
      ]
    );

    res.json({ success: true, metrics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao finalizar sessão' });
  }
};

exports.delete = async (req, res) => {
  try {
    await db.query('DELETE FROM sessions WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar sessão' });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { topic } = req.body;
    const sessionId = req.params.id;

    const [rows] = await db.query('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!rows.length) return res.status(404).json({ error: 'Sessão não encontrada' });
    const session = rows[0];

    if (session.user_id !== req.userId && req.userRole !== 'admin' && req.userRole !== 'coach') {
       return res.status(403).json({ error: 'Acesso negado' });
    }

    const analysisObj = (typeof session.ai_analysis === 'string' ? JSON.parse(session.ai_analysis) : session.ai_analysis) || {};
    if (analysisObj[topic]) {
       return res.json({ analysis: analysisObj[topic] });
    }

    if (!process.env.GEMINI_API_KEY) {
       return res.status(500).json({ error: 'A chave de API GEMINI_API_KEY não está configurada no backend.' });
    }

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const dataStr = `
Duração: ${session.duration_minutes || 0} min
Intensidade: ${session.intensity || 'não informada'}
Taxa de Sudorese: ${session.sweat_rate_lh || 0} L/h
Déficit Hídrico: ${session.hydric_deficit_ml || 0} ml
Sintomas: ${session.symptoms ? (Array.isArray(session.symptoms) ? session.symptoms.join(', ') : session.symptoms) : 'Nenhum'}
Clima: ${session.ambient_temp ? session.ambient_temp + '°C' : 'não informado'}
`;

    let systemInstruction = "Você é um assistente especialista em ciência do esporte, fisiologia e hidratação. Baseie-se ESTRITAMENTE nos dados numéricos fornecidos. Seja direto, conciso, e forneça análises úteis para o atleta. Nunca invente dados. Nunca faça diagnósticos clínicos, apenas dê orientações de desempenho. Formate a resposta em Markdown limpo.";
    let topicName = topic === 'recovery' ? 'Tempo estimado de recuperação e protocolo' : topic === 'improvements' ? 'O que o atleta pode melhorar' : 'Visão geral do treino';
    let promptMsg = `Analise os seguintes dados do treino focando especificamente em '${topicName}':\n${dataStr}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptMsg,
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });

    const generatedText = response.text;

    analysisObj[topic] = generatedText;
    await db.query('UPDATE sessions SET ai_analysis = ? WHERE id = ?', [JSON.stringify(analysisObj), sessionId]);

    res.json({ analysis: generatedText });
  } catch (err) {
    console.error('AI Analysis Error:', err);
    res.status(500).json({ error: 'Erro ao gerar análise por IA' });
  }
};
