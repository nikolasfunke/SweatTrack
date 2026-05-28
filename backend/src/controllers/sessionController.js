const db = require('../config/database');

// Calculate sweat rate and hydric deficit
function calcSweatMetrics({ preWeight, postWeight, fluidIntakeMl, durationMin }) {
  if (!preWeight || !postWeight || !durationMin) return {};
  const weightLossKg = preWeight - postWeight;
  const fluidIntakeLiters = (fluidIntakeMl || 0) / 1000;
  const totalSweatLiters = weightLossKg + fluidIntakeLiters;
  const sweatRateLh = durationMin > 0 ? (totalSweatLiters / (durationMin / 60)) : 0;
  const hydricDeficitMl = Math.round(weightLossKg * 1000);
  const sodiumLossMg = Math.round(totalSweatLiters * 1150); // ~50 mmol/L × 23 mg/mmol ≈ 1150 mg/L (ABNE 2025)
  return {
    sweatRateLh: parseFloat(sweatRateLh.toFixed(2)),
    hydricDeficitMl,
    sodiumLossMg,
    totalFluidLoss: parseFloat(totalSweatLiters.toFixed(2)),
  };
}

exports.create = async (req, res) => {
  try {
    const { sessionType = 'training', intensity = 'moderada', ambientTemp, humidity } = req.body;
    const [result] = await db.query(
      'INSERT INTO sessions (user_id, session_type, intensity, status, ambient_temp, humidity) VALUES (?, ?, ?, "pre", ?, ?)',
      [req.userId, sessionType, intensity, ambientTemp || null, humidity || null]
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
      [req.userId]
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
       FROM sessions s WHERE s.id = ? AND s.user_id = ?`,
      [req.params.id, req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Sessão não encontrada' });
    res.json(rows[0]);
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
    // Update session total
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
    const { postWeightKg, durationMinutes, internalTemp, ambientTemp } = req.body;
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
       sweat_rate_lh = ?, hydric_deficit_ml = ?, sodium_loss_mg = ?,
       internal_temp = COALESCE(?, internal_temp),
       ambient_temp = COALESCE(?, ambient_temp)
       WHERE id = ? AND user_id = ?`,
      [
        normalizedPostWeight, durationMinutes,
        metrics.sweatRateLh ?? null, metrics.hydricDeficitMl ?? null, metrics.sodiumLossMg ?? null,
        internalTemp || null, ambientTemp || null,
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
