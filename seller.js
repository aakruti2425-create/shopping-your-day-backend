const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db').db;
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// seller signup
router.post('/signup', async (req,res)=>{
  const { name, email, phone, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try{
    const stmt = db.prepare('INSERT INTO users (name,email,phone,password_hash,role) VALUES (?,?,?,?,?)');
    const info = stmt.run(name,email,phone,hash,'seller');
    const user = { id: info.lastInsertRowid, name, email, role:'seller' };
    const token = jwt.sign(user, JWT_SECRET);
    res.json({ user, token });
  }catch(e){
    res.status(400).json({ error: e.message });
  }
});

// seller login
router.post('/login', (req,res)=>{
  const { email, password } = req.body;
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if(!row) return res.status(400).json({ error: 'Invalid credentials' });
  bcrypt.compare(password, row.password_hash).then(ok=>{
    if(!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = jwt.sign(user, JWT_SECRET);
    res.json({ user, token });
  });
});

// add product
router.post('/products', auth.requireAuth, auth.requireRole('seller'), upload.array('images',6), (req,res)=>{
  const sellerId = req.user.id;
  const { title, description, price, stock, category } = req.body;
  const images = (req.files||[]).map(f=>f.filename);
  const stmt = db.prepare('INSERT INTO products (seller_id,title,description,price,stock,category,images) VALUES (?,?,?,?,?,?,?)');
  const info = stmt.run(sellerId, title, description, parseInt(price||0,10), parseInt(stock||0,10), category||'', JSON.stringify(images));
  res.json({ id: info.lastInsertRowid });
});

// edit product
router.put('/products/:id', auth.requireAuth, auth.requireRole('seller'), upload.array('images',6), (req,res)=>{
  const sellerId = req.user.id;
  const id = req.params.id;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if(!existing) return res.status(404).json({ error: 'Not found' });
  if(existing.seller_id !== sellerId) return res.status(403).json({ error: 'Forbidden' });
  const { title, description, price, stock, category } = req.body;
  let images = JSON.parse(existing.images||'[]');
  if(req.files && req.files.length) images = req.files.map(f=>f.filename);
  db.prepare('UPDATE products SET title=?,description=?,price=?,stock=?,category=?,images=? WHERE id=?')
    .run(title, description, parseInt(price||0,10), parseInt(stock||0,10), category||'', JSON.stringify(images), id);
  res.json({ ok:true });
});

// delete
router.delete('/products/:id', auth.requireAuth, auth.requireRole('seller'), (req,res)=>{
  const sellerId = req.user.id;
  const id = req.params.id;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if(!existing) return res.status(404).json({ error: 'Not found' });
  if(existing.seller_id !== sellerId) return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ ok:true });
});

// list seller products
router.get('/products', auth.requireAuth, auth.requireRole('seller'), (req,res)=>{
  const sellerId = req.user.id;
  const rows = db.prepare('SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC').all(sellerId);
  res.json(rows.map(r=>({ ...r, images: JSON.parse(r.images||'[]') })));
});

module.exports = router;
