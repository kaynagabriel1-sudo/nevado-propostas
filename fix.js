const fs = require('fs');
let f = fs.readFileSync('public/index.html', 'utf8');
f = f.replace(
  'ti-address-book"></i> Clientes',
  'ti-address-book"></i> Clientes\n      <div class="sb-item" onclick="nav(\'relatorios\',this)"><i class="ti ti-chart-bar"></i> Relatórios'
);
fs.writeFileSync('public/index.html', f);
console.log('OK');