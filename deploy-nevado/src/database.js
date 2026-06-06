// src/database.js — usa sql.js (pure JavaScript, sem compilação nativa)
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || './data/propostas.db';
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'seller',
    color TEXT DEFAULT '#C8102E',
    goal REAL DEFAULT 40000,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now','localtime'))
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
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id TEXT,
    to_email TEXT,
    subject TEXT,
    status TEXT,
    error TEXT,
    sent_at TEXT DEFAULT (datetime('now','localtime'))
  );
`;

let _db = null;

function save() {
  const data = _db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

async function getDB() {
  if (_db) return _db;
  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    _db = new SQL.Database(buf);
  } else {
    _db = new SQL.Database();
  }
  _db.run(SCHEMA);
  save();
  return _db;
}

// Wrapper síncrono-like para manter compatibilidade com o resto do código
class DB {
  constructor() { this._ready = false; this._db = null; }

  async init() {
    this._db = await getDB();
    this._ready = true;
    return this;
  }

  prepare(sql) {
    const db = this._db;
    const self = this;
    return {
      run(...params) {
        db.run(sql, params);
        save();
        return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0][0] };
      },
      get(...params) {
        const res = db.exec(sql, params);
        if (!res.length || !res[0].values.length) return undefined;
        const cols = res[0].columns;
        const row = res[0].values[0];
        return Object.fromEntries(cols.map((c, i) => [c, row[i]]));
      },
      all(...params) {
        const res = db.exec(sql, params);
        if (!res.length) return [];
        const cols = res[0].columns;
        return res[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
      }
    };
  }

  exec(sql) { this._db.run(sql); save(); }

  pragma(s) {
    try { this._db.run(`PRAGMA ${s}`); } catch(e) {}
  }
}

module.exports = new DB();
