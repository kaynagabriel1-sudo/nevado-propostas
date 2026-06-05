// src/routes/sellers.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router  = express.Router();

// Listar vendedores — admin vê todos, vendedor vê só ele mesmo
router.get('/', requireAuth, (req, res) => {
  if (req.session.userRole === 'admin') {
    const sellers = db.prepare("SELECT id, name, email, role, color, goal, active, created_at FROM users WHERE role = 'seller' AND active = 1").all();
    return res.json(sellers);
  }
  // vendedor só vê a si mesmo
  const me = db.prepare('SELECT id, name, email, role, color, goal FROM users WHERE id = ?').get(req.session.userId);
  res.json(me ? [me] : []);
});

// Criar vendedor — SOMENTE ADMIN
router.post('/', requireAdmin, (req, res) => {
  const { name, email, password, color, goal } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  const hash = bcrypt.hashSync(password, 10);
  try {
    const info = db.prepare('INSERT INTO users (name, email, password, role, color, goal) VALUES (?, ?, ?, ?, ?, ?)')
      .run(name, email, hash, 'seller', color || '#C8102E', goal || 40000);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch(e) {
    res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
  }
});

// Editar vendedor — SOMENTE ADMIN
router.put('/:id', requireAdmin, (req, res) => {
  const { name, email, color, goal } = req.body;
  db.prepare('UPDATE users SET name=?, email=?, color=?, goal=? WHERE id=?')
    .run(name, email, color, goal, req.params.id);
  res.json({ ok: true });
});

// Resetar senha de vendedor — SOMENTE ADMIN
router.post('/:id/reset-password', requireAdmin, (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres.' });
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.params.id);
  res.json({ ok: true });
});

// Desativar/excluir vendedor — SOMENTE ADMIN
router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('UPDATE users SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
