// src/server.js
require('dotenv').config();
const express  = require('express');
const session  = require('express-session');
const path     = require('path');
const fs       = require('fs');
const db       = require('./database');

const app = express();
if (!fs.existsSync('./data')) fs.mkdirSync('./data');

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

app.get('/login', (req, res) =>
  res.sendFile(path.join(__dirname, '../public/login.html')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '../public/index.html')));

const PORT = process.env.PORT || 3000;

// Inicializa banco antes de subir o servidor
db.init().then(() => {
  app.listen(PORT, () => {
    console.log('\n🍫  Valle Nevado — Sistema de Propostas');
    console.log(`🚀  Rodando em: http://localhost:${PORT}`);
    console.log('    Pressione Ctrl+C para parar\n');
  });
}).catch(err => {
  console.error('Erro ao iniciar banco:', err);
  process.exit(1);
});
