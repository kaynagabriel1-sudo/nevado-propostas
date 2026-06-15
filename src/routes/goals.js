// src/routes/goals.js
const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get goals for a specific month/year
router.get('/', requireAuth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = parseInt(month) || now.getMonth() + 1;

    const sellers = await db.prepare('SELECT id, name, color, goal FROM users WHERE role = $1 AND active = 1').all('seller');
    const goals = await db.prepare('SELECT * FROM seller_goals WHERE year = $1 AND month = $2').all(y, m);

    const result = sellers.map(s => {
      const g = goals.find(x => x.seller_id === s.id);
      return { ...s, monthly_goal: g ? g.goal : s.goal };
    });

    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Set goal for seller/month/year
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { seller_id, year, month, goal } = req.body;
    await db.prepare(`
      INSERT INTO seller_goals (seller_id, year, month, goal)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (seller_id, year, month) DO UPDATE SET goal = $4
    `).run(seller_id, year, month, goal);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
