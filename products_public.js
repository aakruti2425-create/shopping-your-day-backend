const express = require('express');
const router = express.Router();
const db = require('../db').db;

// list products
router.get('/', (req,res)=>{
  const page = Math.max(1, parseInt(req.query.page||'1'));
  const per = Math.min(50, parseInt(req.query.per||'20'));
  const offset = (page-1)*per;
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?').all(per, offset);
  res.json(rows.map(r=>({ ...r, images: JSON.parse(r.images||'[]') })));
});

// search
router.get('/search', (req,res)=>{
  const q = (req.query.q||'').trim();
  if(!q) return res.json([]);
  const like = '%' + q + '%';
  const rows = db.prepare('SELECT * FROM products WHERE title LIKE ? OR description LIKE ? OR category LIKE ? LIMIT 200').all(like, like, like);
  res.json(rows.map(r=>({ ...r, images: JSON.parse(r.images||'[]') })));
});

// details
router.get('/:id', (req,res)=>{
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if(!row) return res.status(404).json({ error: 'Not found' });
  row.images = JSON.parse(row.images||'[]');
  res.json(row);
});

module.exports = router;
