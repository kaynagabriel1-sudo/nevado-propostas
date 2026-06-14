const fs = require('fs');
let f = fs.readFileSync('public/index.html', 'utf8');

let count = 0;
f = f.replace(/<div class="sb-item" onclick="nav\('clientes'/g, (match) => {
  count++;
  if (count > 1) return '<!-- removido -->';
  return match;
});

fs.writeFileSync('public/index.html', f);
console.log('OK');
const lines = f.split('\n').filter(l => l.includes('sb-item') && l.includes('nav('));
lines.forEach(l => console.log(l.trim()));