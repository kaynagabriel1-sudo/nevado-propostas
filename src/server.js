// src/server.js
require('dotenv').config();
const express  = require('express');
const session  = require('express-session');
const path     = require('path');
const db       = require('./database');
const bcrypt   = require('bcryptjs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'nevado-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 },
}));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/sellers',   require('./routes/sellers'));
app.use('/api/reports',   require('./routes/reports'));
app.use('/api/clients',   require('./routes/clients'));
app.use('/api/reviews',   require('./routes/reviews'));

app.get('/login', (req, res) =>
  res.sendFile(path.join(__dirname, '../public/login.html')));

// Public review page
app.get('/review/:token', (req, res) =>
  res.sendFile(path.join(__dirname, '../public/review.html')));

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '../public/index.html')));

db.init().then(async () => {
  const adminEmail = 'admin@chocolatesnevado.com.br';
  const exists = await db.prepare('SELECT id FROM users WHERE email = $1').get(adminEmail);
  if (!exists) {
    const hash = bcrypt.hashSync('admin123', 10);
    await db.prepare(`INSERT INTO users (name, email, password, role, color, goal) VALUES ($1, $2, $3, 'admin', '#C8102E', 999999)`)
      .run('Administrador', adminEmail, hash);
    console.log('✅  Admin criado automaticamente');
  }
  console.log('🍫  Valle Nevado — Sistema de Propostas');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀  Rodando em: http://localhost:${PORT}\n    Pressione Ctrl+C para parar`));
}).catch(e => { console.error(e); process.exit(1); });
