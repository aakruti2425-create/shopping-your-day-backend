require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// init database tables if not exist
require('./db').init();

// routes
app.use('/api/seller', require('./routes/seller'));
app.use('/api/products', require('./routes/products_public'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>{
  console.log('Server running on port', PORT);
  console.log('Open http://localhost:'+PORT);
});
