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

app.get('/login', (req, res) =>
  res.sendFile(path.join(__dirname, '.