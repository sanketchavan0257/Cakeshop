# CakeCraft - Product Requirements Document

## Original Problem Statement
Build a full-stack cake shop e-commerce web application with React frontend, FastAPI (Python) backend, and MongoDB database. Features include cake products, cake weight selection (dynamic pricing), custom cake options (message, flavor, delivery date), cart system, order system, waitlist system, user dashboard, and admin panel.

## Tech Stack
- **Frontend:** React 19, TailwindCSS, Shadcn/UI, Framer Motion
- **Backend:** FastAPI (Python) — originally requested Node.js, but built in FastAPI and accepted
- **Database:** MongoDB (via Motor async driver)
- **Auth:** JWT (cookie-based httponly)
- **Email:** aiosmtplib (Gmail SMTP)

## Architecture
```
/app/
├── backend/
│   ├── .env
│   ├── requirements.txt
│   ├── server.py          # FastAPI application (all routes)
│   └── tests/
│       └── test_cake_shop.py
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── App.js
│       ├── components/    # Navbar, MobileSidebar, AddCakeModal, EditCakeModal
│       ├── contexts/      # AuthContext, ThemeContext
│       └── pages/         # All page components
```

## Completed Features

### Phase 1 — Core Setup (Done)
- React + FastAPI + MongoDB base application
- JWT authentication (register, login, logout)
- Admin user seeding (admin@cakeshop.com / Admin@123)
- Sample cake data seeding (8 cakes)
- CORS configuration

### Phase 2 — Admin Panel (Done)
- Shopify-style admin dashboard with stats
- Manage cakes (CRUD: add, edit, delete)
- Manage orders (view, update status)
- Manage users list

### Phase 3 — Auth Enhancements (Done)
- Forgot password flow with Gmail SMTP email
- Reset password with secure token
- Mobile responsive sidebar navigation

### Phase 4 — Cart & Checkout (Done)
- COD-only checkout with full delivery address
- Cart system (add, remove, clear)

### Phase 5 — Product Page Upgrade (Done - Apr 10, 2026)
- Quantity selector (+/- buttons, min 1, default 1)
- Dynamic price calculation (weight x quantity)
- Dual buttons: "Add to Cart" (outline) + "Order Now" (primary)
- "Order Now" bypasses cart → direct checkout with pre-filled item
- CartPage accepts both cart items and direct single order flows
- Backend: `is_direct_order` flag — only clears cart for cart-based orders
- All 22 backend tests + frontend UI tests passing (100%)

### Phase 6 — Admin Orders Expandable UI (Done - Apr 10, 2026)
- Collapsed rows: Order ID, Customer Name, Total, Status Badge, Payment Method
- Click chevron → smooth expand/collapse (framer-motion AnimatePresence)
- Expanded: Customer details (name, email, mobile highlighted), full address (street, taluka, city, state, pincode)
- Order items with quantity badge (x2), weight, flavor, delivery date, price
- Payment summary: method, status, total
- Status dropdown to update order status
- Only one order expanded at a time
- All frontend tests passing (100%)

### Phase 7 — Admin Delete Orders (Done - Apr 10, 2026)
- Single order delete: trash icon in expanded order → confirmation modal → DELETE /api/admin/orders/:id
- Bulk delete all: "Delete All Orders" button → strong confirmation modal → DELETE /api/admin/orders
- Confirmation modal with warning icon, cancel/confirm buttons, animated overlay
- Admin-only access enforced on both endpoints
- Order list auto-refreshes after deletion

## Key API Endpoints
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- `GET /api/cakes`, `GET /api/cakes/:id`, `POST /api/cakes`, `PUT /api/cakes/:id`, `DELETE /api/cakes/:id`
- `GET /api/cart`, `POST /api/cart`, `DELETE /api/cart/:id`, `DELETE /api/cart`
- `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`
- `POST /api/waitlist`, `GET /api/waitlist`
- `POST /api/favorites/:id`, `DELETE /api/favorites/:id`, `GET /api/favorites`
- `GET /api/admin/orders`, `PUT /api/admin/orders/:id`, `GET /api/admin/users`, `GET /api/admin/waitlist`, `GET /api/admin/stats`

## DB Schema
- `users`: {name, email, password_hash, role, created_at}
- `cakes`: {cake_id, name, description, base_price, image_url, category, stock, in_stock, flavors}
- `orders`: {order_id, user_id, user_name, user_email, user_mobile, address, items, total_amount, payment_method, payment_status, order_status, created_at}
- `cart`: {cart_item_id, user_id, cake_id, cake_name, cake_image, weight, flavor, message, delivery_date, quantity, price}
- `waitlist`: {waitlist_id, user_id, user_email, cake_id, cake_name, status}
- `favorites`: {favorite_id, user_id, cake_id, cake_name, cake_image}
- `password_reset_tokens`: {email, token, user_type, expires_at, used}

## P1 — Upcoming Tasks
- Add Taluka selection to address form (Kankavli, Vaibhavwadi dropdown)
- Razorpay online payment integration (alongside COD)
- User Dashboard page (Profile, Orders, Waitlist, Favorites)

## P2 — Future/Backlog
- Search & filter cakes improvements
- Dark/light mode toggle
- Waitlist notifications
