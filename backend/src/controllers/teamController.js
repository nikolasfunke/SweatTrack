const db = require('../config/database');

// Auxiliar para criar notificações
async function createNotification(userId, type, title, message, meta = null) {
  try {
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, meta)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, type, title, message, meta ? JSON.stringify(meta) : null]
    );
  } catch (err) {
    console.error('Erro ao criar notificação:', err);
  }
}

// Auxiliar para marcar notificações relativas ao time como processadas
async function resolveTeamNotifications(teamId, athleteId, type) {
  try {
    await db.query(
      `UPDATE notifications
       SET action_taken = 1, is_read = 1
       WHERE type = ? AND JSON_UNQUOTE(JSON_EXTRACT(meta, '$.team_id')) = ?
       ${athleteId ? `AND JSON_UNQUOTE(JSON_EXTRACT(meta, '$.athlete_id')) = ?` : ''}`,
      athleteId ? [type, String(teamId), String(athleteId)] : [type, String(teamId)]
    );
  } catch (err) {
    console.error('Erro ao resolver notificações:', err);
  }
}

// Criar equipe (Treinadores)
exports.createTeam = async (req, res) => {
  if (req.userRole !== 'coach' && req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas treinadores podem criar equipes' });
  }

  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nome da equipe é obrigatório' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO teams (name, description, coach_id) VALUES (?, ?, ?)',
      [name.trim(), description || null, req.userId]
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      description: description || null,
      coach_id: req.userId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar equipe' });
  }
};

