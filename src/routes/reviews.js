// src/routes/reviews.js
const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

// Buscar avaliação de uma proposta (autenticado)
router.get('/proposal/:id', requireAuth, async (req, res) => {
  try {
    const review = await db.prepare('SELECT * FROM reviews WHERE proposal_id = $1').get(req.params.id);
    res.json(review || null);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Buscar todas as avaliações (admin)
router.get('/', requireAuth, async (req, res) => {
  try {
    const reviews = await db.prepare(`
      SELECT r.*, p.client_name, p.id as proposal_id, u.name as seller_name
      FROM reviews r
      JOIN proposals p ON r.proposal_id = p.id
      JOIN users u ON p.seller_id = u.id
      ORDER BY r.created_at DESC
    `).all();
    res.json(reviews);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Salvar avaliação (público - token único)
router.post('/submit/:token', async (req, res) => {
  try {
    const proposal = await db.prepare('SELECT * FROM proposals WHERE review_token = $1').get(req.params.token);
    if (!proposal) return res.status(404).json({ error: 'Link inválido ou expirado.' });

    const existing = await db.prepare('SELECT id FROM reviews WHERE proposal_id = $1').get(proposal.id);
    if (existing) return res.status(400).json({ error: 'Esta proposta já foi avaliada.' });

    const { qualidade, atendimento, prazo, expectativas, melhorias, comentario } = req.body;
    await db.prepare(`
      INSERT INTO reviews (proposal_id, qualidade, atendimento, prazo, expectativas, melhorias, comentario)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `).run(proposal.id, qualidade, atendimento, prazo, expectativas, melhorias || '', comentario || '');

    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Buscar proposta pelo token (público)
router.get('/token/:token', async (req, res) => {
  try {
    const proposal = await db.prepare('SELECT id, client_name, status FROM proposals WHERE review_token = $1').get(req.params.token);
    if (!proposal) return res.status(404).json({ error: 'Link inválido.' });
    const existing = await db.prepare('SELECT id FROM reviews WHERE proposal_id = $1').get(proposal.id);
    res.json({ ...proposal, already_reviewed: !!existing });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
