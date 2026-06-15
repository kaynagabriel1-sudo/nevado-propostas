// src/database.js — PostgreSQL via Neon
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'seller',
    color TEXT DEFAULT '#C8102E',
    goal REAL DEFAULT 40000,
    active INTEGER DEFAULT 1,
    photo TEXT,
    created_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );
  CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_cnpj TEXT,
    client_tel TEXT,
    client_cidade TEXT,
    pagto TEXT,
    prazo TEXT,
    seller_id INTEGER NOT NULL,
    value REAL DEFAULT 0,
    status TEXT DEFAULT 'Pendente',
    validity TEXT,
    notes TEXT,
    items TEXT,
    sent_at TEXT,
    extra TEXT DEFAULT '{}',
    review_token TEXT,
    created_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );
  CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    cpf_cnpj TEXT,
    state_registration TEXT,
    tax_regime TEXT,
    cep TEXT,
    street TEXT,
    number TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    created_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    proposal_id TEXT NOT NULL,
    qualidade INTEGER,
    atendimento INTEGER,
    prazo INTEGER,
    expectativas TEXT,
    melhorias TEXT,
    comentario TEXT,
    created_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );
  CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    proposal_id TEXT,
    to_email TEXT,
    subject TEXT,
    status TEXT,
    error TEXT,
    sent_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );
`;

class DB {
  constructor() { this._ready = false; }

  async init() {
    await pool.query(SCHEMA);
    // Add review_token column if it doesn't exist (migration)
    try {
      await pool.query("ALTER TABLE proposals ADD COLUMN IF NOT EXISTS review_token TEXT");
    } catch(e) {}
    try {
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS photo TEXT");
    } catch(e) {}
    this._ready = true;
    return this;
  }

  prepare(sql) {
    let i = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++i}`);
    return {
      async run(...params) {
        const res = await pool.query(pgSql, params);
        return { lastInsertRowid: res.rows[0]?.id };
      },
      async get(...params) {
        const res = await pool.query(pgSql, params);
        return res.rows[0];
      },
      async all(...params) {
        const res = await pool.query(pgSql, params);
        return res.rows;
      },
      runSync(...params) { return pool.query(pgSql, params); },
      getSync(...params) { return pool.query(pgSql, params).then(r => r.rows[0]); },
      allSync(...params) { return pool.query(pgSql, params).then(r => r.rows); }
    };
  }

  async exec(sql) {
    await pool.query(sql);
  }

  pragma() {}
}

module.exports = new DB();
