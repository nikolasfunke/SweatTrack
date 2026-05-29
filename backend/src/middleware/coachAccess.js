const db = require('../config/database');

module.exports = async (req, res, next) => {
  const targetIdStr = req.query.userId || req.body.userId;
  
  if (!targetIdStr) {
    req.targetUserId = req.userId;
    return next();
  }

  const targetUserId = parseInt(targetIdStr, 10);
  if (isNaN(targetUserId)) {
    return res.status(400).json({ error: 'ID de atleta inválido' });
  }

  // Se o usuário está buscando seus próprios dados, permite
  if (targetUserId === req.userId) {
    req.targetUserId = req.userId;
    return next();
  }

  try {
    // Admins têm acesso irrestrito
    if (req.userRole === 'admin') {
      req.targetUserId = targetUserId;
      return next();
    }

    // Treinadores têm acesso aos atletas pertencentes às suas equipes (status aceito)
    if (req.userRole === 'coach') {
      const [rows] = await db.query(
        `SELECT 1 FROM team_members tm
         JOIN teams t ON tm.team_id = t.id
         WHERE t.coach_id = ? AND tm.athlete_id = ? AND tm.status = 'accepted'
         LIMIT 1`,
        [req.userId, targetUserId]
      );

      if (rows.length > 0) {
        req.targetUserId = targetUserId;
        return next();
      }
    }

    return res.status(403).json({
      error: 'Acesso negado: você não tem permissão para visualizar os dados deste atleta.'
    });
  } catch (err) {
    console.error('[coachAccessMiddleware]', err);
    res.status(500).json({ error: 'Erro interno do servidor ao validar permissões' });
  }
};
