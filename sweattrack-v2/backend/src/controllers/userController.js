const db = require('../config/database');
const bcrypt = require('bcrypt');

exports.updateProfile = async (req, res) => {
  try {
    const { name, clinicName, heightCm, weightKg, sport, birthDate, gender, vo2max } = req.body;
    if (name || clinicName) {
      await db.query(
        'UPDATE users SET name = COALESCE(?, name), clinic_name = COALESCE(?, clinic_name) WHERE id = ?',
        [name || null, clinicName || null, req.userId]
      );
    }
    await db.query(
      `INSERT INTO athlete_profiles (user_id, height_cm, weight_kg, sport, birth_date, gender, vo2max)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         height_cm = COALESCE(VALUES(height_cm), height_cm),
         weight_kg = COALESCE(VALUES(weight_kg), weight_kg),
         sport = COALESCE(VALUES(sport), sport),
         birth_date = COALESCE(VALUES(birth_date), birth_date),
         gender = COALESCE(VALUES(gender), gender),
         vo2max = COALESCE(VALUES(vo2max), vo2max)`,
      [req.userId, heightCm, weightKg, sport, birthDate, gender, vo2max]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.userId]);
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' });
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: 'Senha atual incorreta' });
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
};
