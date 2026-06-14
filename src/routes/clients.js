// src/routes/clients.js
const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

// Listar todos os clientes
router.get('/', requireAuth, async (req, res) => {
  try {
    const clients = await db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
    res.json(clients);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Buscar cliente por ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const client = await db.prepare('SELECT * FROM clients WHERE id = $1').get(req.params.id);
    res.json(client);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Criar cliente
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, company, cpf_cnpj, state_registration, tax_regime, cep, street, number, neighborhood, city, state } = req.body;
    const last = await db.prepare("SELECT code FROM clients ORDER BY id DESC LIMIT 1").get();
    let nextNum = 1;
    if (last) {
      nextNum = parseInt(last.code.replace('C-', '')) + 1;
    }
    const code = `C-${String(nextNum).padStart(2, '0')}`;
    const result = await db.prepare(`
      INSERT INTO clients (code, name, email, phone, company, cpf_cnpj, state_registration, tax_regime, cep, street, number, neighborhood, city, state)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id
    `).run(code, name, email, phone, company, cpf_cnpj, state_registration, tax_regime, cep, street, number, neighborhood, city, state);
    res.json({ success: true, code });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Atualizar cliente
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, company, cpf_cnpj, state_registration, tax_regime, cep, street, number, neighborhood, city, state } = req.body;
    await db.prepare(`
      UPDATE clients SET name=$1, email=$2, phone=$3, company=$4, cpf_cnpj=$5, state_registration=$6, tax_regime=$7, cep=$8, street=$9, number=$10, neighborhood=$11, city=$12, state=$13 WHERE id=$14
    `).run(name, email, phone, company, cpf_cnpj, state_registration, tax_regime, cep, street, number, neighborhood, city, state, req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Deletar cliente
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.prepare('DELETE FROM clients WHERE id = $1').run(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;