// src/routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const products = await db.prepare('SELECT * FROM products ORDER BY code ASC').all();
    res.json(products);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { code, description, unit, cost, margin } = req.body;
    if(!code || !description) return res.status(400).json({ error: 'Código e descrição são obrigatórios.' });
    await db.prepare('INSERT INTO products (code, description, unit, cost, margin) VALUES ($1, $2, $3, $4, $5)')
      .run(code.toUpperCase(), description, unit||'', cost||0, margin||0);
    res.status(201).json({ ok: true });
  } catch(e) { res.status(409).json({ error: 'Código já cadastrado.' }); }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { code, description, unit, cost, margin } = req.body;
    await db.prepare('UPDATE products SET code=$1, description=$2, unit=$3, cost=$4, margin=$5 WHERE id=$6')
      .run(code.toUpperCase(), description, unit||'', cost||0, margin||0, req.params.id);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await db.prepare('DELETE FROM products WHERE id = $1').run(req.params.id);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
