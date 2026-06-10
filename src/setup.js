// src/setup.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./database');

async function setup() {
  await db.init();
  console.log('\n🍫  Valle Nevado — Configurando banco de dados...\n');

  const adminEmail = 'admin@chocolatesnevado.com.br';
  const adminPass  = 'admin123';
  const exists = await db.prepare('SELECT id FROM users WHERE email = $1').get(adminEmail);
  if (!exists) {
    const hash = bcrypt.hashSync(adminPass, 10);
    await db.prepare(`INSERT INTO users (name, email, password, role, color, goal) VALUES ($1, $2, $3, 'admin', '#C8102E', 999999)`)
      .run('Administrador', adminEmail, hash);
    console.log('✅  Admin criado:');
    console.log(`    E-mail: ${adminEmail}`);
    console.log(`    Senha:  admin123\n`);
  } else {
    console.log('✅  Admin já existe, nada alterado.\n');
  }

  console.log('🚀  Agora rode: npm start\n');
  process.exit(0);
}

setup().catch(e => { console.error(e); process.exit(1); });