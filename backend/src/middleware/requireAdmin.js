const db = require('../config/database');

module.exports = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT is_admin FROM users WHERE id = ?', [req.userId]);
    if (!rows.length || !rows[0].is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
