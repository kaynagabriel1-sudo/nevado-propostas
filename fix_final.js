const fs = require('fs');

// Lê o arquivo atual para pegar apenas o conteúdo que não mudou
let f = fs.readFileSync('public/index.html', 'utf8');

// Extrai o LOGO base64 (é muito grande para colocar aqui)
const logoMatch = f.match(/src="(data:image\/png;base64,[^"]+)"/);
const LOGO = logoMatch ? logoMatch[1] : '';

// Monta o menu correto
const menuCorreto = `    <nav class="sb-nav">
      <div class="sb-sec">Menu</div>
      <div class="sb-item on" onclick="nav('dash',this)"><i class="ti ti-layout-dashboard"></i> Dashboard</div>
      <div class="sb-item" onclick="nav('propostas',this)"><i class="ti ti-file-text"></i> Propostas <span class="sb-badge" id="bdg" style="display:none">0</span></div>
      <div class="sb-item" onclick="nav('nova',this)"><i class="ti ti-plus"></i> Nova Proposta</div>
      <div class="sb-item" onclick="nav('clientes',this)"><i class="ti ti-address-book"></i> Clientes</div>
      <div class="sb-sec admin-only">Gestão</div>
      <div class="sb-item admin-only" onclick="nav('vendedores',this)"><i class="ti ti-users"></i> Vendedores</div>
      <div class="sb-item" onclick="nav('relatorios',this)"><i class="ti ti-chart-bar"></i> Relatórios</div>
      <div class="sb-sec">Config.</div>
      <div class="sb-item" onclick="nav('config',this)"><i class="ti ti-settings"></i> Configurações</div>
    </nav>`;

// Substitui o bloco nav inteiro
const navStart = f.indexOf('<nav class="sb-nav">');
const navEnd = f.indexOf('</nav>') + 6;
f = f.substring(0, navStart) + menuCorreto + f.substring(navEnd);

fs.writeFileSync('public/index.html', f);

// Verifica
const nav = f.substring(f.indexOf('<nav class="sb-nav">'), f.indexOf('</nav>') + 6);
const count = (nav.match(/nav\('clientes'/g) || []).length;
console.log('Clientes no menu:', count, count === 1 ? '✅' : '❌');
nav.split('\n').filter(l => l.includes('sb-item') || l.includes('sb-sec')).forEach(l => console.log(l.trim()));