const db = require('../config/database');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    const [sessionsCount] = await db.query(
      'SELECT COUNT(*) AS total FROM sessions WHERE user_id = ? AND status = "completed"',
      [userId]
    );

    const [lastSession] = await db.query(
      `SELECT sweat_rate_lh, hydric_deficit_ml, sodium_loss_mg, internal_temp, duration_minutes, ended_at
       FROM sessions WHERE user_id = ? AND status = "completed" ORDER BY ended_at DESC LIMIT 1`,
      [userId]
    );

    const [weeklyData] = await db.query(
      `SELECT DAYOFWEEK(started_at) AS day_num,
              DAYNAME(started_at)   AS day_name,
              COUNT(*)              AS session_count,
              AVG(sweat_rate_lh)    AS avg_sweat_rate,
              SUM(duration_minutes) AS total_minutes
       FROM sessions
       WHERE user_id = ? AND status = "completed"
         AND started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DAYOFWEEK(started_at), DAYNAME(started_at)
       ORDER BY day_num`,
      [userId]
    );

    const [profile] = await db.query(
      'SELECT vo2max, weight_kg FROM athlete_profiles WHERE user_id = ?',
      [userId]
    );

    const [lastHydration] = await db.query(
      `SELECT urine_color FROM sessions
       WHERE user_id = ? AND urine_color IS NOT NULL
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    // Hydration index: 100 − (urineColor − 1) × 12, clamped [20, 100]
    const totalSessions = sessionsCount[0].total;
    const hydrationIndex = (totalSessions > 0 && lastHydration[0]?.urine_color)
      ? Math.max(20, Math.min(100, Math.round(100 - (lastHydration[0].urine_color - 1) * 12)))
      : null;

    // Aggregate stats for dashboard cards
    const [stats] = await db.query(
      `SELECT
         AVG(sweat_rate_lh)    AS avg_sweat_rate,
         MAX(sweat_rate_lh)    AS max_sweat_rate,
         AVG(duration_minutes) AS avg_duration,
         SUM(duration_minutes) AS total_minutes,
         AVG(hydric_deficit_ml) AS avg_deficit
       FROM sessions
       WHERE user_id = ? AND status = "completed"`,
      [userId]
    );

    res.json({
      totalSessions,
      lastSession: lastSession[0] || null,
      weeklyData,
      profile: profile[0] || {},
      hydrationIndex,
      stats: stats[0] || {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar analytics' });
  }
};

exports.getWeeklyReport = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE(started_at) AS session_date,
              intensity,
              AVG(sweat_rate_lh)    AS avg_sweat_rate,
              SUM(hydric_deficit_ml) AS total_deficit,
              SUM(duration_minutes)  AS total_minutes,
              COUNT(*)               AS sessions
       FROM sessions
       WHERE user_id = ? AND status = "completed"
         AND started_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(started_at), intensity
       ORDER BY session_date DESC`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar relatório semanal' });
  }
};

exports.getHydrationTrend = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE(ended_at)            AS date,
              AVG(sweat_rate_lh)        AS avg_sweat,
              AVG(hydric_deficit_ml)    AS avg_deficit,
              AVG(duration_minutes)     AS avg_duration,
              COUNT(*)                  AS sessions
       FROM sessions
       WHERE user_id = ? AND status = "completed"
         AND ended_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
       GROUP BY DATE(ended_at)
       ORDER BY date ASC`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tendência' });
  }
};

exports.getSessionsHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    // Last N completed sessions with full metrics
    const [sessions] = await db.query(
      `SELECT
         id,
         DATE_FORMAT(ended_at, '%d/%m') AS label,
         DATE(ended_at)                 AS date,
         duration_minutes,
         sweat_rate_lh,
         hydric_deficit_ml,
         sodium_loss_mg,
         intensity,
         session_type,
         internal_temp,
         pre_weight_kg,
         post_weight_kg
       FROM sessions
       WHERE user_id = ? AND status = "completed" AND ended_at IS NOT NULL
       ORDER BY ended_at DESC
       LIMIT ?`,
      [req.userId, limit]
    );

    // Distribution by intensity
    const [byIntensity] = await db.query(
      `SELECT
         intensity,
         COUNT(*)               AS count,
         AVG(sweat_rate_lh)     AS avg_sweat,
         AVG(duration_minutes)  AS avg_duration,
         AVG(hydric_deficit_ml) AS avg_deficit
       FROM sessions
       WHERE user_id = ? AND status = "completed"
       GROUP BY intensity`,
      [req.userId]
    );

    // Monthly aggregates (last 6 months) — group key kept in SELECT to satisfy ONLY_FULL_GROUP_BY
    const [monthly] = await db.query(
      `SELECT
         DATE_FORMAT(ended_at, '%Y-%m')         AS month_key,
         DATE_FORMAT(MIN(ended_at), '%b/%y')    AS month,
         COUNT(*)                               AS sessions,
         AVG(sweat_rate_lh)                     AS avg_sweat,
         SUM(duration_minutes)                  AS total_minutes,
         AVG(hydric_deficit_ml)                 AS avg_deficit
       FROM sessions
       WHERE user_id = ? AND status = "completed"
         AND ended_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(ended_at, '%Y-%m')
       ORDER BY month_key ASC`,
      [req.userId]
    );

    res.json({ sessions, byIntensity, monthly });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar histórico de sessões' });
  }
};
