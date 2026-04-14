# CakeCraft - Product Requirements Document

## Original Problem Statement
Convert a full-stack cake shop project from React to pure HTML/CSS/JS frontend, keeping FastAPI backend untouched. Then fix auth, add missing pages, and complete the shopping flow.

## Architecture
- **Frontend**: Pure HTML, CSS, vanilla JavaScript (static site, Vercel-ready)
- **Backend**: FastAPI + MongoDB (Render-ready)
- **Auth**: JWT Bearer token stored in localStorage

## What's Been Implemented (Jan 2026)

### Pages Created
- [x] `index.html` - Home page with hero, cake grid, search & category filter
- [x] `login.html` - Login with email/password
- [x] `signup.html` - Registration with name/email/password
- [x] `forgot-password.html` - Password reset request
- [x] `product-detail.html` - Cake details with Add to Cart (weight/flavor/date selector, dynamic pricing)
- [x] `cart.html` - Cart with item management, checkout form, place order
- [x] `orders.html` - Customer order history with status badges
- [x] `admin.html` - Admin dashboard with stats
- [x] `admin-cakes.html` - Admin cake CRUD (add/edit/delete/toggle stock)
- [x] `admin-orders.html` - Admin order management with status filters + update (pending/confirmed/delivered/cancelled)
- [x] `admin-users.html` - Admin user list with search

### Features
- JWT Bearer token auth (login/register return token in body)
- Cart: add items with weight/flavor/message/date, remove items, view summary
- Checkout: delivery details form, COD payment, creates order + clears cart
- Customer order history page
- Admin order status update via dropdown (confirm/deliver/cancel)
- Admin order filtering by status
- Dynamic cake pricing by weight (500g/1kg/1.5kg/2kg)
- Responsive design, toast notifications, password toggle
- vercel.json for static deployment

## File Structure
```
/app/frontend/
├── index.html, login.html, signup.html, forgot-password.html
├── product-detail.html, cart.html, orders.html
├── admin.html, admin-cakes.html, admin-orders.html, admin-users.html
├── css/style.css
├── js/app.js
├── serve.py
└── vercel.json
```

## Testing Results
- Backend: 100%
- Frontend: 100%
- Integration: 100%

## Remaining Backlog
### P1
- Password reset page (reset-password.html)
- Dark mode toggle

### P2
- Favorites/Wishlist page
- Waitlist notifications
- Order email confirmation
- Image upload for cakes
