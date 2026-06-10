// src/routes/auth.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../database');
const router  = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E-mail e senha obrigatórios.' });
    const user = await db.prepare('SELECT * FROM users WHERE email = $1 AND active = 1').get(email);
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    req.session.userId    = user.id;
    req.session.userName  = user.name;
    req.session.userRole  = user.role;
    req.session.userColor = user.color;
    res.json({ ok: true, role: user.role, name: user.name });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado.' });
    const user = await db.prepare('SELECT id, name, email, role, color, goal FROM users WHERE id = $1').get(req.session.userId);
    res.json(user);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/change-password', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado.' });
    const { current, next: newPass } = req.body;
    const user = await db.prepare('SELECT * FROM users WHERE id = $1').get(req.session.userId);
    if (!bcrypt.compareSync(current, user.password))
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    const hash = bcrypt.hashSync(newPass, 10);
    await db.prepare('UPDATE users SET password = $1 WHERE id = $2').run(hash, req.session.userId);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;