// Listar equipes (Tanto atleta quanto treinador)
exports.listTeams = async (req, res) => {
  try {
    if (req.userRole === 'coach') {
      // Treinador: equipes sob seu comando
      const [rows] = await db.query(
        `SELECT t.*, COUNT(CASE WHEN tm.status = 'accepted' THEN 1 END) AS members_count
         FROM teams t
         LEFT JOIN team_members tm ON tm.team_id = t.id
         WHERE t.coach_id = ?
         GROUP BY t.id
         ORDER BY t.name ASC`,
        [req.userId]
      );
      return res.json(rows);
    } else {
      // Atleta: equipes das quais participa ou solicitou/recebeu convite
      const [rows] = await db.query(
        `SELECT t.*, u.name AS coach_name, tm.status
         FROM teams t
         JOIN users u ON t.coach_id = u.id
         JOIN team_members tm ON tm.team_id = t.id
         WHERE tm.athlete_id = ?
         ORDER BY tm.status DESC, t.name ASC`,
        [req.userId]
      );
      return res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar equipes' });
  }
};

// Detalhes da equipe
exports.getTeamDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar detalhes básicos da equipe
    const [teams] = await db.query(
      `SELECT t.*, u.name AS coach_name, u.email AS coach_email
       FROM teams t
       JOIN users u ON t.coach_id = u.id
       WHERE t.id = ?`,
      [id]
    );

    if (!teams.length) {
      return res.status(404).json({ error: 'Equipe não encontrada' });
    }

    const team = teams[0];

    // Verificar se o solicitante faz parte da equipe
    const isCoach = team.coach_id === req.userId;
    let athleteRelation = null;

    if (!isCoach && req.userRole !== 'admin') {
      const [relation] = await db.query(
        'SELECT status FROM team_members WHERE team_id = ? AND athlete_id = ?',
        [id, req.userId]
      );
      if (!relation.length) {
        return res.status(403).json({ error: 'Você não tem acesso a esta equipe' });
      }
      athleteRelation = relation[0].status;
    }

    // Buscar atletas vinculados
    const [members] = await db.query(
      `SELECT u.id, u.name, u.email, ap.sport, ap.position
       FROM users u
       JOIN team_members tm ON tm.athlete_id = u.id
       LEFT JOIN athlete_profiles ap ON ap.user_id = u.id
       WHERE tm.team_id = ? AND tm.status = 'accepted'
       ORDER BY u.name ASC`,
      [id]
    );

    // Se for o treinador, buscar solicitações pendentes e convites pendentes
    let pendingRequests = [];
    let pendingInvites = [];

    if (isCoach || req.userRole === 'admin') {
      [pendingRequests] = await db.query(
        `SELECT u.id, u.name, u.email, tm.created_at
         FROM users u
         JOIN team_members tm ON tm.athlete_id = u.id
         WHERE tm.team_id = ? AND tm.status = 'requested'
         ORDER BY tm.created_at ASC`,
        [id]
      );

      [pendingInvites] = await db.query(
        `SELECT u.id, u.name, u.email, tm.created_at
         FROM users u
         JOIN team_members tm ON tm.athlete_id = u.id
         WHERE tm.team_id = ? AND tm.status = 'invited'
         ORDER BY tm.created_at ASC`,
        [id]
      );
    }

    res.json({
      ...team,
      isCoach,
      athleteRelation,
      members,
      pendingRequests,
      pendingInvites
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar detalhes da equipe' });
  }
};

// Deletar equipe (Treinadores)
exports.deleteTeam = async (req, res) => {
  const { id } = req.params;

  try {
    const [team] = await db.query('SELECT coach_id FROM teams WHERE id = ?', [id]);
    if (!team.length) return res.status(404).json({ error: 'Equipe não encontrada' });

    if (team[0].coach_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Você não é o treinador desta equipe' });
    }

    await db.query('DELETE FROM teams WHERE id = ?', [id]);
    res.json({ success: true, message: 'Equipe excluída com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir equipe' });
  }
};

// Convidar Atleta para equipe (Treinadores)
exports.inviteAthlete = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'E-mail do atleta é obrigatório' });

  try {
    // Verificar se a equipe existe e é gerenciada pelo usuário
    const [teams] = await db.query('SELECT name, coach_id FROM teams WHERE id = ?', [id]);
    if (!teams.length) return res.status(404).json({ error: 'Equipe não encontrada' });
    
    const team = teams[0];
    if (team.coach_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas o treinador da equipe pode convidar atletas' });
    }

    // Buscar atleta pelo e-mail
    const [users] = await db.query('SELECT id, name, role FROM users WHERE email = ?', [email.trim()]);
    if (!users.length) return res.status(404).json({ error: 'Atleta não cadastrado no SweatTrack' });

    const athlete = users[0];
    if (athlete.role !== 'athlete') {
      return res.status(400).json({ error: 'O usuário correspondente a este e-mail não é um atleta' });
    }

    // Verificar se já existe relacionamento
    const [relation] = await db.query(
      'SELECT status FROM team_members WHERE team_id = ? AND athlete_id = ?',
      [id, athlete.id]
    );

    if (relation.length) {
      const status = relation[0].status;
      if (status === 'accepted') {
        return res.status(400).json({ error: 'O atleta já faz parte desta equipe' });
      }
      if (status === 'invited') {
        return res.status(400).json({ error: 'Convite já enviado e aguardando resposta do atleta' });
      }
      
      // Se o atleta solicitou entrada anteriormente ('requested') e o treinador está convidando ele de volta,
      // nós aprovamos automaticamente!
      if (status === 'requested') {
        await db.query(
          "UPDATE team_members SET status = 'accepted' WHERE team_id = ? AND athlete_id = ?",
          [id, athlete.id]
        );
        // Notificar atleta
        await createNotification(
          athlete.id,
          'alert',
          'Solicitação aceita',
          `Sua solicitação para entrar na equipe "${team.name}" foi aprovada pelo treinador.`,
          { team_id: id, team_name: team.name }
        );
        // Resolver notificações antigas
        await resolveTeamNotifications(id, athlete.id, 'team_request');
        return res.json({ success: true, status: 'accepted', message: 'Atleta adicionado à equipe' });
      }
    }

    // Criar convite pendente
    await db.query(
      "INSERT INTO team_members (team_id, athlete_id, status) VALUES (?, ?, 'invited')",
      [id, athlete.id]
    );

    // Buscar nome do treinador para a notificação
    const [coaches] = await db.query('SELECT name FROM users WHERE id = ?', [req.userId]);
    const coachName = coaches[0]?.name || 'Treinador';

    // Criar notificação para o atleta
    await createNotification(
      athlete.id,
      'team_invite',
      'Convite para Equipe',
      `O treinador ${coachName} convidou você para a equipe "${team.name}".`,
      { team_id: id, team_name: team.name, athlete_id: athlete.id }
    );

    res.json({ success: true, status: 'invited', message: 'Convite enviado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao convidar atleta' });
  }
};

