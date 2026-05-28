const db = require('../config/database');

function parseNotificationMeta(metaValue) {
  if (!metaValue) return {};
  if (typeof metaValue === 'object') return metaValue;

  try {
    return JSON.parse(metaValue);
  } catch (err) {
    console.error('[admin] invalid notification meta:', metaValue);
    return null;
  }
}

exports.listUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.is_admin, u.clinic_name,
              u.created_at, u.updated_at,
              ap.height_cm, ap.weight_kg, ap.sport, ap.birth_date, ap.gender, ap.vo2max
       FROM users u
       LEFT JOIN athlete_profiles ap ON ap.user_id = u.id
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

exports.toggleAdmin = async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);

    const [rows] = await db.query('SELECT is_admin, name, role FROM users WHERE id = ?', [targetId]);
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' });

    if (rows[0].role === 'admin') {
      return res.status(403).json({ error: 'O perfil ADMIN é protegido e não pode ter o status alterado' });
    }

    const newValue = rows[0].is_admin ? 0 : 1;
    await db.query('UPDATE users SET is_admin = ? WHERE id = ?', [newValue, targetId]);

    // Notify the user about the change
    const msg = newValue
      ? 'Seu acesso de administrador foi ativado.'
      : 'Seu acesso de administrador foi removido.';
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'alert', ?, ?)`,
      [targetId, newValue ? 'Acesso de admin concedido' : 'Acesso de admin removido', msg]
    );

    res.json({ is_admin: newValue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao alterar status de admin' });
  }
};

exports.handleAdminRequest = async (req, res) => {
  const { notificationId } = req.params;
  const { action } = req.body; // 'approve' | 'deny'

  if (!['approve', 'deny'].includes(action)) {
    return res.status(400).json({ error: 'Ação inválida' });
  }

  try {
    const [notifs] = await db.query(
      `SELECT * FROM notifications WHERE id = ? AND type = 'admin_request' AND action_taken = 0`,
      [notificationId]
    );
    if (!notifs.length) {
      return res.status(404).json({ error: 'Solicitação não encontrada ou já processada' });
    }

    const notif = notifs[0];
    const meta = parseNotificationMeta(notif.meta);

    if (!meta) {
      return res.status(400).json({ error: 'Metadado inválido' });
    }

    const requesterId = parseInt(meta.requester_id, 10);

    if (!Number.isInteger(requesterId) || requesterId <= 0) {
      return res.status(400).json({ error: 'Metadado inválido' });
    }

    if (action === 'approve') {
      await db.query('UPDATE users SET is_admin = 1 WHERE id = ?', [requesterId]);
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES (?, 'alert', 'Solicitação de admin aprovada', 'Sua solicitação de acesso de administrador foi aprovada.')`,
        [requesterId]
      );
    } else {
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES (?, 'alert', 'Solicitação de admin negada', 'Sua solicitação de acesso de administrador foi negada pelo administrador.')`,
        [requesterId]
      );
    }

    await db.query(
      'UPDATE notifications SET action_taken = 1, is_read = 1 WHERE id = ?',
      [notificationId]
    );

    res.json({ success: true, action });
  } catch (err) {
    console.error('[admin] handleAdminRequest failed:', err);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};
