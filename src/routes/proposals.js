// src/routes/proposals.js
const express  = require('express');
const db       = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendProposalEmail } = require('../utils/mailer');
const { generateProposalPDF } = require('../utils/pdfGenerator');
const router   = express.Router();

function genId() {
  const all = db.prepare('SELECT COUNT(*) as c FROM proposals').get();
  const count = (all ? all.c : 0) + 1;
  return 'P-' + String(count).padStart(4, '0');
}

router.get('/', requireAuth, (req, res) => {
  const { month, year, status, seller_id } = req.query;
  const isAdmin = req.session.userRole === 'admin';
  let sql = `SELECT p.*, u.name AS seller_name, u.email AS seller_email, u.color AS seller_color
             FROM proposals p JOIN users u ON p.seller_id = u.id WHERE 1=1`;
  const params = [];
  if (!isAdmin) { sql += ' AND p.seller_id = ?'; params.push(req.session.userId); }
  else if (seller_id) { sql += ' AND p.seller_id = ?'; params.push(seller_id); }
  if (status)  { sql += ' AND p.status = ?'; params.push(status); }
  if (month)   { sql += " AND strftime('%m', p.created_at) = ?"; params.push(month.padStart(2,'0')); }
  if (year)    { sql += " AND strftime('%Y', p.created_at) = ?"; params.push(year); }
  sql += ' ORDER BY p.created_at DESC';
  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items || '[]') })));
});

router.post('/', requireAuth, async (req, res) => {
  const { client_name, client_email, client_cnpj, client_tel, client_cidade, pagto, prazo, items, notes, validity, sendEmail, extra } = req.body;
  if (!client_name || !client_email) return res.status(400).json({ error: 'Dados obrigatórios faltando.' });
  const itemsArr = Array.isArray(items) ? items : [];
  const value = itemsArr.reduce((s, i) => s + (i.qty * i.price), 0);
  const id = genId();
  const status = sendEmail ? 'Enviada' : 'Pendente';
  db.prepare(`INSERT INTO proposals (id, client_name, client_email, client_cnpj, client_tel, client_cidade, pagto, prazo, seller_id, value, status, validity, notes, items, extra, sent_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, client_name, client_email, client_cnpj||'', client_tel||'', client_cidade||'', pagto||'', prazo||'',
         req.session.userId, value, status, validity||null, notes||'', JSON.stringify(itemsArr),
         extra||'{}', sendEmail ? new Date().toISOString() : null);
  const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(id);
  const seller   = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  if (sendEmail) {
    try { await sendProposalEmail(proposal, seller); }
    catch (e) { return res.status(207).json({ id, warning: 'Proposta criada, mas falha no e-mail: ' + e.message }); }
  }
  res.status(201).json({ id, status });
});

router.get('/:id', requireAuth, (req, res) => {
  const p = db.prepare(`SELECT p.*, u.name AS seller_name, u.email AS seller_email, u.color AS seller_color
    FROM proposals p JOIN users u ON p.seller_id = u.id WHERE p.id = ?`).get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Proposta não encontrada.' });
  res.json({ ...p, items: JSON.parse(p.items || '[]') });
});

router.patch('/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;
  const valid = ['Pendente','Enviada','Aprovada','Recusada'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Status inválido.' });
  db.prepare('UPDATE proposals SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

router.post('/:id/send', requireAuth, async (req, res) => {
  const p = db.prepare('SELECT * FROM proposals WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Proposta não encontrada.' });
  const seller = db.prepare('SELECT * FROM users WHERE id = ?').get(p.seller_id);
  try {
    await sendProposalEmail(p, seller);
    db.prepare("UPDATE proposals SET status = 'Enviada', sent_at = ? WHERE id = ?").run(new Date().toISOString(), p.id);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/pdf', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM proposals WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Proposta não encontrada.' });
  const seller = db.prepare('SELECT * FROM users WHERE id = ?').get(p.seller_id);
  generateProposalPDF(p, seller, res);
});

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM proposals WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
