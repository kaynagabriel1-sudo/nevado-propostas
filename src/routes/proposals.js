// src/routes/proposals.js
const express  = require('express');
const db       = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendProposalEmail, sendReviewEmail } = require('../utils/mailer');
const { generateProposalPDF } = require('../utils/pdfGenerator');
const crypto   = require('crypto');
const router   = express.Router();

async function genId() {
  const all = await db.prepare('SELECT COUNT(*) as c FROM proposals').get();
  const count = (all ? parseInt(all.c) : 0) + 1;
  return 'P-' + String(count).padStart(4, '0');
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const { month, year, status, seller_id } = req.query;
    const isAdmin = req.session.userRole === 'admin';
    let sql = `SELECT p.*, u.name AS seller_name, u.email AS seller_email, u.color AS seller_color
               FROM proposals p JOIN users u ON p.seller_id = u.id WHERE 1=1`;
    const params = [];
    let i = 1;
    if (!isAdmin) { sql += ` AND p.seller_id = $${i++}`; params.push(req.session.userId); }
    else if (seller_id) { sql += ` AND p.seller_id = $${i++}`; params.push(seller_id); }
    if (status)  { sql += ` AND p.status = $${i++}`; params.push(status); }
    if (month)   { sql += ` AND SUBSTRING(p.created_at, 6, 2) = $${i++}`; params.push(month.padStart(2,'0')); }
    if (year)    { sql += ` AND SUBSTRING(p.created_at, 1, 4) = $${i++}`; params.push(year); }
    sql += ' ORDER BY p.created_at DESC';
    const rows = await db.prepare(sql).all(...params);
    res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items || '[]') })));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { client_name, client_email, client_cnpj, client_tel, client_cidade, pagto, prazo, items, notes, validity, sendEmail, extra } = req.body;
    if (!client_name || !client_email) return res.status(400).json({ error: 'Dados obrigatórios faltando.' });
    const itemsArr = Array.isArray(items) ? items : [];
    const value = itemsArr.reduce((s, i) => s + (i.qty * i.price), 0);
    const id = await genId();
    const status = sendEmail ? 'Enviada' : 'Pendente';
    const review_token = crypto.randomBytes(16).toString('hex');
    await db.prepare(`INSERT INTO proposals (id, client_name, client_email, client_cnpj, client_tel, client_cidade, pagto, prazo, seller_id, value, status, validity, notes, items, extra, sent_at, review_token)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`)
      .run(id, client_name, client_email, client_cnpj||'', client_tel||'', client_cidade||'', pagto||'', prazo||'',
           req.session.userId, value, status, validity||null, notes||'', JSON.stringify(itemsArr),
           extra||'{}', sendEmail ? new Date().toISOString() : null, review_token);
    const proposal = await db.prepare('SELECT * FROM proposals WHERE id = $1').get(id);
    const seller   = await db.prepare('SELECT * FROM users WHERE id = $1').get(req.session.userId);
    if (sendEmail) {
      try { await sendProposalEmail(proposal, seller); }
      catch (e) { return res.status(207).json({ id, warning: 'Proposta criada, mas falha no e-mail: ' + e.message }); }
    }
    res.status(201).json({ id, status });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const p = await db.prepare(`SELECT p.*, u.name AS seller_name, u.email AS seller_email, u.color AS seller_color
      FROM proposals p JOIN users u ON p.seller_id = u.id WHERE p.id = $1`).get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Proposta não encontrada.' });
    res.json({ ...p, items: JSON.parse(p.items || '[]') });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['Pendente','Enviada','Aprovada','Recusada'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Status inválido.' });
    
    const oldProposal = await db.prepare('SELECT * FROM proposals WHERE id = $1').get(req.params.id);
    await db.prepare('UPDATE proposals SET status = $1 WHERE id = $2').run(status, req.params.id);
    
    // Send review email when status changes to Aprovada
    if (status === 'Aprovada' && oldProposal && oldProposal.status !== 'Aprovada') {
      try {
        const seller = await db.prepare('SELECT * FROM users WHERE id = $1').get(oldProposal.seller_id);
        await sendReviewEmail(oldProposal, seller);
      } catch(e) { console.error('Erro ao enviar e-mail de avaliação:', e.message); }
    }
    
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/send', requireAuth, async (req, res) => {
  try {
    const p = await db.prepare('SELECT * FROM proposals WHERE id = $1').get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Proposta não encontrada.' });
    const seller = await db.prepare('SELECT * FROM users WHERE id = $1').get(p.seller_id);
    await sendProposalEmail(p, seller);
    await db.prepare("UPDATE proposals SET status = 'Enviada', sent_at = $1 WHERE id = $2").run(new Date().toISOString(), p.id);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const p = await db.prepare('SELECT * FROM proposals WHERE id = $1').get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Proposta não encontrada.' });
    const seller = await db.prepare('SELECT * FROM users WHERE id = $1').get(p.seller_id);
    const extra = (() => { try { return JSON.parse(p.extra || '{}'); } catch(e){ return {}; } })();
    const includeConditions = extra.includeConditions !== false;
    generateProposalPDF(p, seller, res, includeConditions);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await db.prepare('DELETE FROM proposals WHERE id = $1').run(req.params.id);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
