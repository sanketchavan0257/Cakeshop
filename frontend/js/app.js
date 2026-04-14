/* ============ SVG Icons as inline functions ============ */
const Icons = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  shoppingBag: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  logOut: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
  layoutDashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  packages: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  dollar: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  trendUp: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  trendDown: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
};

/* ============ Toast System ============ */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ============ API Configuration ============ */
/*
 * DEPLOYMENT SETUP:
 * - For Vercel+Render: set BACKEND_URL below to your Render backend URL
 *   Example: const BACKEND_URL = 'https://your-backend.onrender.com';
 * - For same-origin (preview/local): leave as empty string ''
 */
const BACKEND_URL = '';
const API_BASE = (BACKEND_URL || window.location.origin) + '/api';

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();
  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
  const config = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...authHeaders, ...options.headers },
    ...options,
  };
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(url, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
  }
  return res.json();
}

/* ============ Auth Helpers ============ */
function getUser() {
  const u = localStorage.getItem('cakecraft_user');
  return u ? JSON.parse(u) : null;
}

function getToken() {
  return localStorage.getItem('cakecraft_token');
}

function saveAuth(userData, token) {
  localStorage.setItem('cakecraft_user', JSON.stringify(userData));
  if (token) localStorage.setItem('cakecraft_token', token);
}

function clearAuth() {
  localStorage.removeItem('cakecraft_user');
  localStorage.removeItem('cakecraft_token');
}

function requireAuth() {
  const user = getUser();
  if (!user) {
    window.location.href = '/login.html';
    return null;
  }
  return user;
}

function requireAdmin() {
  const user = requireAuth();
  if (user && user.role !== 'admin') {
    window.location.href = '/';
    return null;
  }
  return user;
}

/* Check auth status on page load */
async function checkAuthStatus() {
  try {
    const data = await apiCall('/auth/me');
    saveAuth(data);
    return data;
  } catch {
    clearAuth();
    return null;
  }
}

/* ============ Navbar Builder ============ */
function buildNavbar(containerId) {
  const user = getUser();
  const container = document.getElementById(containerId);
  if (!container) return;

  let navLinks = '';
  let mobileLinks = '';

  if (user) {
    navLinks = `
      ${user.role === 'admin' ? `<a href="/admin.html" class="nav-btn" data-testid="admin-link">${Icons.layoutDashboard} Admin</a>` : ''}
      <a href="/" class="nav-btn" data-testid="home-link">${Icons.shoppingBag} Shop</a>
      <a href="/cart.html" class="nav-btn" data-testid="cart-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        Cart
      </a>
      <a href="/orders.html" class="nav-btn" data-testid="orders-link">${Icons.packages} Orders</a>
      <span class="nav-btn" style="cursor:default;opacity:0.7">${Icons.user} ${user.name || user.email}</span>
      <button class="nav-btn logout" onclick="handleLogout()" data-testid="logout-button">${Icons.logOut} Logout</button>
    `;
    mobileLinks = `
      <a href="/" class="nav-btn" data-testid="mobile-home-link">${Icons.shoppingBag} Shop</a>
      <a href="/cart.html" class="nav-btn" data-testid="mobile-cart-link">Cart</a>
      <a href="/orders.html" class="nav-btn" data-testid="mobile-orders-link">My Orders</a>
      ${user.role === 'admin' ? `<a href="/admin.html" class="nav-btn" data-testid="mobile-admin-link">${Icons.layoutDashboard} Admin Panel</a>` : ''}
      <button class="nav-btn logout" onclick="handleLogout()" data-testid="mobile-logout-button">${Icons.logOut} Logout</button>
    `;
  } else {
    navLinks = `
      <a href="/login.html" class="nav-btn" data-testid="login-link">Login</a>
      <a href="/signup.html" class="nav-btn primary" data-testid="register-link">Sign Up</a>
    `;
    mobileLinks = `
      <a href="/login.html" class="nav-btn" data-testid="mobile-login-link">Login</a>
      <a href="/signup.html" class="nav-btn primary" data-testid="mobile-register-link">Sign Up</a>
    `;
  }

  container.innerHTML = `
    <nav class="navbar" data-testid="main-navbar">
      <div class="navbar-inner">
        <div style="display:flex;align-items:center;gap:12px">
          <button class="mobile-menu-btn" onclick="toggleMobileNav()" data-testid="mobile-menu-button">${Icons.menu}</button>
          <a href="/" class="navbar-logo" data-testid="logo-link">CakeCraft</a>
        </div>
        <div class="navbar-links">${navLinks}</div>
      </div>
      <div class="mobile-nav" id="mobile-nav">${mobileLinks}</div>
    </nav>
  `;
}

function toggleMobileNav() {
  const nav = document.getElementById('mobile-nav');
  if (nav) nav.classList.toggle('open');
}

async function handleLogout() {
  try {
    await apiCall('/auth/logout', { method: 'POST', body: {} });
  } catch {}
  clearAuth();
  window.location.href = '/login.html';
}
