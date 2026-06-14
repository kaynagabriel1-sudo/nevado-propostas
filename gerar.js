const fs = require('fs');
let f = fs.readFileSync('public/index.html', 'utf8');

// Remove qualquer modal cliente existente
f = f.replace(/<!-- MODAL CLIENTE -->[\s\S]*?<\/div>\n\n<div class="toast-box"/, '<div class="toast-box"');

// Adiciona modal correto
const modal = `<!-- MODAL CLIENTE -->
<div class="ov" id="ov-client">
  <div class="modal" style="width:600px">
    <div class="modal-h"><h2 id="client-modal-title">Novo Cliente</h2><button class="close-x" onclick="closeOv('ov-client')">×</button></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="fg"><label class="flabel">Código</label><input class="finput" id="cl-code" disabled placeholder="Gerado automaticamente"></div>
      <div class="fg"><label class="flabel">Regime Tributário</label><select class="finput" id="cl-tax"><option value="">Selecionar...</option><option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option></select></div>
      <div class="fg" style="grid-column:1/-1"><label class="flabel">Nome *</label><input class="finput" id="cl-name" placeholder="Nome completo"></div>
      <div class="fg"><label class="flabel">E-mail</label><input class="finput" id="cl-email"></div>
      <div class="fg"><label class="flabel">Telefone</label><input class="finput" id="cl-phone"></div>
      <div class="fg"><label class="flabel">Empresa</label><input class="finput" id="cl-company"></div>
      <div class="fg"><label class="flabel">CPF/CNPJ</label><input class="finput" id="cl-cpf"></div>
      <div class="fg"><label class="flabel">Inscrição Estadual</label><input class="finput" id="cl-ie"></div>
      <div class="fg"><label class="flabel">CEP</label><input class="finput" id="cl-cep"></div>
      <div class="fg"><label class="flabel">Rua</label><input class="finput" id="cl-street"></div>
      <div class="fg"><label class="flabel">Número</label><input class="finput" id="cl-number"></div>
      <div class="fg"><label class="flabel">Bairro</label><input class="finput" id="cl-neighborhood"></div>
      <div class="fg"><label class="flabel">Cidade</label><input class="finput" id="cl-city"></div>
      <div class="fg"><label class="flabel">Estado</label><select class="finput" id="cl-state"><option value="">UF</option><option>AC</option><option>AL</option><option>AM</option><option>BA</option><option>CE</option><option>DF</option><option>ES</option><option>GO</option><option>MA</option><option>MT</option><option>MS</option><option>MG</option><option>PA</option><option>PB</option><option>PR</option><option>PE</option><option>PI</option><option>RJ</option><option>RN</option><option>RS</option><option>RO</option><option>RR</option><option>SC</option><option>SP</option><option>SE</option><option>TO</option></select></div>
    </div>
    <div class="modal-foot">
      <button class="btn" onclick="closeOv('ov-client')">Cancelar</button>
      <button class="btn btn-primary" onclick="saveClient()">Salvar</button>
    </div>
  </div>
</div>

`;

f = f.replace('<div class="toast-box" id="toast">', modal + '<div class="toast-box" id="toast">');

fs.writeFileSync('public/index.html', f);

const checks = [
  ["Menu Clientes", f.includes("nav('clientes',this)")],
  ["Pagina p-clientes", f.includes('id="p-clientes"')],
  ["Modal ov-client", f.includes('id="ov-client"')],
  ["JS renderClients", f.includes('renderClients')],
  ["p-clientes DENTRO do content", f.indexOf('id="p-clientes"') < f.indexOf('<!-- MODAL ADD SELLER -->')],
];
checks.forEach(([name, ok]) => console.log((ok ? '✅' : '❌') + ' ' + name));