// Pedir para entrar na equipe (Atleta)
exports.requestToJoin = async (req, res) => {
  const { id } = req.params;

  if (req.userRole !== 'athlete') {
    return res.status(403).json({ error: 'Apenas atletas podem solicitar entrada em equipes' });
  }

  try {
    // Verificar se equipe existe
    const [teams] = await db.query('SELECT name, coach_id FROM teams WHERE id = ?', [id]);
    if (!teams.length) return res.status(404).json({ error: 'Equipe não encontrada' });

    const team = teams[0];

    // Verificar se já existe relacionamento
    const [relation] = await db.query(
      'SELECT status FROM team_members WHERE team_id = ? AND athlete_id = ?',
      [id, req.userId]
    );

    if (relation.length) {
      const status = relation[0].status;
      if (status === 'accepted') {
        return res.status(400).json({ error: 'Você já faz parte desta equipe' });
      }
      if (status === 'requested') {
        return res.status(400).json({ error: 'Você já solicitou entrada nesta equipe' });
      }

      // Se o treinador já convidou o atleta ('invited') e o atleta está solicitando entrar,
      // aprova o convite imediatamente!
      if (status === 'invited') {
        await db.query(
          "UPDATE team_members SET status = 'accepted' WHERE team_id = ? AND athlete_id = ?",
          [id, req.userId]
        );
        // Notificar o treinador
        const [athletes] = await db.query('SELECT name FROM users WHERE id = ?', [req.userId]);
        const athleteName = athletes[0]?.name || 'Atleta';
        
        await createNotification(
          team.coach_id,
          'alert',
          'Convite Aceito',
          `O atleta ${athleteName} aceitou seu convite para a equipe "${team.name}".`,
          { team_id: id, team_name: team.name, athlete_id: req.userId }
        );
        // Resolver notificações antigas
        await resolveTeamNotifications(id, req.userId, 'team_invite');
        return res.json({ success: true, status: 'accepted', message: 'Você entrou na equipe' });
      }
    }

    // Criar solicitação pendente
    await db.query(
      "INSERT INTO team_members (team_id, athlete_id, status) VALUES (?, ?, 'requested')",
      [id, req.userId]
    );

    // Buscar nome do atleta
    const [athletes] = await db.query('SELECT name FROM users WHERE id = ?', [req.userId]);
    const athleteName = athletes[0]?.name || 'Atleta';

    // Criar notificação para o treinador
    await createNotification(
      team.coach_id,
      'team_request',
      'Solicitação de Entrada',
      `O atleta ${athleteName} solicitou entrada na equipe "${team.name}".`,
      { team_id: id, team_name: team.name, athlete_id: req.userId }
    );

    res.json({ success: true, status: 'requested', message: 'Solicitação de entrada enviada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao solicitar entrada na equipe' });
  }
};

