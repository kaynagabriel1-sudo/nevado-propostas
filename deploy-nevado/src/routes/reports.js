// src/routes/reports.js
const express = require('express');
const db      = require('../database');
const { requireAuth } = require('../middleware/auth');
const router  = express.Router();

router.get('/monthly', requireAuth, (req, res) => {
  const { month, year } = req.query;
  const m = (month || String(new Date().getMonth()+1)).padStart(2,'0');
  const y = year || String(new Date().getFullYear());
  const isAdmin = req.session.userRole === 'admin';

  let base = `FROM proposals p JOIN users u ON p.seller_id = u.id
              WHERE strftime('%m', p.created_at) = '${m}' AND strftime('%Y', p.created_at) = '${y}'`;
  if (!isAdmin) base += ` AND p.seller_id = ${req.session.userId}`;

  const summary = db.prepare(`
    SELECT COUNT(*) as total, SUM(value) as volume,
      SUM(CASE WHEN status='Aprovada' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status='Enviada'  THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN status='Pendente' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status='Recusada' THEN 1 ELSE 0 END) as rejected
    ${base}`).get();

  const bySeller = db.prepare(`
    SELECT u.id, u.name, u.color, u.goal,
      COUNT(*) as proposals, SUM(p.value) as volume,
      SUM(CASE WHEN p.status='Aprovada' THEN 1 ELSE 0 END) as approved
    ${base} GROUP BY u.id ORDER BY volume DESC`).all();

  res.json({ month: m, year: y, summary, bySeller });
});

module.exports = router;
