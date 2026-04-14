# CakeCraft - Product Requirements Document

## Original Problem Statement
Convert a full-stack cake shop project from React frontend to pure HTML, CSS, and vanilla JavaScript while keeping the FastAPI backend untouched.

## Architecture
- **Frontend**: Pure HTML, CSS, vanilla JavaScript (static site)
- **Backend**: FastAPI + MongoDB (unchanged from original)
- **Database**: MongoDB
- **Auth**: Cookie-based JWT authentication

## User Personas
1. **Customer** - Browse cakes, search/filter, view details
2. **Admin** - Manage cakes (CRUD), view dashboard stats, manage orders/users

## Core Requirements
- Login / Signup / Forgot Password
- Admin Panel with stats dashboard
- Add / Edit / Delete Products (Admin)
- View Products with search and category filter
- Product detail page

## What's Been Implemented (Jan 2026)
### Frontend Conversion Complete
- [x] Removed React completely (no package.json, no node_modules, no frameworks)
- [x] Created pure HTML pages: index.html, login.html, signup.html, forgot-password.html, admin.html, admin-cakes.html, product-detail.html
- [x] CSS design system matching original (Playfair Display + Outfit fonts, #D0B8A8 primary, #FAFAF7 background)
- [x] Vanilla JS with fetch API for all backend communication
- [x] Toast notification system
- [x] Responsive design
- [x] Admin dashboard with stats
- [x] Admin cake management (CRUD operations)
- [x] Search and category filter on home page
- [x] Password visibility toggle
- [x] Modal dialogs for add/edit/delete
- [x] vercel.json for static deployment
- [x] All data-testid attributes for testing

### Backend (Unchanged)
- FastAPI with all original endpoints
- MongoDB for data storage
- JWT cookie-based authentication
- Admin seeding on startup
- 8 sample cakes seeded

## Testing Results
- Backend: 100% (26/26 endpoints passed)
- Frontend: 98% (all core flows working)

## File Structure
```
/app/frontend/
├── index.html          # Home page (hero + cake grid)
├── login.html          # Login form
├── signup.html         # Registration form
├── forgot-password.html # Password reset request
├── admin.html          # Admin dashboard with stats
├── admin-cakes.html    # Cake CRUD management
├── product-detail.html # Cake detail page
├── css/style.css       # All styles
├── js/app.js           # All JavaScript (API, auth, utilities, icons)
├── serve.py            # Simple Python HTTP server (for preview)
└── vercel.json         # Vercel deployment config
```

## Prioritized Backlog
### P0 (Done)
- All core features implemented and tested

### P1 (Next)
- Cart functionality page
- Orders page for customers
- Admin orders management page
- Admin users management page

### P2 (Future)
- Dark mode toggle
- Favorites/Waitlist pages
- Password reset flow (reset-password.html)
- Mobile sidebar navigation improvements
- Image upload for cakes (instead of URL)

## Deployment Notes
- **Frontend (Vercel)**: Deploy the /frontend directory as static site. No build step needed. Update API_BASE in js/app.js to your Render backend URL.
- **Backend (Render)**: Deploy with `uvicorn server:app --host 0.0.0.0 --port 8001`. Set MONGO_URL and DB_NAME env vars.
