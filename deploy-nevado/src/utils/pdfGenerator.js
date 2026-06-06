// src/utils/pdfGenerator.js
const PDFDocument = require('pdfkit');

const LOGO_B64 = require('./logoBase64');

const CONDITIONS = `CONDIÇÕES GERAIS DE VENDAS

Confirmação de Pedido:
O pedido somente será considerado quando formalizado, por escrito, fax ou e-mail. Eventos negativos referentes a pagamentos anteriores ao faturamento poderão condicionar a fabricação a seu efetivo cumprimento.
Serão somente consideradas válidas as confirmações com menção do número de nossa cotação.

Preços e Condições de Pagamento:
Os preços são Posto Fábrica Valle Nevado Chocolates, em Porto Feliz/SP, exceto quando contrário indicado na proposta.
Os impostos incidentes serão debitados ao comprador, conforme a legislação vigente à época do faturamento. As condições de pagamento são as indicadas na oferta e/ou confirmação de pedido.
Atrasos no cumprimento de eventos de pagamento sujeitam o comprador ao pagamento dos juros de mora praticados pelo mercado.

Limite de Crédito:
A Valle Nevado Chocolates se reserva o direito de avaliar ou reavaliar o limite de crédito de seus clientes, na recepção de pedidos, antes da realização de faturamentos, ou a qualquer tempo. O resultado desta avaliação, poderá acarretar a necessidade de alteração de condições de pagamentos de propostas ativas e/ou pedidos já recebidos.

Prazo de Entrega:
Os prazos de entrega são os indicados na oferta, a/ou confirmação de pedido, salvo:
1. Em caso de inadimplência do comprador em eventos de pagamento anteriores.
2. Se o comprador solicitar modificações nas especificações originais.
3. Por motivo de força maior, caso fortuito, ou fato irresistível, conforme o Código Civil Brasileiro.
4. Se houver a necessidade de inspeção por parte do comprador, ou terceiros contratados para essa finalidade.
5. Se o prazo de entrega for prorrogado por quaisquer dos motivos indicados na referida cláusula, eventuais correções nos preços serão calculadas em função das novas datas de entrega, comunicado o comprador.

Reajuste de Preços:
Os preços dos produtos da Valle Nevado Chocolates serão corrigidos conforme indicado nas ofertas e/ou confirmação do pedido.

Transporte, Seguro e Embalagem:
As despesas de transporte e seguro ficam a cargo do comprador, exceto quando contrário indicado na proposta. Embalagens padrão da Valle Nevado Chocolates integram os escopos de fornecimento.
A Valle Nevado Chocolates se reserva o direito de não aceitar quaisquer solicitações de prorrogação nos vencimentos de notas fiscais, em função de diferenças entre datas de faturamento e de entrega, ou retirada, de mercadorias por transportadoras.

Garantia:
A Valle Nevado Chocolates garante o perfeito funcionamento de seus produtos por um período de 12 (doze) meses, a contar da data de emissão da nota fiscal.
A garantia é válida desde que respeitados os limites de uso, instalação e demais condições operacionais e de manutenção estabelecidos por ocasião da compra.
A Valle Nevado Chocolates não é responsável por danos devidos à negociação, negligência, manuseio, manutenção ou aplicação inadequadas.

Alterações de Pedido:
Eventuais alterações deverão ser solicitadas, formalmente, à Valle Nevado Chocolates. O comprador obriga-se a arcar com eventuais custos decorrentes da alteração e aqueles incorridos até o momento da solicitação, bem como aceitar eventuais mudanças nos prazos de entrega inicialmente estabelecidos.

Documentação e Inspeção:
Documentações e/ou testes especiais serão cobrados à parte, mediante negociação prévia.
Caso a inspeção não seja efetuada pelo comprador, ou por terceiros contratados, em 7 (sete) dias úteis após a comunicação formal, a Valle Nevado Chocolates reserva-se o direito de faturar os equipamentos para entrega futura.

Cancelamento do Pedido:
O cancelamento do pedido deverá ser comunicado formalmente à Valle Nevado Chocolates, antes da data prevista para a entrega, sendo admissível nas seguintes hipóteses:
1. Impossibilite no cumprimento das condições do pedido, por responsabilidade comprovada da Valle Nevado Chocolates.
2. Por motivo de força maior, caso fortuito, ou fato irresistível conforme o Código Civil Brasileiro.
3. Nos casos de inadimplência, falência, concordata ou insolvência do comprador.
4. Nos casos previstos em Lei.
5. Nos casos de fornecimentos destinados a outros países, serão consideradas as relações diplomáticas e/ou eventuais embargos que possam sujeitar a Valle Nevado Chocolates às restrições legais de caráter internacional.

Parágrafo único: Uma vez confirmado o cancelamento, o comprador obriga-se a arcar com todos os custos decorrentes, até a data de sua efetivação.

Multas:
A Valle Nevado Chocolates reserva-se o direito de não aceitar quaisquer imposições de multas pelo descumprimento das condições do pedido, salvo se previamente acordado.

Ética:
A Valle Nevado Chocolates e seus colaboradores se comprometem com o comportamento ético. Clientes e fornecedores (incluindo seus colaboradores e prepostos) concordam em cumprir integralmente qualquer lei antissuborno e anticorrupção aplicáveis, assim como comprometem-se a tomar ciência e fazer cumprir na íntegra o Código de Ética da Valle Nevado Chocolates.

Foro:
Fica eleito pelas partes de forma irrevogável e irretratável o foro da Comarca de Porto Feliz/SP, para dirimir qualquer dúvida ou litígio oriundo deste contrato, renunciando, expressamente, a qualquer outro, mais privilegiado que seja.`;

