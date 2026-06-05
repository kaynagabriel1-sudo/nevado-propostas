// src/utils/mailer.js
require('dotenv').config();
const nodemailer = require('nodemailer');
const sgMail    = require('@sendgrid/mail');
const db        = require('../database');

const provider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();
const company  = process.env.COMPANY_NAME  || 'Nevado Ind. Imp. e Exp. de Alimentos Ltda - EPP';
const cnpj     = process.env.COMPANY_CNPJ  || '06.180.906/0001-11';
const phone    = process.env.COMPANY_TEL   || '(15) 3261-3318';
const site     = process.env.COMPANY_SITE  || 'www.chocolatesnevado.com.br';
const emailCom = process.env.COMPANY_EMAIL || 'comercial@chocolatesnevado.com.br';

let gmailTransport;
if (provider === 'gmail') {
  gmailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });
}
if (provider === 'sendgrid') {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function buildEmailHtml(proposal, seller) {
  const items = JSON.parse(proposal.items || '[]');
  const validity = proposal.validity
    ? new Date(proposal.validity).toLocaleDateString('pt-BR') : '—';

  const rowsHtml = items.map((i, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#F8F9FB'}">
      <td style="padding:9px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;">${i.desc}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #E5E7EB;text-align:center;font-size:13px;">${i.qty}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #E5E7EB;text-align:right;font-size:13px;">R$ ${i.price.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #E5E7EB;text-align:right;font-size:13px;font-weight:600;color:#1a2e5a;">R$ ${(i.qty*i.price).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
    </tr>`).join('');

  const total = `R$ ${proposal.value.toLocaleString('pt-BR',{minimumFractionDigits:2})}`;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F6FA;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;border:1px solid #E5E7EB;">

  <!-- Header -->
  <tr><td style="background:#1a2e5a;padding:20px 30px;">
    <table width="100%"><tr>
      <td><p style="color:#fff;font-size:14px;font-weight:700;margin:0;">Valle Nevado Chocolates</p>
          <p style="color:rgba(255,255,255,0.5);font-size:10px;margin:3px 0 0;">${company}</p></td>
      <td align="right">
        <p style="color:rgba(255,255,255,0.6);font-size:10px;margin:0;">CNPJ: ${cnpj}</p>
        <p style="color:rgba(255,255,255,0.4);font-size:10px;margin:3px 0 0;">${site}</p>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#C8102E;height:4px;"></td></tr>

  <!-- Body -->
  <tr><td style="padding:28px 30px;">
    <p style="color:#6B7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Proposta Comercial</p>
    <h2 style="color:#1a2e5a;font-size:20px;margin:0 0 20px;letter-spacing:-.3px;">${proposal.id}</h2>

    <p style="color:#374151;font-size:14px;line-height:1.7;margin-bottom:6px;">Prezado(a) <strong>${proposal.client_name}</strong>,</p>
    <p style="color:#555;font-size:13px;line-height:1.7;margin-bottom:20px;">
      Apresentamos nossa proposta comercial conforme solicitado. Para quaisquer dúvidas, entre em contato com
      <strong>${seller.name}</strong> pelo e-mail <a href="mailto:${seller.email}" style="color:#C8102E;">${seller.email}</a>
      ou pelo telefone <strong>${phone}</strong>.
    </p>

    <!-- Items table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      <thead>
        <tr style="background:#1a2e5a;">
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#fff;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Descrição</th>
          <th style="padding:10px 14px;text-align:center;font-size:11px;color:#fff;font-weight:600;text-transform:uppercase;">Qtd</th>
          <th style="padding:10px 14px;text-align:right;font-size:11px;color:#fff;font-weight:600;text-transform:uppercase;">Preço Unit.</th>
          <th style="padding:10px 14px;text-align:right;font-size:11px;color:#fff;font-weight:600;text-transform:uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
      <tfoot>
        <tr style="background:#C8102E;">
          <td colspan="2" style="padding:12px 14px;font-weight:700;color:#fff;font-size:13px;">Total Geral</td>
          <td></td>
          <td style="padding:12px 14px;text-align:right;font-size:17px;font-weight:700;color:#FFD700;">${total}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Conditions -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="background:#F8F9FB;border-radius:6px;padding:12px 16px;width:50%;">
          <p style="margin:0;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px;">Validade da Proposta</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1a2e5a;">${validity}</p>
        </td>
        <td style="width:12px;"></td>
        <td style="background:#F8F9FB;border-radius:6px;padding:12px 16px;width:50%;">
          <p style="margin:0;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px;">Condição de Pagamento</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1a2e5a;">${proposal.pagto || '—'}</p>
        </td>
      </tr>
    </table>

    ${proposal.notes ? `<div style="padding:12px 16px;background:#FFFBEB;border-left:3px solid #D97706;border-radius:0 6px 6px 0;font-size:13px;color:#555;margin-bottom:16px;"><strong style="color:#374151;">Observações:</strong><br>${proposal.notes}</div>` : ''}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#1a2e5a;padding:16px 30px;">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);text-align:center;">
      ${company} · CNPJ: ${cnpj}<br>
      ${emailCom} · ${phone} · ${site}
    </p>
    <p style="margin:6px 0 0;font-size:10px;color:rgba(255,255,255,0.3);text-align:center;">
      Esta proposta é confidencial e foi gerada automaticamente pelo sistema Valle Nevado.
    </p>
  </td></tr>

</table></td></tr></table>
</body></html>`;
}

async function sendProposalEmail(proposal, seller) {
  const subject = `Proposta Comercial ${proposal.id} — Valle Nevado Chocolates`;
  const html    = buildEmailHtml(proposal, seller);
  const to      = proposal.client_email;
  let status = 'sent', error = null;

  try {
    if (provider === 'gmail') {
      await gmailTransport.sendMail({
        from: `"Valle Nevado Chocolates" <${process.env.GMAIL_USER}>`,
        to, subject, html,
      });
    } else if (provider === 'sendgrid') {
      await sgMail.send({
        from: { email: process.env.SENDGRID_FROM, name: 'Valle Nevado Chocolates' },
        to, subject, html,
      });
    }
  } catch (err) {
    status = 'error'; error = err.message;
    console.error('❌ Erro ao enviar e-mail:', err.message);
  }

  db.prepare('INSERT INTO email_logs (proposal_id, to_email, subject, status, error) VALUES (?, ?, ?, ?, ?)')
    .run(proposal.id, to, subject, status, error);

  if (status === 'error') throw new Error(error);
  return true;
}

module.exports = { sendProposalEmail, buildEmailHtml };
