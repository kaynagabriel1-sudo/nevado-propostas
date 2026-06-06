// src/middleware/auth.js

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.redirect('/login');
}

function requireAdmin(req, res, next) {
  // verifica tanto 'role' quanto 'userRole' para garantir compatibilidade
  const role = req.session && (req.session.userRole || req.session.role);
  if (role === 'admin') return next();
  res.status(403).json({ error: 'Acesso restrito a administradores.' });
}

module.exports = { requireAuth, requireAdmin };
