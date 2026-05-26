const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const signToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const handleAuthError = (res, err, action) => {
  const dbUnavailableCodes = new Set([
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'PROTOCOL_CONNECTION_LOST',
  ]);

  const configCodes = new Set([
    'ER_ACCESS_DENIED_ERROR',
    'ER_BAD_DB_ERROR',
  ]);

  console.error(`[auth:${action}]`, err.code || 'UNKNOWN', err.message || err);

  if (dbUnavailableCodes.has(err.code)) {
    return res.status(503).json({
      error: 'Banco de dados indisponível. Verifique se o MySQL está ligado.',
    });
  }

  if (configCodes.has(err.code)) {
    return res.status(500).json({
      error: 'Configuração do banco inválida. Revise o arquivo .env do backend.',
    });
  }

  return res.status(500).json({ error: 'Erro interno do servidor' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'athlete', clinicName } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length)
      return res.status(409).json({ error: 'Email já cadastrado' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, clinic_name) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, role, clinicName || null]
    );
    const userId = result.insertId;
    await db.query('INSERT INTO athlete_profiles (user_id) VALUES (?)', [userId]);

    const token = signToken(userId, role);
    res.status(201).json({ token, user: { id: userId, name, email, role, clinicName } });
  } catch (err) {
    return handleAuthError(res, err, 'register');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    const [rows] = await db.query(
      'SELECT id, name, email, password_hash, role, clinic_name FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length)
      return res.status(401).json({ error: 'Credenciais inválidas' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = signToken(user.id, user.role);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicName: user.clinic_name,
      },
    });
  } catch (err) {
    return handleAuthError(res, err, 'login');
  }
};

exports.me = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.clinic_name, u.avatar AS avatar_url, u.created_at,
              ap.height_cm, ap.weight_kg, ap.sport, ap.birth_date, ap.gender, ap.vo2max
       FROM users u
       LEFT JOIN athlete_profiles ap ON ap.user_id = u.id
       WHERE u.id = ?`,
      [req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' });
    const u = rows[0];
    res.json({
      id: u.id, name: u.name, email: u.email, role: u.role,
      clinicName: u.clinic_name, avatarUrl: u.avatar_url, createdAt: u.created_at,
      profile: {
        heightCm: u.height_cm, weightKg: u.weight_kg, sport: u.sport,
        birthDate: u.birth_date, gender: u.gender, vo2max: u.vo2max,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
