const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const ALLOWED_ROLES = new Set(['athlete', 'coach']);

const signToken = (userId, role, isAdmin) =>
  jwt.sign({ userId, role, isAdmin: !!isAdmin }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const handleAuthError = (res, err, action) => {
  const dbUnavailableCodes = new Set([
    'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST',
  ]);
  const configCodes = new Set(['ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR']);

  console.error(`[auth:${action}]`, err.code || 'UNKNOWN', err.message || err);

  if (dbUnavailableCodes.has(err.code)) {
    return res.status(503).json({ error: 'Banco de dados indisponível. Verifique se o MySQL está ligado.' });
  }
  if (configCodes.has(err.code)) {
    return res.status(500).json({ error: 'Configuração do banco inválida. Revise o arquivo .env do backend.' });
  }
  return res.status(500).json({ error: 'Erro interno do servidor' });
};

// Validation rules
exports.registerRules = [
  body('name').trim().notEmpty().withMessage('Nome obrigatório'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres'),
  body('role').optional().isIn([...ALLOWED_ROLES]).withMessage('Tipo de conta inválido'),
];

exports.loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha obrigatória'),
];

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { name, email, password, clinicName, requestAdmin } = req.body;

    // Never trust role from client; validate it but default to athlete
    let role = req.body.role || 'athlete';
    if (!ALLOWED_ROLES.has(role)) role = 'athlete';

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email já cadastrado' });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, clinic_name) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, role, clinicName || null]
    );
    const userId = result.insertId;
    await db.query('INSERT INTO athlete_profiles (user_id) VALUES (?)', [userId]);

    // If professional role requests admin, notify the main admin (role = 'admin')
    if (role === 'coach' && requestAdmin) {
      const [adminRows] = await db.query("SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");
      if (adminRows.length) {
        await db.query(
          `INSERT INTO notifications (user_id, type, title, message, meta)
           VALUES (?, 'admin_request', 'Solicitação de acesso admin', ?, ?)`,
          [
            adminRows[0].id,
            `${name} (${email}) solicitou acesso de administrador.`,
            JSON.stringify({ requester_id: userId, requester_name: name, requester_email: email }),
          ]
        );
      }
    }

    const token = signToken(userId, role, false);
    res.status(201).json({
      token,
      user: { id: userId, name, email, role, clinicName: clinicName || null, isAdmin: false },
    });
  } catch (err) {
    return handleAuthError(res, err, 'register');
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      'SELECT id, name, email, password_hash, role, clinic_name, is_admin FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Credenciais inválidas' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = signToken(user.id, user.role, user.is_admin);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicName: user.clinic_name,
        isAdmin: !!user.is_admin,
      },
    });
  } catch (err) {
    return handleAuthError(res, err, 'login');
  }
};

exports.me = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.is_admin, u.clinic_name, u.created_at,
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
      isAdmin: !!u.is_admin,
      clinicName: u.clinic_name, createdAt: u.created_at,
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
