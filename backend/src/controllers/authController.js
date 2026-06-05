const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { sendVerificationEmail } = require('../config/email');

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

/** Gera código numérico de 6 dígitos */
const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));


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

    let role = req.body.role || 'athlete';
    if (!ALLOWED_ROLES.has(role)) role = 'athlete';

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email já cadastrado' });

    const hash = await bcrypt.hash(password, 12);
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    const [result] = await db.query(
      `INSERT INTO users
        (name, email, password_hash, role, clinic_name, is_verified, verification_code, verification_expires)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [name, email, hash, role, clinicName || null, code, expiresAt]
    );
    const userId = result.insertId;
    await db.query('INSERT INTO athlete_profiles (user_id) VALUES (?)', [userId]);

    // Notificar admin se for coach solicitando admin
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

    // Enviar e-mail de verificação (ou logar no console em dev)
    await sendVerificationEmail(email, name, code);

    const token = signToken(userId, role, false);
    res.status(201).json({
      token,
      user: { id: userId, name, email, role, clinicName: clinicName || null, isAdmin: false, isVerified: false },
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
      'SELECT id, name, email, password_hash, role, clinic_name, is_admin, is_verified FROM users WHERE email = ?',
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
        isVerified: !!user.is_verified,
      },
    });
  } catch (err) {
    return handleAuthError(res, err, 'login');
  }
};

exports.me = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.is_admin, u.is_verified, u.clinic_name, u.created_at,
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
      isVerified: !!u.is_verified,
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

exports.verifyEmail = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Código obrigatório' });

  try {
    const [rows] = await db.query(
      'SELECT verification_code, verification_expires, is_verified FROM users WHERE id = ?',
      [req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' });

    const user = rows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: 'E-mail já verificado' });
    }
    if (user.verification_code !== code) {
      return res.status(400).json({ error: 'Código inválido' });
    }
    if (new Date() > new Date(user.verification_expires)) {
      return res.status(400).json({ error: 'Código expirado. Solicite um novo.' });
    }

    await db.query(
      'UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires = NULL WHERE id = ?',
      [req.userId]
    );

    res.json({ message: 'E-mail verificado com sucesso!' });
  } catch (err) {
    return handleAuthError(res, err, 'verifyEmail');
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT name, email, is_verified, verification_expires FROM users WHERE id = ?',
      [req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' });

    const user = rows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: 'E-mail já verificado' });
    }

    // Rate limiting: impede reenvio se o código ainda tiver mais de 14 minutos de validade
    if (user.verification_expires) {
      const timeLeft = new Date(user.verification_expires) - new Date();
      if (timeLeft > 14 * 60 * 1000) {
        const seconds = Math.ceil(timeLeft / 1000) - 14 * 60;
        return res.status(429).json({
          error: `Aguarde ${seconds} segundos antes de solicitar um novo código.`,
        });
      }
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      'UPDATE users SET verification_code = ?, verification_expires = ? WHERE id = ?',
      [code, expiresAt, req.userId]
    );

    await sendVerificationEmail(user.email, user.name, code);

    res.json({ message: 'Código de verificação reenviado!' });
  } catch (err) {
    return handleAuthError(res, err, 'resendVerification');
  }
};
