// src/setup.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./database');

async function setup() {
  await db.init();
  console.log('\n🍫  Valle Nevado — Configurando banco de dados...\n');

  // Apaga todos os vendedores de exemplo e propostas de teste
  db.exec('DELETE FROM proposals');
  db.exec("DELETE FROM users WHERE role = 'seller'");
  console.log('🗑️  Propostas de teste e vendedores de exemplo removidos.\n');

  // Cria somente o admin
  const adminEmail = 'admin@chocolatesnevado.com.br';
  const adminPass  = 'admin123';
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!exists) {
    const hash = bcrypt.hashSync(adminPass, 10);
    db.prepare(`INSERT INTO users (name, email, password, role, color, goal) VALUES (?, ?, ?, 'admin', '#C8102E', 999999)`)
      .run('Administrador', adminEmail, hash);
    console.log('✅  Admin criado:');
    console.log(`    E-mail: ${adminEmail}`);
    console.log(`    Senha:  admin123`);
    console.log('    ⚠️  Altere a senha após o primeiro acesso!\n');
  } else {
    // Limpa também o admin e recria para garantir senha limpa
    db.exec("DELETE FROM users WHERE role = 'admin'");
    const hash = bcrypt.hashSync(adminPass, 10);
    db.prepare(`INSERT INTO users (name, email, password, role, color, goal) VALUES (?, ?, ?, 'admin', '#C8102E', 999999)`)
      .run('Administrador', adminEmail, hash);
    console.log('✅  Admin redefinido:');
    console.log(`    E-mail: ${adminEmail}`);
    console.log(`    Senha:  admin123\n`);
  }

  console.log('ℹ️  Nenhum vendedor criado automaticamente.');
  console.log('    Acesse o sistema como Admin e cadastre os vendedores em: Gestão → Vendedores\n');
  console.log('🚀  Agora rode: npm start');
  console.log('🌐  Acesse:    http://localhost:3000\n');
  process.exit(0);
}

setup().catch(e => { console.error(e); process.exit(1); });