// Responder a convite/solicitação (Treinadores e Atletas)
exports.respondToRequest = async (req, res) => {
  const { id } = req.params;
  const { athleteId, action } = req.body; // action: 'accept' ou 'decline'

  if (!action || (action !== 'accept' && action !== 'decline')) {
    return res.status(400).json({ error: 'Ação inválida. Escolha entre accept ou decline' });
  }

  try {
    const [teams] = await db.query('SELECT name, coach_id FROM teams WHERE id = ?', [id]);
    if (!teams.length) return res.status(404).json({ error: 'Equipe não encontrada' });
    
    const team = teams[0];
    const isCoach = team.coach_id === req.userId;

    let targetAthleteId = athleteId;

    if (isCoach || req.userRole === 'admin') {
      // Treinador respondendo a uma solicitação do atleta
      if (!targetAthleteId) {
        return res.status(400).json({ error: 'athleteId é obrigatório quando o treinador responde' });
      }

      const [relation] = await db.query(
        "SELECT status FROM team_members WHERE team_id = ? AND athlete_id = ? AND status = 'requested'",
        [id, targetAthleteId]
      );

      if (!relation.length) {
        return res.status(404).json({ error: 'Solicitação de adesão não encontrada' });
      }

      if (action === 'accept') {
        await db.query(
          "UPDATE team_members SET status = 'accepted' WHERE team_id = ? AND athlete_id = ?",
          [id, targetAthleteId]
        );

        // Notificar atleta
        await createNotification(
          targetAthleteId,
          'alert',
          'Solicitação aceita',
          `Sua solicitação para entrar na equipe "${team.name}" foi aceita pelo treinador.`,
          { team_id: id, team_name: team.name }
        );
      } else {
        // Se recusar, exclui a relação
        await db.query(
          "DELETE FROM team_members WHERE team_id = ? AND athlete_id = ?",
          [id, targetAthleteId]
        );

        // Notificar atleta
        await createNotification(
          targetAthleteId,
          'alert',
          'Solicitação recusada',
          `Sua solicitação para entrar na equipe "${team.name}" foi recusada pelo treinador.`,
          { team_id: id, team_name: team.name }
        );
      }

      // Marcar notificações como resolvidas
      await resolveTeamNotifications(id, targetAthleteId, 'team_request');

    } else {
      // Atleta respondendo ao convite do treinador
      targetAthleteId = req.userId;

      const [relation] = await db.query(
        "SELECT status FROM team_members WHERE team_id = ? AND athlete_id = ? AND status = 'invited'",
        [id, targetAthleteId]
      );

      if (!relation.length) {
        return res.status(404).json({ error: 'Convite da equipe não encontrado' });
      }

      // Buscar nome do atleta
      const [athletes] = await db.query('SELECT name FROM users WHERE id = ?', [req.userId]);
      const athleteName = athletes[0]?.name || 'Atleta';

      if (action === 'accept') {
        await db.query(
          "UPDATE team_members SET status = 'accepted' WHERE team_id = ? AND athlete_id = ?",
          [id, targetAthleteId]
        );

        // Notificar o treinador
        await createNotification(
          team.coach_id,
          'alert',
          'Convite Aceito',
          `O atleta ${athleteName} aceitou seu convite para a equipe "${team.name}".`,
          { team_id: id, team_name: team.name, athlete_id: targetAthleteId }
        );
      } else {
        // Excluir relação
        await db.query(
          "DELETE FROM team_members WHERE team_id = ? AND athlete_id = ?",
          [id, targetAthleteId]
        );

        // Notificar o treinador
        await createNotification(
          team.coach_id,
          'alert',
          'Convite Recusado',
          `O atleta ${athleteName} recusou seu convite para a equipe "${team.name}".`,
          { team_id: id, team_name: team.name, athlete_id: targetAthleteId }
        );
      }

      // Marcar notificações como resolvidas
      await resolveTeamNotifications(id, targetAthleteId, 'team_invite');
    }

    res.json({ success: true, message: `Convite/Solicitação de equipe respondido (${action})` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao responder à solicitação/convite' });
  }
};

// Responder à solicitação diretamente pela notificação
exports.respondToRequestFromNotification = async (req, res) => {
  const { notificationId } = req.params;
  const { action } = req.body; // 'accept' ou 'decline'

  if (!action || (action !== 'accept' && action !== 'decline')) {
    return res.status(400).json({ error: 'Ação inválida. Escolha entre accept ou decline' });
  }

  try {
    // Buscar a notificação
    const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [notificationId]);
    if (!rows.length) return res.status(404).json({ error: 'Notificação não encontrada' });

    const n = rows[0];
    if (n.action_taken) {
      return res.status(400).json({ error: 'Esta solicitação já foi processada' });
    }

    let meta;
    try {
      meta = typeof n.meta === 'string' ? JSON.parse(n.meta) : n.meta;
    } catch {
      return res.status(400).json({ error: 'Dados da notificação corrompidos' });
    }

    const { team_id, athlete_id } = meta || {};
    if (!team_id || !athlete_id) {
      return res.status(400).json({ error: 'Dados incompletos na notificação' });
    }

    // Buscar equipe
    const [teams] = await db.query('SELECT name, coach_id FROM teams WHERE id = ?', [team_id]);
    if (!teams.length) return res.status(404).json({ error: 'Equipe não encontrada' });
    const team = teams[0];

    // Verificar se quem está aceitando/recusando é o ator correto
    if (n.type === 'team_request') {
      // Solicitação de atleta para o treinador. O treinador atual precisa ser o coach_id da equipe.
      if (team.coach_id !== req.userId && req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Você não tem permissão para gerenciar esta equipe' });
      }

      if (action === 'accept') {
        await db.query(
          "UPDATE team_members SET status = 'accepted' WHERE team_id = ? AND athlete_id = ?",
          [team_id, athlete_id]
        );
        await createNotification(
          athlete_id,
          'alert',
          'Solicitação aceita',
          `Sua solicitação para entrar na equipe "${team.name}" foi aceita pelo treinador.`,
          { team_id, team_name: team.name }
        );
      } else {
        await db.query(
          "DELETE FROM team_members WHERE team_id = ? AND athlete_id = ?",
          [team_id, athlete_id]
        );
        await createNotification(
          athlete_id,
          'alert',
          'Solicitação recusada',
          `Sua solicitação para entrar na equipe "${team.name}" foi recusada pelo treinador.`,
          { team_id, team_name: team.name }
        );
      }

      // Marcar todas as notificações do mesmo time/atleta do tipo request como resolvidas
      await resolveTeamNotifications(team_id, athlete_id, 'team_request');

    } else if (n.type === 'team_invite') {
      // Convite do treinador para o atleta. O usuário atual precisa ser o athlete_id convidado.
      if (parseInt(athlete_id) !== req.userId) {
        return res.status(403).json({ error: 'Este convite não foi enviado para você' });
      }

      // Buscar nome do atleta
      const [athletes] = await db.query('SELECT name FROM users WHERE id = ?', [req.userId]);
      const athleteName = athletes[0]?.name || 'Atleta';

      if (action === 'accept') {
        await db.query(
          "UPDATE team_members SET status = 'accepted' WHERE team_id = ? AND athlete_id = ?",
          [team_id, athlete_id]
        );
        await createNotification(
          team.coach_id,
          'alert',
          'Convite Aceito',
          `O atleta ${athleteName} aceitou seu convite para a equipe "${team.name}".`,
          { team_id, team_name: team.name, athlete_id }
        );
      } else {
        await db.query(
          "DELETE FROM team_members WHERE team_id = ? AND athlete_id = ?",
          [team_id, athlete_id]
        );
        await createNotification(
          team.coach_id,
          'alert',
          'Convite Recusado',
          `O atleta ${athleteName} recusou seu convite para a equipe "${team.name}".`,
          { team_id, team_name: team.name, athlete_id }
        );
      }

      // Marcar todas as notificações do mesmo time/atleta do tipo invite como resolvidas
      await resolveTeamNotifications(team_id, athlete_id, 'team_invite');
    } else {
      return res.status(400).json({ error: 'Tipo de notificação inválido para esta ação' });
    }

    // Garantir que a própria notificação atual também esteja marcada como resolvida
    await db.query('UPDATE notifications SET action_taken = 1, is_read = 1 WHERE id = ?', [notificationId]);

    res.json({ success: true, message: 'Solicitação resolvida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar ação de notificação' });
  }
};

// Sair da equipe (Atletas)
exports.leaveTeam = async (req, res) => {
  const { id } = req.params;

  try {
    const [team] = await db.query('SELECT name, coach_id FROM teams WHERE id = ?', [id]);
    if (!team.length) return res.status(404).json({ error: 'Equipe não encontrada' });

    await db.query('DELETE FROM team_members WHERE team_id = ? AND athlete_id = ?', [id, req.userId]);

    // Buscar nome do atleta
    const [athletes] = await db.query('SELECT name FROM users WHERE id = ?', [req.userId]);
    const athleteName = athletes[0]?.name || 'Atleta';

    // Notificar treinador
    await createNotification(
      team[0].coach_id,
      'alert',
      'Atleta saiu da equipe',
      `O atleta ${athleteName} saiu da equipe "${team[0].name}".`,
      { team_id: id, athlete_id: req.userId }
    );

    res.json({ success: true, message: 'Você saiu da equipe com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao sair da equipe' });
  }
};

// Remover atleta da equipe (Treinadores)
exports.removeMember = async (req, res) => {
  const { id, athleteId } = req.params;

  try {
    const [team] = await db.query('SELECT name, coach_id FROM teams WHERE id = ?', [id]);
    if (!team.length) return res.status(404).json({ error: 'Equipe não encontrada' });

    if (team[0].coach_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas o treinador da equipe pode remover membros' });
    }

    await db.query('DELETE FROM team_members WHERE team_id = ? AND athlete_id = ?', [id, athleteId]);

    // Notificar atleta
    await createNotification(
      athleteId,
      'alert',
      'Removido da equipe',
      `Você foi removido da equipe "${team[0].name}" pelo treinador.`,
      { team_id: id }
    );

    res.json({ success: true, message: 'Atleta removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover atleta da equipe' });
  }
};

// Buscar equipes (Atletas buscando equipes para entrar)
exports.searchTeams = async (req, res) => {
  const { q } = req.query;

  try {
    const queryTerm = `%${(q || '').trim()}%`;
    const [rows] = await db.query(
      `SELECT t.*, u.name AS coach_name, tm.status AS my_status
       FROM teams t
       JOIN users u ON t.coach_id = u.id
       LEFT JOIN team_members tm ON tm.team_id = t.id AND tm.athlete_id = ?
       WHERE t.name LIKE ? OR u.name LIKE ?
       ORDER BY t.name ASC
       LIMIT 50`,
      [req.userId, queryTerm, queryTerm]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar equipes' });
  }
};
