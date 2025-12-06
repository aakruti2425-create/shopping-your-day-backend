const express = require('express');
const router = express.Router();
const db = require('../db').db;
const auth = require('../middleware/auth');

// admin: list all users
router.get('/users', auth.requireAuth, auth.requireRole('admin'), (req,res)=>{
  const rows = db.prepare('SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC').all();
  res.json(rows);
});

// admin: list all products
router.get('/products', auth.requireAuth, auth.requireRole('admin'), (req,res)=>{
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(rows.map(r=>({ ...r, images: JSON.parse(r.images||'[]') })));
});

// admin: list orders
router.get('/orders', auth.requireAuth, auth.requireRole('admin'), (req,res)=>{
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(rows.map(r=>({ ...r, items: JSON.parse(r.items||'[]') })));
});

module.exports = router;
