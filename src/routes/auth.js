// src/routes/auth.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../database');
const router  = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha obrigatórios.' });
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  req.session.userId   = user.id;
  req.session.userName = user.name;
  req.session.userRole = user.role;
  req.session.userColor = user.color;
  res.json({ ok: true, role: user.role, name: user.name });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado.' });
  const user = db.prepare('SELECT id, name, email, role, color, goal FROM users WHERE id = ?').get(req.session.userId);
  res.json(user);
});

router.post('/change-password', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado.' });
  const { current, next: newPass } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  if (!bcrypt.compareSync(current, user.password))
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  const hash = bcrypt.hashSync(newPass, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.session.userId);
  res.json({ ok: true });
});

module.exports = router;