function generateProposalPDF(proposal, seller, res) {
  const company  = 'Nevado Ind. Imp. e Exp. de Alimentos Ltda - EPP';
  const cnpj     = '06.180.906/0001-11';
  const address  = 'Rodovia Marechal Rondon SP300 KM 135,5 – Canguera – Porto Feliz/SP – CEP 18540-850';
  const phone    = '(15) 3261-3318';
  const site     = 'www.chocolatesnevado.com.br';
  const emailCom = 'comercial@chocolatesnevado.com.br';

  const items    = JSON.parse(proposal.items || '[]');
  const extra    = (() => { try { return JSON.parse(proposal.extra || '{}'); } catch(e){ return {}; } })();

  const R_DARK   = '#1a2e5a';
  const R_RED    = '#C8102E';
  const R_YELLOW = '#FFD700';

  const doc = new PDFDocument({ margin: 45, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=proposta-${proposal.id}.pdf`);
  doc.pipe(res);

  // ── HEADER ──────────────────────────────────────────────────
  const logoBuffer = Buffer.from(LOGO_B64, 'base64');
  doc.image(logoBuffer, 45, 20, { height: 55 });

  // Dados empresa (direita)
  doc.fillColor(R_DARK).font('Helvetica-Bold').fontSize(8)
     .text(company, 280, 22, { width: 270, align: 'right' });
  doc.fillColor('#555').font('Helvetica').fontSize(7.5)
     .text(`CNPJ: ${cnpj}`, 280, 33, { width: 270, align: 'right' })
     .text(address, 280, 43, { width: 270, align: 'right' })
     .text(`Tel: ${phone}  |  ${site}`, 280, 53, { width: 270, align: 'right' })
     .text(emailCom, 280, 63, { width: 270, align: 'right' });

  // Linha separadora
  doc.moveTo(45, 82).lineTo(doc.page.width - 45, 82).strokeColor('#D1D5DB').lineWidth(0.5).stroke();

  // ── PARA / DE ────────────────────────────────────────────────
  let y = 92;
  const col1 = 45, col2 = 320;

  doc.fillColor('#333').font('Helvetica').fontSize(8);
  const paraData = [
    ['Para:', proposal.client_name],
    ['Atenção:', extra.atencao || '—'],
    ['Dept.:', extra.dept || '—'],
    ['Fone:', proposal.client_tel || '—'],
    ['E-mail:', proposal.client_email],
    ['CNPJ:', proposal.client_cnpj || '—'],
  ];
  const deData = [
    ['Data:', new Date(proposal.created_at).toLocaleDateString('pt-BR')],
    ['De:', seller.name],
    ['E-mail:', seller.email],
    ['Vendedor:', seller.name],
    ['Contato:', `${emailCom} | ${phone}`],
  ];

  paraData.forEach((row, i) => {
    doc.font('Helvetica-Bold').fillColor('#333').text(row[0], col1, y + i*13, { width: 65 });
    doc.font('Helvetica').fillColor('#333').text(row[1], col1 + 68, y + i*13, { width: 220 });
  });
  deData.forEach((row, i) => {
    doc.font('Helvetica-Bold').fillColor('#333').text(row[0], col2, y + i*13, { width: 55 });
    doc.font('Helvetica').fillColor('#333').text(row[1], col2 + 58, y + i*13, { width: 185 });
  });

  y += 90;
  doc.moveTo(45, y).lineTo(doc.page.width - 45, y).strokeColor('#D1D5DB').lineWidth(0.5).stroke();

  // ── TÍTULO PROPOSTA ──────────────────────────────────────────
  y += 10;
  doc.fillColor(R_DARK).font('Helvetica-Bold').fontSize(11)
     .text(`PROPOSTA COMERCIAL Nº ${proposal.id}`, col1, y);
  doc.fillColor('#555').font('Helvetica').fontSize(8)
     .text(`Referência: ${extra.referencia || proposal.notes || '—'}`, col1, y + 14);

  // ── TABELA DE ITENS ──────────────────────────────────────────
  y += 36;
  const colW = [20, 300, 50, 70, 80];
  const colX = [45, 68, 368, 420, 492];
  const headers = ['Item', 'Descrição', 'Qtd.', 'Preço Unit.', 'Total'];

  // Cabeçalho tabela
  doc.rect(45, y, doc.page.width - 90, 16).fill(R_DARK);
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(8);
  headers.forEach((h, i) => {
    doc.text(h, colX[i], y + 4, { width: colW[i], align: i > 1 ? 'right' : 'left' });
  });
  y += 16;

  // Linhas
  let runTotal = 0;
  items.forEach((item, idx) => {
    const sub = item.qty * item.price;
    runTotal += sub;
    const bg = idx % 2 === 0 ? '#fff' : '#F8F9FB';
    const rowH = 16;
    doc.rect(45, y, doc.page.width - 90, rowH).fill(bg);
    doc.rect(45, y, doc.page.width - 90, rowH).stroke('#E5E7EB');
    doc.fillColor('#222').font('Helvetica').fontSize(8)
       .text(String(idx + 1), colX[0], y + 4, { width: colW[0] })
       .text(item.desc, colX[1], y + 4, { width: colW[1] })
       .text(String(item.qty), colX[2], y + 4, { width: colW[2], align: 'right' })
       .text(`R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, colX[3], y + 4, { width: colW[3], align: 'right' })
       .text(`R$ ${sub.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, colX[4], y + 4, { width: colW[4], align: 'right' });
    y += rowH;
  });

  // Total
  doc.rect(45, y, doc.page.width - 90, 20).fill(R_RED);
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(9)
     .text('PREÇO TOTAL:', colX[1], y + 5, { width: 250 })
     .text(`R$ ${runTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, colX[4], y + 5, { width: colW[4], align: 'right' });
  y += 28;

  // ── CONDIÇÕES COMERCIAIS ─────────────────────────────────────
  doc.moveTo(45, y).lineTo(doc.page.width - 45, y).strokeColor('#D1D5DB').lineWidth(0.5).stroke();
  y += 8;
  doc.fillColor(R_DARK).font('Helvetica-Bold').fontSize(9).text('CONDIÇÕES COMERCIAIS:', 45, y);
  y += 14;

  const comerciais = [
    ['Destino do material:', extra.destino || '—'],
    ['Impostos:', extra.impostos || '—'],
    ['Pagamento:', `${proposal.pagto || '—'} – sujeito à análise de crédito`],
    ['Validade dos preços:', proposal.validity ? new Date(proposal.validity).toLocaleDateString('pt-BR') : '—'],
    ['Prazo de entrega:', extra.prazo_entrega || proposal.prazo || '—'],
    ['Local de entrega:', extra.local_entrega || '—'],
    ['Valor mínimo:', extra.valor_minimo || '—'],
  ];

  doc.font('Helvetica').fontSize(8);
  comerciais.forEach(([label, value]) => {
    doc.fillColor('#333').font('Helvetica-Bold').text(label, 45, y, { width: 130, continued: false });
    doc.fillColor('#333').font('Helvetica').text(value, 180, y, { width: 375 });
    y += 13;
  });

  // Observações
  if (proposal.notes) {
    y += 4;
    doc.fillColor(R_DARK).font('Helvetica-Bold').fontSize(9).text('OBSERVAÇÕES:', 45, y);
    y += 12;
    doc.fillColor('#333').font('Helvetica').fontSize(8).text(proposal.notes, 45, y, { width: doc.page.width - 90 });
    y += doc.heightOfString(proposal.notes, { width: doc.page.width - 90 }) + 8;
  }

  // ── CONDIÇÕES GERAIS (nova página) ───────────────────────────
  doc.addPage();
  doc.fillColor(R_DARK).font('Helvetica-Bold').fontSize(10)
     .text('CONDIÇÕES GERAIS DE VENDAS', 45, 45, { align: 'center', width: doc.page.width - 90 });
  doc.moveTo(45, 62).lineTo(doc.page.width - 45, 62).strokeColor('#D1D5DB').lineWidth(0.5).stroke();

  // Divide o texto em seções
  const sections = CONDITIONS.split('\n\n').filter(s => s.trim());
  let cy = 70;
  sections.forEach(section => {
    const lines = section.split('\n');
    const title = lines[0];
    const body  = lines.slice(1).join('\n');

    if (cy > doc.page.height - 80) { doc.addPage(); cy = 45; }

    if (title === 'CONDIÇÕES GERAIS DE VENDAS') return; // já no cabeçalho

    doc.fillColor(R_DARK).font('Helvetica-Bold').fontSize(8).text(title, 45, cy, { width: doc.page.width - 90 });
    cy += 12;

    if (body) {
      doc.fillColor('#333').font('Helvetica').fontSize(7.5)
         .text(body, 45, cy, { width: doc.page.width - 90, align: 'justify' });
      cy += doc.heightOfString(body, { width: doc.page.width - 90, fontSize: 7.5 }) + 8;
    }
  });

  // ── FOOTER em todas as páginas ───────────────────────────────
  const pages = doc.bufferedPageRange ? doc.bufferedPageRange() : { count: 1 };
  const footerY = doc.page.height - 35;
  doc.moveTo(45, footerY).lineTo(doc.page.width - 45, footerY).strokeColor('#D1D5DB').lineWidth(0.3).stroke();
  doc.fillColor('#999').font('Helvetica').fontSize(7)
     .text(
       `Valle Nevado Chocolates – ${address} | Tel: ${phone} | ${emailCom} | ${site}`,
       45, footerY + 6, { width: doc.page.width - 90, align: 'center' }
     );

  doc.end();
}

module.exports = { generateProposalPDF };
