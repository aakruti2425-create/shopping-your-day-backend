const express = require('express');
const router = express.Router();
const db = require('../db').db;
const auth = require('../middleware/auth');
const Razorpay = require('razorpay');

const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

// place order (customer)
router.post('/place', auth.requireAuth, async (req,res)=>{
  const { items, amount, payment_method, delivery_partner } = req.body;
  const userId = req.user.id;
  const sellerId = items && items.length ? items[0].seller_id : null;
  const stmt = db.prepare('INSERT INTO orders (user_id,seller_id,items,amount,status,delivery_partner) VALUES (?,?,?,?,?,?)');
  const info = stmt.run(userId, sellerId, JSON.stringify(items), parseInt(amount||0,10), payment_method==='COD'?'pending':'pending', delivery_partner||'');
  const orderId = info.lastInsertRowid;

  if(payment_method === 'ONLINE') {
    const options = {
      amount: amount*100, // in paise
      currency: 'INR',
      receipt: 'order_rcpt_' + orderId
    };
    try{
      const rorder = await razor.orders.create(options);
      db.prepare('UPDATE orders SET payment_info = ? WHERE id = ?').run(JSON.stringify({ razor_order_id: rorder.id }), orderId);
      return res.json({ orderId, razor_order: rorder });
    }catch(e){
      return res.status(500).json({ error: e.message });
    }
  } else {
    return res.json({ orderId });
  }
});

// get orders (customer)
router.get('/', auth.requireAuth, (req,res)=>{
  const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(rows.map(r=>({ ...r, items: JSON.parse(r.items||'[]') })));
});

module.exports = router;
