const db = require('../config/database');

exports.list = async (req, res) => {
  try {
    const { date } = req.query;
    let query = `SELECT mp.*,
      (SELECT COUNT(*) FROM meals m WHERE m.plan_id = mp.id) AS meal_count
     FROM meal_plans mp WHERE mp.user_id = ?`;
    const params = [req.userId];
    if (date) { query += ' AND mp.plan_date = ?'; params.push(date); }
    query += ' ORDER BY mp.plan_date DESC LIMIT 30';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar planos' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [plans] = await db.query(
      'SELECT * FROM meal_plans WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!plans.length) return res.status(404).json({ error: 'Plano não encontrado' });

    const [meals] = await db.query(
      'SELECT * FROM meals WHERE plan_id = ? ORDER BY meal_time_actual',
      [req.params.id]
    );

    for (const meal of meals) {
      const [items] = await db.query(
        'SELECT * FROM food_items WHERE meal_id = ?',
        [meal.id]
      );
      meal.items = items;
    }

    res.json({ ...plans[0], meals });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar plano' });
  }
};

exports.create = async (req, res) => {
  try {
    const { planDate, planType, title, notes, meals = [] } = req.body;
    const [result] = await db.query(
      'INSERT INTO meal_plans (user_id, plan_date, plan_type, title, notes) VALUES (?, ?, ?, ?, ?)',
      [req.userId, planDate, planType, title, notes]
    );
    const planId = result.insertId;

    for (const meal of meals) {
      const [mealResult] = await db.query(
        'INSERT INTO meals (plan_id, meal_time, meal_time_actual) VALUES (?, ?, ?)',
        [planId, meal.mealTime, meal.mealTimeActual || null]
      );
      for (const item of meal.items || []) {
        await db.query(
          'INSERT INTO food_items (meal_id, name, quantity, unit, calories, carbs_g, protein_g, fat_g, sodium_mg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [mealResult.insertId, item.name, item.quantity, item.unit, item.calories, item.carbsG, item.proteinG, item.fatG, item.sodiumMg]
        );
      }
    }

    res.status(201).json({ id: planId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar plano' });
  }
};

exports.delete = async (req, res) => {
  try {
    await db.query('DELETE FROM meal_plans WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar plano' });
  }
};
