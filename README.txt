Shopping Your Day — Backend scaffold
==================================

What's included:
- Express server with SQLite (better-sqlite3)
- JWT auth (bcrypt + jsonwebtoken)
- Seller routes (signup/login/products CRUD)
- Public product routes + search
- Orders routes with Razorpay stub for payments
- Multer for image uploads (uploads/)

How to run (on your machine):
1) Install Node.js (latest LTS)
2) unzip this folder
3) cd shopping-your-day-fullstack
4) npm install
5) copy .env.example to .env and fill values (JWT_SECRET, Razorpay keys)
6) node index.js    (or npm run dev with nodemon)

Razorpay:
- You must create a Razorpay account and get test keys.
- The payment route creates an order with Razorpay and returns order_id for client to use.
