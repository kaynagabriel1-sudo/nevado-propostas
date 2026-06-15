// src/routes/sellers.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router  = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    if (req.session.userRole === 'admin') {
      const sellers = await db.prepare("SELECT id, name, email, role, color, goal, active, photo, created_at FROM users WHERE role = 'seller' AND active = 1").all();
      return res.json(sellers);
    }
    const me = await db.prepare('SELECT id, name, email, role, color, goal, photo FROM users WHERE id = $1').get(req.session.userId);
    res.json(me ? [me] : []);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, email, password, color, goal, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    const hash = bcrypt.hashSync(password, 10);
    const info = await db.prepare('INSERT INTO users (name, email, password, role, color, goal) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id')
      .run(name, email, hash, 'seller', color || '#C8102E', goal || 40000);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch(e) {
    res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, color, goal, role, password } = req.body;
    if(password && password.length >= 6) {
      const hash = bcrypt.hashSync(password, 10);
      await db.prepare('UPDATE users SET name=$1, email=$2, color=$3, goal=$4, password=$5 WHERE id=$6')
        .run(name, email, color, goal, hash, req.params.id);
    } else {
      await db.prepare('UPDATE users SET name=$1, email=$2, color=$3, goal=$4 WHERE id=$5')
        .run(name, email, color, goal, req.params.id);
    }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await db.prepare('UPDATE users SET active = 0 WHERE id = $1').run(req.params.id);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
