const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

exports.requireAuth = (req,res,next) => {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'No token' });
  const token = h.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch(e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

exports.requireRole = (role) => (req,res,next) => {
  if (!req.user) return res.status(401).json({ error: 'No user' });
  if (req.user.role !== role && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
