# CLAUDE.md — Backend

This file provides guidance to Claude Code when working with the backend of this project.

## Commands

- `npm install` — install dependencies (run once)
- `npm run dev` — start dev server with nodemon (watches for changes)
- `npm run server` — start with nodemon (alias for dev)
- `npm start` — start production server (no file watching)

Server runs on `http://localhost:5000` by default (set `PORT` in `.env`).

## Setup

1. Create `.env` from `.env.example` and fill in:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `DATABASE_PASSWORD` — password extracted from the URI
   - `JWT_SECRET` — random string for signing tokens (e.g., `openssl rand -hex 32`)
   - `PORT` — server port (default 5000)

2. Database auto-connects on server start via `config/db.js`.

## Architecture

Node.js + Express + MongoDB. Routes → Controllers → Models pattern.

### Structure

```
backend/
├── config/
│   └── db.js                 (MongoDB connection, handles env var substitution)
├── models/
│   ├── User.js               (auth, profile, password hashing)
│   ├── Product.js            (catalog)
│   ├── Order.js              (order history, shipping)
│   ├── Cart.js               (user cart items)
│   └── Wishlist.js           (user wishlist items)
├── controllers/
│   ├── authController.js     (register, login, logout)
│   ├── productController.js  (product CRUD, filtering)
│   ├── cartController.js     (add/remove/update cart)
│   ├── wishlistController.js (add/remove wishlist)
│   ├── orderController.js    (create order, track status)
│   └── userController.js     (profile get/update)
├── routes/
│   ├── auth.js               (POST /register, /login, /logout)
│   ├── products.js           (GET /products, POST /products, etc.)
│   ├── cart.js               (GET, POST, PUT, DELETE cart items)
│   ├── wishlist.js           (GET, POST, DELETE wishlist items)
│   ├── orders.js             (POST order, GET user orders)
│   └── users.js              (GET/PUT profile)
├── middleware/
│   ├── auth.js               (JWT verification, sets req.userId)
│   └── errorHandler.js       (centralized error handling)
├── server.js                 (Express setup, route mounting)
└── package.json
```

### Request Flow

1. HTTP request arrives → `server.js` routes to appropriate controller
2. Protected routes (cart, wishlist, orders, users) check `authMiddleware` first
3. `authMiddleware` verifies JWT token from `Authorization: Bearer <token>` header, sets `req.userId`
4. Controller calls model methods, returns JSON response
5. Errors caught and passed to `errorHandler` middleware

### Authentication

JWT-based. No sessions.

- `POST /api/auth/register` — creates user, hashes password with bcrypt, returns JWT
- `POST /api/auth/login` — verifies password, returns JWT (valid 7 days)
- Protected endpoints read `req.userId` (set by `authMiddleware`) to filter user-specific data

User model has methods `correctPassword()` (compare plaintext to hash) and `changedPasswordAfter()` (password reset feature, not yet wired).

### Models

Each model is a Mongoose schema. Key patterns:

- `User` — email unique, password hashed pre-save, `select: false` hides password from queries by default
- `Product`, `Order`, `Cart`, `Wishlist` — reference User via `mongoose.Schema.Types.ObjectId` with `ref` for population
- All have `timestamps: true` (adds `createdAt`, `updatedAt`)

When querying related data, use `.populate()` to fetch referenced documents. E.g., `Cart.findOne({user: userId}).populate('items.product')`.

### Controllers

Each controller exports functions that:
1. Extract data from `req` (body, params, userId from auth middleware)
2. Query/mutate models
3. Return `{ success: true/false, data }` JSON
4. `next(err)` on errors (passes to `errorHandler`)

No explicit try-catch in routes — all wrapped in controller try-catch with `next(err)`.

### Product Filtering

`GET /api/products` supports query strings:
- `?category=mens-shirts` — filter by category
- `?search=shirt` — case-insensitive title search
- `?sort=price-asc` or `price-desc` — sort by price

Multiple filters can combine: `?category=shoes&sort=price-asc`.

### Cart & Wishlist Workflow

- **Cart**: stores quantity per product. `POST /api/cart` with `{productId, quantity}` adds or increments. `PUT /api/cart/:productId` updates quantity. Delete quantity ≤ 0 removes item.
- **Wishlist**: simple array of product IDs. No quantity tracking.

Both create empty document on first add if user has none yet.

### Order Creation

`POST /api/orders` requires auth. Reads user's cart (must not be empty), creates Order doc with cart items and total price, clears cart. Order starts in `pending` status; admin can update via `PUT /api/orders/:id`.

## Common Tasks

**Add a new endpoint:**
1. Create/update controller function
2. Add route in `routes/` file
3. Mount route in `server.js` if new file
4. Test with curl/Postman

**Add a field to a model:**
1. Edit schema in `models/`
2. Update controller if field needs special handling (e.g., validation)
3. If breaking (removes field), no migration needed — MongoDB is schema-less

**Protect a route:**
1. Import `authMiddleware` in route file
2. Call `router.use(authMiddleware)` before route (protects all below) or add to specific route: `router.get('/', authMiddleware, handler)`

**Debug a request:**
1. Add `console.log()` in controller
2. Server logs to terminal (restart not needed)
3. Check `.env` vars loaded correctly if connection fails
