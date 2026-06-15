const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Middleware que garante que o usuário autenticado já verificou o e-mail.
 * Deve ser usado APÓS o middleware de autenticação (auth.js).
 */
module.exports = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT is_verified FROM users WHERE id = ?',
      [req.userId]
    );
    if (!rows.length) return res.status(401).json({ error: 'Usuário não encontrado' });
    if (!rows[0].is_verified) {
      return res.status(403).json({ error: 'E-mail não verificado', code: 'EMAIL_NOT_VERIFIED' });
    }
    next();
  } catch (err) {
    console.error('[verified middleware]', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
