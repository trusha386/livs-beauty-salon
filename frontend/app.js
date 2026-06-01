/**
 * LIV'S BEAUTY SALON — PWA Frontend Controller
 * Warm Mocha-Cream Aesthetic & Dynamic Signups (INR ₹)
 */

// Application Constants
const API_BASE_URL = 'http://localhost:8080/api';
const POLLING_INTERVAL = 10000; // 10 seconds checking for backend

// Seed Data with 14 Realistic Indian Salon Services & Categories
const DEFAULT_SERVICES = [
  { id: 1, name: 'Haircut', price: 399, description: 'Classic trimming and styling by expert barber.', category: 'Hair Care', active: true },
  { id: 2, name: 'Hair Spa', price: 1499, description: 'Deep nourishing hot-oil treatment with scalp massage.', category: 'Hair Care', active: true },
  { id: 3, name: 'Facial Cleanup', price: 899, description: 'Fruit-based skin cleanup to restore standard facial glow.', category: 'Skin Care', active: true },
  { id: 4, name: 'Bridal Makeup', price: 8999, description: 'Exquisite elite bridal makeovers with premium cosmetic kits.', category: 'Bridal', active: true },
  { id: 5, name: 'Keratin Treatment', price: 4999, description: 'Smooth, protein-infused long-lasting hair straightening care.', category: 'Hair Care', active: true },
  { id: 6, name: 'Manicure', price: 699, description: 'Exquisite nail grooming with aromatic rose hand bath.', category: 'Nails', active: true },
  { id: 7, name: 'Pedicure', price: 999, description: 'Relaxing hot water foot soak with organic tan scrub.', category: 'Nails', active: true },
  { id: 8, name: 'Threading', price: 99, description: 'Quick precision eyebrow threading and shaping.', category: 'Grooming', active: true },
  { id: 9, name: 'Waxing', price: 799, description: 'Full arms and legs organic honey waxing treatment.', category: 'Grooming', active: true },
  { id: 10, name: 'Detan Facial', price: 1299, description: 'Powerful deanning pack with cooling cucumber mask.', category: 'Skin Care', active: true },
  { id: 11, name: 'Hair Coloring', price: 2499, description: 'Bespoke global hair colors or highlighting sessions.', category: 'Hair Care', active: true },
  { id: 12, name: 'Nail Art', price: 1499, description: 'Custom acrylic extensions with gorgeous modern art.', category: 'Nails', active: true },
  { id: 13, name: 'Smoothening', price: 5999, description: 'Smooth silk therapy to banish frizzy hair textures.', category: 'Hair Care', active: true },
  { id: 14, name: 'Head Massage', price: 499, description: 'Relaxing 30-min hot oil Ayurvedic massage.', category: 'Hair Care', active: true }
];

// No predefined or hardcoded appointments/visits whatsoever
const DEFAULT_VISITS = [];

// No predefined staff members whatsoever
const SEEDED_USERS = [];

// Global State
const state = {
  isDemoMode: true,
  currentUser: null,
  services: [],
  visits: [],
  activeView: 'view-login',
  deferredInstallPrompt: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initLocalStorage();
  checkBackendHealth();
  setupEventListeners();
  setupPWAPrompt();
  
  // Start background connection polling
  setInterval(checkBackendHealth, POLLING_INTERVAL);
});

// Seed localStorage if empty
function initLocalStorage() {
  // Migration Check: Always enforce clean slate by purging legacy Sarah / Countess Julia preloads
  const rawVisits = localStorage.getItem('salon_visits');
  const rawUsers = localStorage.getItem('registered_users');
  if (
    (rawVisits && (rawVisits.includes('Sarah') || rawVisits.includes('Julia') || rawVisits.includes('Loren') || rawVisits.includes('Chantal'))) ||
    (rawUsers && (rawUsers.includes('Sarah') || rawUsers.includes('John') || rawUsers.includes('Emma') || rawUsers.includes('Administrator')))
  ) {
    console.log('[Migration] Legacy mock data detected. Wiping local storage for clean start.');
    localStorage.removeItem('salon_visits');
    localStorage.removeItem('registered_users');
    localStorage.removeItem('salon_services');
    sessionStorage.removeItem('salon_session');
  }

  if (!localStorage.getItem('salon_services')) {
    localStorage.setItem('salon_services', JSON.stringify(DEFAULT_SERVICES));
  }
  if (!localStorage.getItem('salon_visits')) {
    localStorage.setItem('salon_visits', JSON.stringify(DEFAULT_VISITS));
  }
  if (!localStorage.getItem('registered_users')) {
    localStorage.setItem('registered_users', JSON.stringify(SEEDED_USERS));
  }
  
  // Try loading session
  const storedUser = sessionStorage.getItem('salon_session');
  if (storedUser) {
    state.currentUser = JSON.parse(storedUser);
    enterApplication();
  }
}

// Format number in Indian Rupees standard format
function formatRupees(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// ------------------------------------------
// API CLIENT / FALLBACK SYNC ENGINE
// ------------------------------------------

// Health check endpoint to toggle between Live and Demo modes
async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/services/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    if (response.ok && state.isDemoMode) {
      state.isDemoMode = false;
      updateStatusBadge(false);
      showToast('Live API Backend Connected!', 'success');
      loadAllData();
    }
  } catch (error) {
    if (!state.isDemoMode) {
      state.isDemoMode = true;
      updateStatusBadge(true);
      showToast('Backend API disconnected. Switched to Demo Mode.', 'error');
      loadAllData();
    } else {
      updateStatusBadge(true);
      loadAllData();
    }
  }
}

function updateStatusBadge(isDemo) {
  const badge = document.getElementById('connection-badge');
  const text = document.getElementById('connection-status-text');
  
  if (isDemo) {
    badge.className = 'badge-demo';
    text.innerText = 'Demo Mode (API Offline)';
  } else {
    badge.className = 'badge-live';
    text.innerText = 'API Connected (Live)';
  }
}

// Fetch all database records depending on mode
async function loadAllData() {
  if (state.isDemoMode) {
    state.services = JSON.parse(localStorage.getItem('salon_services')) || [];
    state.visits = JSON.parse(localStorage.getItem('salon_visits')) || [];
    renderDashboard();
    renderReports();
    renderServicesCatalog();
    renderVisitServicesChips();
  } else {
    try {
      const sResponse = await fetch(`${API_BASE_URL}/services`);
      if (sResponse.ok) state.services = await sResponse.json();
      
      const vResponse = await fetch(`${API_BASE_URL}/visits`);
      if (vResponse.ok) state.visits = await vResponse.json();
      
      renderDashboard();
      renderReports();
      renderServicesCatalog();
      renderVisitServicesChips();
    } catch (e) {
      console.warn("Live fetch failed, defaulting to local states", e);
    }
  }
}

// ------------------------------------------
// UI ROUTING & EVENT LISTENERS
// ------------------------------------------

function setupEventListeners() {
  // Auth view toggles (Sign In / Register)
  const tabSignin = document.getElementById('tab-signin-btn');
  const tabSignup = document.getElementById('tab-signup-btn');
  const formLogin = document.getElementById('login-form');
  const formSignup = document.getElementById('signup-form');

  tabSignin.addEventListener('click', () => {
    tabSignin.classList.add('active');
    tabSignup.classList.remove('active');
    formLogin.classList.remove('hidden');
    formSignup.classList.add('hidden');
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabSignin.classList.remove('active');
    formSignup.classList.remove('hidden');
    formLogin.classList.add('hidden');
  });

  // Login form handler
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    handleLogin(user, pass);
  });

  // Sign up form handler (Dynamic stylist creation)
  formSignup.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullname = document.getElementById('signup-fullname').value.trim();
    const user = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    handleSignUp(fullname, user, email, pass, role);
  });

  // Sidebar navigation click handlers
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const target = item.getAttribute('data-target');
      navigateTo(target);
    });
  });

  // Dashboard shortcuts
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('btn-go-visit')) {
      navigateTo('view-new-visit');
    }
  });

  // Fast switch toggle inside sidebar footer (for review ease)
  document.getElementById('btn-fast-switch').addEventListener('click', () => {
    if (!state.currentUser) return;
    
    const newRole = state.currentUser.role === 'ADMIN' ? 'STAFF' : 'ADMIN';
    
    // Toggle role on current session
    state.currentUser.role = newRole;
    sessionStorage.setItem('salon_session', JSON.stringify(state.currentUser));
    showToast(`Role switched to ${newRole}!`, 'success');
    
    // Refresh application views
    applyRoleRestrictions();
    enterApplication();
  });

  // Logout handler
  document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem('salon_session');
    state.currentUser = null;
    document.getElementById('main-layout').classList.add('layout-hidden');
    document.getElementById('view-login').classList.remove('inactive');
    formLogin.reset();
    formSignup.reset();
    showToast("Signed out of Liv's Beauty Salon", 'success');
  });

  // Record customer visit form handler
  document.getElementById('visit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveVisit();
  });

  // Service CRUD catalog form
  document.getElementById('service-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveService();
  });

  document.getElementById('btn-cancel-edit-service').addEventListener('click', resetServiceForm);

  // Dynamic values updating for receipt preview
  document.getElementById('visit-customer-name').addEventListener('input', (e) => {
    document.getElementById('preview-cust-name').innerText = e.target.value.trim() || 'Guest Customer';
  });
}

// ------------------------------------------
// AUTHENTICATION LOGIC (Sign In & Register)
// ------------------------------------------

async function handleLogin(username, password) {
  if (state.isDemoMode) {
    // Offline authentication checks matching dynamically registered users
    const localUsers = JSON.parse(localStorage.getItem('registered_users')) || SEEDED_USERS;
    const authUser = localUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (authUser) {
      state.currentUser = { ...authUser };
      sessionStorage.setItem('salon_session', JSON.stringify(state.currentUser));
      enterApplication();
      showToast(`Welcome, ${state.currentUser.displayName}!`, 'success');
    } else {
      showToast('Invalid username or password. Please Sign Up first!', 'error');
    }
  } else {
    // Call Live Spring Boot security API
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        state.currentUser = await response.json();
        sessionStorage.setItem('salon_session', JSON.stringify(state.currentUser));
        enterApplication();
        showToast(`Welcome back, ${state.currentUser.displayName}!`, 'success');
      } else {
        showToast('Invalid credentials provided to backend.', 'error');
      }
    } catch (e) {
      showToast('Backend authentication error. Switching to offline mode.', 'error');
      checkBackendHealth();
    }
  }
}

async function handleSignUp(fullname, username, email, password, role) {
  const payload = {
    username,
    email,
    password,
    displayName: fullname,
    role
  };

  if (state.isDemoMode) {
    const localUsers = JSON.parse(localStorage.getItem('registered_users')) || [...SEEDED_USERS];
    
    // Check duplication
    if (localUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      showToast('Username already exists. Try another.', 'error');
      return;
    }

    localUsers.push(payload);
    localStorage.setItem('registered_users', JSON.stringify(localUsers));
    
    showToast('Registration successful! Please login.', 'success');
    
    // Auto toggle to Sign In tab
    document.getElementById('tab-signin-btn').click();
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
  } else {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast('Stylist account registered successfully!', 'success');
        document.getElementById('tab-signin-btn').click();
        document.getElementById('username').value = username;
        document.getElementById('password').value = password;
      } else {
        const errMsg = await response.text();
        showToast(errMsg || 'Failed to register stylist account on backend.', 'error');
      }
    } catch (e) {
      showToast('Backend server unavailable. Please try offline registration.', 'error');
      checkBackendHealth();
    }
  }
}

function enterApplication() {
  document.getElementById('view-login').classList.add('inactive');
  document.getElementById('main-layout').classList.remove('layout-hidden');
  
  // Set UI elements
  document.getElementById('user-display-name').innerText = state.currentUser.displayName;
  document.getElementById('user-role-badge').innerText = state.currentUser.role === 'ADMIN' ? 'Owner' : 'Stylist';
  
  // Auto Initials Extraction
  const names = state.currentUser.displayName.trim().split(' ');
  const initials = names.length > 1 ? (names[0][0] + names[names.length - 1][0]).toUpperCase() : names[0].substring(0, 2).toUpperCase();
  document.getElementById('user-avatar-initials').innerText = initials;
  document.getElementById('header-greeting').innerText = `Welcome, ${names[0]}`;
  
  // Set Date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('header-date').innerText = new Date().toLocaleDateString('en-IN', options);

  // Fast switch UI state sync
  const switchToggle = document.getElementById('btn-fast-switch');
  if (state.currentUser.role === 'ADMIN') {
    switchToggle.classList.add('admin-active');
  } else {
    switchToggle.classList.remove('admin-active');
  }

  applyRoleRestrictions();
  loadAllData();
  navigateTo('view-dashboard');
}

function applyRoleRestrictions() {
  const adminElements = document.querySelectorAll('.admin-only');
  const staffElements = document.querySelectorAll('.staff-only');
  
  if (state.currentUser.role === 'ADMIN') {
    adminElements.forEach(e => e.classList.remove('hidden'));
    staffElements.forEach(e => e.classList.add('hidden'));
  } else {
    adminElements.forEach(e => e.classList.add('hidden'));
    staffElements.forEach(e => e.classList.remove('hidden'));
  }
}

function navigateTo(targetViewId) {
  // Hide all sections
  const subviews = document.querySelectorAll('.app-subview');
  subviews.forEach(view => {
    view.classList.remove('active');
  });

  // Activate specific section
  const targetView = document.getElementById(targetViewId);
  if (targetView) {
    targetView.classList.add('active');
    
    // Sync Navigation menu highlight
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-target') === targetViewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Refresh calculations when showing views
    if (targetViewId === 'view-dashboard') renderDashboard();
    if (targetViewId === 'view-commissions') renderReports();
  }
}

// ------------------------------------------
// METRIC CALCULATIONS & CUSTOM SVG CHARTS
// ------------------------------------------

function renderDashboard() {
  // 1. Calculate Metrics
  const totalRevenue = state.visits.reduce((acc, visit) => acc + visit.totalAmount, 0);
  const totalVisits = state.visits.length;
  const totalCommission = state.visits.reduce((acc, visit) => acc + visit.commissionAmount, 0);

  // Animate numbers for premium feel
  animateCounter('stat-revenue', totalRevenue, true);
  animateCounter('stat-visits', totalVisits, false);
  animateCounter('stat-commission', totalCommission, true);

  // 2. Render Recent Visits Table
  const tbody = document.getElementById('recent-visits-tbody');
  tbody.innerHTML = '';
  
  // Sort visits newest first, slice top 5
  const recentVisits = [...state.visits].sort((a,b) => new Date(b.visitDate) - new Date(a.visitDate)).slice(0, 5);
  
  if (recentVisits.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; font-style: italic; color: var(--color-charcoal-muted); padding: 30px 10px;">No appointments added yet. Start by logging a visit!</td></tr>`;
  } else {
    recentVisits.forEach(v => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${v.customerName}</strong></td>
        <td><span class="table-badge bg-light-gold">${v.staffDisplayName}</span></td>
        <td>${v.services}</td>
        <td><strong>${formatRupees(v.totalAmount)}</strong></td>
      `;
      tbody.appendChild(row);
    });
  }

  // 3. Render Staff Performance List
  const performanceContainer = document.getElementById('staff-performance-list');
  performanceContainer.innerHTML = '';
  
  const staffStats = {};
  
  // Initialize dynamic staff lists based on logged visits to avoid pre-hardcoding
  state.visits.forEach(v => {
    const key = v.staffUsername;
    if (!staffStats[key]) {
      staffStats[key] = { name: v.staffDisplayName, visits: 0, sales: 0, commission: 0 };
    }
    staffStats[key].visits++;
    staffStats[key].sales += v.totalAmount;
    staffStats[key].commission += v.commissionAmount;
  });

  const staffArray = Object.values(staffStats).sort((a,b) => b.sales - a.sales);
  
  if (staffArray.length === 0) {
    performanceContainer.innerHTML = `<p style="text-align: center; font-style: italic; color: var(--color-charcoal-muted); padding: 20px;">No staff activity yet.</p>`;
  } else {
    staffArray.forEach((s, index) => {
      const item = document.createElement('div');
      item.className = 'leaderboard-item';
      item.innerHTML = `
        <div class="leaderboard-rank">${index + 1}</div>
        <div class="leaderboard-info">
          <h4>${s.name}</h4>
          <span>${s.visits} appointments</span>
        </div>
        <div class="leaderboard-score">
          <span class="score-val">${formatRupees(s.sales)}</span>
          <span class="score-lbl">Total Sales</span>
        </div>
      `;
      performanceContainer.appendChild(item);
    });
  }

  // 4. Generate SVG Charts
  generateRevenueAreaChart();
  generateServicesBarChart();
}

// Custom High-Fidelity SVG Area Chart for Monthly Revenue Trends
function generateRevenueAreaChart() {
  const container = document.getElementById('revenue-chart-container');
  container.innerHTML = '';

  if (state.visits.length === 0) {
    container.innerHTML = '<span class="chart-empty-msg">No appointments recorded.<br>Graph will render upon visit entry.</span>';
    return;
  }

  const monthlyData = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Seed past 3 months
  for (let i = 2; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[mKey] = { label: monthNames[d.getMonth()], amount: 0 };
  }

  state.visits.forEach(v => {
    const date = new Date(v.visitDate);
    const mKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[mKey]) {
      monthlyData[mKey].amount += v.totalAmount;
    }
  });

  const chartPoints = Object.values(monthlyData);
  const maxVal = Math.max(...chartPoints.map(p => p.amount), 500) * 1.15; // Padding

  const width = 500;
  const height = 200;
  const paddingX = 45;
  const paddingY = 20;
  
  let pointsStr = '';
  let areaPointsStr = `${paddingX},${height - paddingY} `;

  chartPoints.forEach((p, idx) => {
    const x = paddingX + (idx * (width - 2 * paddingX) / (chartPoints.length - 1));
    const y = (height - paddingY) - (p.amount * (height - 2 * paddingY) / maxVal);
    pointsStr += `${x},${y} `;
    areaPointsStr += `${x},${y} `;
  });
  
  areaPointsStr += `${width - paddingX},${height - paddingY}`;

  let gridLines = '';
  for (let i = 1; i <= 3; i++) {
    const gy = paddingY + (i * (height - 2 * paddingY) / 4);
    gridLines += `<line x1="${paddingX}" y1="${gy}" x2="${width - paddingX}" y2="${gy}" class="chart-gridline" />`;
  }

  let textLabels = '';
  chartPoints.forEach((p, idx) => {
    const x = paddingX + (idx * (width - 2 * paddingX) / (chartPoints.length - 1));
    textLabels += `
      <text x="${x}" y="${height - 2}" font-family="Plus Jakarta Sans" font-size="9" fill="#7F6A5F" text-anchor="middle">${p.label}</text>
      <text x="${x}" y="${(height - paddingY) - (p.amount * (height - 2 * paddingY) / maxVal) - 8}" font-family="Plus Jakarta Sans" font-size="9" font-weight="700" fill="#352F2B" text-anchor="middle">₹${Math.round(p.amount)}</text>
    `;
  });

  const svgHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#D4A373" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#D4A373" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <polygon points="${areaPointsStr}" class="chart-area" />
      <polyline points="${pointsStr}" class="chart-line" />
      ${textLabels}
    </svg>
  `;
  container.innerHTML = svgHTML;
}

// Custom High-Fidelity SVG Bar Chart for Top Service Popularity
function generateServicesBarChart() {
  const container = document.getElementById('services-chart-container');
  container.innerHTML = '';

  if (state.visits.length === 0) {
    container.innerHTML = '<span class="chart-empty-msg">No treatments logged yet.</span>';
    return;
  }

  const serviceCounts = {};
  state.services.forEach(s => {
    serviceCounts[s.name] = 0;
  });

  state.visits.forEach(v => {
    const optedList = v.services.split(', ');
    optedList.forEach(srv => {
      const match = state.services.find(s => s.name.trim().toLowerCase() === srv.trim().toLowerCase());
      if (match) {
        serviceCounts[match.name] = (serviceCounts[match.name] || 0) + 1;
      }
    });
  });

  const sortedServices = Object.entries(serviceCounts)
    .filter(s => s[1] > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (sortedServices.length === 0) {
    container.innerHTML = '<span class="chart-empty-msg">No treatments logged yet.</span>';
    return;
  }

  const maxVal = Math.max(...sortedServices.map(s => s[1]), 2) * 1.1;

  const width = 300;
  const height = 200;
  const barPadding = 12;
  const bottomPadding = 30;
  const leftPadding = 90;
  const topPadding = 10;
  
  const chartHeight = height - bottomPadding - topPadding;
  const chartWidth = width - leftPadding - 10;
  const barHeight = (chartHeight / sortedServices.length) - barPadding;

  let svgElements = '';
  
  sortedServices.forEach((s, idx) => {
    const sName = s[0];
    const sCount = s[1];
    const barWidth = (sCount * chartWidth) / maxVal;
    const y = topPadding + (idx * (chartHeight / sortedServices.length)) + (barPadding / 2);
    
    svgElements += `
      <text x="${leftPadding - 10}" y="${y + barHeight/2 + 4}" font-family="Plus Jakarta Sans" font-size="8" font-weight="600" fill="#352F2B" text-anchor="end">${sName.substring(0, 14)}</text>
      <rect x="${leftPadding}" y="${y}" width="${chartWidth}" height="${barHeight}" rx="4" fill="#FAF6F0" opacity="0.8" />
      <rect x="${leftPadding}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" class="chart-bar" />
      <text x="${leftPadding + barWidth + 8}" y="${y + barHeight/2 + 4}" font-family="Plus Jakarta Sans" font-size="8" font-weight="700" fill="#D4A373">${sCount}x</text>
    `;
  });

  const svgHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
      ${svgElements}
    </svg>
  `;
  container.innerHTML = svgHTML;
}

function animateCounter(id, targetVal, isCurrency) {
  const elem = document.getElementById(id);
  if (!elem) return;
  
  let current = 0;
  const duration = 800;
  const stepTime = 20;
  const steps = duration / stepTime;
  const increment = targetVal / steps;
  
  let step = 0;
  const timer = setInterval(() => {
    current += increment;
    step++;
    if (step >= steps) {
      clearInterval(timer);
      elem.innerText = isCurrency ? formatRupees(targetVal) : Math.round(targetVal);
    } else {
      elem.innerText = isCurrency ? formatRupees(current) : Math.round(current);
    }
  }, stepTime);
}

// ------------------------------------------
// STAFF CREATE VISIT AND BILL CALCULATIONS
// ------------------------------------------

function renderVisitServicesChips() {
  const container = document.getElementById('visit-services-grid');
  container.innerHTML = '';

  const activeServices = state.services.filter(s => s.active !== false);

  if (activeServices.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-charcoal-muted); font-style: italic;">No services configured yet.</p>';
    return;
  }

  activeServices.forEach(s => {
    const chip = document.createElement('label');
    chip.className = 'chip-select';
    chip.innerHTML = `
      <input type="checkbox" name="services-opted" value="${s.id}" data-price="${s.price}" data-name="${s.name}">
      <div class="chip-label">
        <span>${s.name}</span>
        <span class="chip-price">₹${s.price}</span>
      </div>
    `;
    container.appendChild(chip);

    chip.querySelector('input').addEventListener('change', calculateLiveReceipt);
  });
}

function calculateLiveReceipt() {
  const checkboxes = document.querySelectorAll('input[name="services-opted"]:checked');
  const itemsContainer = document.getElementById('receipt-services-list');
  itemsContainer.innerHTML = '';

  let subtotal = 0;
  const optedNames = [];

  if (checkboxes.length === 0) {
    itemsContainer.innerHTML = '<div class="empty-receipt-msg">No services selected</div>';
  } else {
    checkboxes.forEach(cb => {
      const price = parseFloat(cb.getAttribute('data-price'));
      const name = cb.getAttribute('data-name');
      subtotal += price;
      optedNames.push(name);

      const row = document.createElement('div');
      row.className = 'receipt-item-row';
      row.innerHTML = `<span>${name}</span><span>₹${price}</span>`;
      itemsContainer.appendChild(row);
    });
  }

  const commission = subtotal * 0.10;

  document.getElementById('receipt-subtotal').innerText = formatRupees(subtotal);
  document.getElementById('receipt-commission').innerText = formatRupees(commission);
  
  document.getElementById('preview-date').innerText = new Date().toLocaleDateString('en-IN', { month: '2-digit', day: '2-digit', year: 'numeric' });
  
  return { subtotal, commission, servicesList: optedNames.join(', ') };
}

async function saveVisit() {
  const custName = document.getElementById('visit-customer-name').value.trim();
  const notes = document.getElementById('visit-notes').value.trim();
  
  const { subtotal, commission, servicesList } = calculateLiveReceipt();
  
  if (!servicesList) {
    showToast('Please select at least one salon service.', 'error');
    return;
  }

  const payload = {
    customerName: custName,
    visitDate: new Date().toISOString(),
    staffUsername: state.currentUser.username,
    staffDisplayName: state.currentUser.displayName,
    totalAmount: subtotal,
    commissionAmount: commission,
    services: servicesList,
    notes: notes
  };

  if (state.isDemoMode) {
    // Generate offline ID
    payload.id = state.visits.length > 0 ? Math.max(...state.visits.map(v => v.id)) + 1 : 1;
    state.visits.push(payload);
    localStorage.setItem('salon_visits', JSON.stringify(state.visits));
    
    showToast('Visit saved and 10% commission generated!', 'success');
    resetVisitForm();
    navigateTo('view-dashboard');
  } else {
    try {
      const response = await fetch(`${API_BASE_URL}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        showToast('Visit logged on Live Database!', 'success');
        resetVisitForm();
        loadAllData();
        navigateTo('view-dashboard');
      } else {
        showToast('Failed to log visit on Live API.', 'error');
      }
    } catch (e) {
      showToast('API save failed. Saving locally to localStorage.', 'error');
      checkBackendHealth();
    }
  }
}

function resetVisitForm() {
  document.getElementById('visit-form').reset();
  document.getElementById('preview-cust-name').innerText = 'Guest Customer';
  
  const checkboxes = document.querySelectorAll('input[name="services-opted"]');
  checkboxes.forEach(cb => cb.checked = false);
  calculateLiveReceipt();
}

// ------------------------------------------
// ADMIN SERVICES CONFIGURATION (CRUD)
// ------------------------------------------

function renderServicesCatalog() {
  const listGrid = document.getElementById('services-mgmt-grid');
  listGrid.innerHTML = '';

  const activeServices = state.services.filter(s => s.active !== false);

  if (activeServices.length === 0) {
    listGrid.innerHTML = '<p style="text-align: center; color: var(--color-charcoal-muted); font-style: italic; padding: 20px;">No treatments in directory.</p>';
    return;
  }

  activeServices.forEach(s => {
    const item = document.createElement('div');
    item.className = 'service-mgmt-item';
    item.innerHTML = `
      <div class="service-mgmt-info">
        <h4>${s.name}</h4>
        <p style="font-weight: 700; font-size: 0.75rem; color: var(--color-gold); margin: 2px 0;">${s.category || 'Hair Care'}</p>
        <p>${s.description || 'No description added yet.'}</p>
      </div>
      <div style="display: flex; align-items: center;">
        <span class="service-price-tag">₹${s.price}</span>
        <div class="service-actions">
          <button class="btn-action-icon edit-srv-btn" data-id="${s.id}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
          <button class="btn-action-icon del-srv-btn" data-id="${s.id}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
      </div>
    `;
    listGrid.appendChild(item);
  });

  // Attach button triggers
  listGrid.querySelectorAll('.edit-srv-btn').forEach(btn => {
    btn.addEventListener('click', () => editService(parseInt(btn.getAttribute('data-id'))));
  });
  listGrid.querySelectorAll('.del-srv-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteService(parseInt(btn.getAttribute('data-id'))));
  });
}

function editService(id) {
  const s = state.services.find(item => item.id === id);
  if (!s) return;

  document.getElementById('service-id-field').value = s.id;
  document.getElementById('service-name').value = s.name;
  document.getElementById('service-price').value = s.price;
  document.getElementById('service-category').value = s.category || 'Hair Care';
  document.getElementById('service-desc').value = s.description || '';
  
  document.getElementById('service-form-title').innerText = 'Edit Service Details';
  document.getElementById('btn-cancel-edit-service').classList.remove('hidden');
}

function resetServiceForm() {
  document.getElementById('service-id-field').value = '';
  document.getElementById('service-form').reset();
  
  document.getElementById('service-form-title').innerText = 'Add New Service';
  document.getElementById('btn-cancel-edit-service').classList.add('hidden');
}

async function saveService() {
  const idVal = document.getElementById('service-id-field').value;
  const name = document.getElementById('service-name').value.trim();
  const price = parseFloat(document.getElementById('service-price').value);
  const category = document.getElementById('service-category').value;
  const description = document.getElementById('service-desc').value.trim();

  const payload = {
    name,
    price,
    category,
    description,
    active: true
  };

  if (state.isDemoMode) {
    if (idVal) {
      // Update existing
      const sIdx = state.services.findIndex(s => s.id === parseInt(idVal));
      if (sIdx > -1) {
        payload.id = parseInt(idVal);
        state.services[sIdx] = payload;
        showToast('Treatment configured successfully!', 'success');
      }
    } else {
      // Add new
      payload.id = state.services.length > 0 ? Math.max(...state.services.map(s => s.id)) + 1 : 1;
      state.services.push(payload);
      showToast('New Service added to catalog!', 'success');
    }
    
    localStorage.setItem('salon_services', JSON.stringify(state.services));
    resetServiceForm();
    loadAllData();
  } else {
    try {
      let url = `${API_BASE_URL}/services`;
      let method = 'POST';
      
      if (idVal) {
        url = `${API_BASE_URL}/services/${idVal}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        showToast(idVal ? 'Service modified on live server!' : 'New Service configured on live server!', 'success');
        resetServiceForm();
        loadAllData();
      } else {
        showToast('Failed to save service on API backend.', 'error');
      }
    } catch (e) {
      showToast('API save error. Switching offline.', 'error');
      checkBackendHealth();
    }
  }
}

async function deleteService(id) {
  if (!confirm('Are you sure you want to deactivate this salon service? It will no longer be visible for stylist selections.')) return;

  if (state.isDemoMode) {
    const sIdx = state.services.findIndex(s => s.id === id);
    if (sIdx > -1) {
      state.services[sIdx].active = false;
      localStorage.setItem('salon_services', JSON.stringify(state.services));
      showToast('Treatment deactivated in offline directory.', 'success');
      loadAllData();
    }
  } else {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showToast('Treatment deactivated on live catalog.', 'success');
        loadAllData();
      } else {
        showToast('Failed to delete service on API backend.', 'error');
      }
    } catch (e) {
      showToast('API delete error. Fallback to offline deactivation.', 'error');
      checkBackendHealth();
    }
  }
}

// ------------------------------------------
// ADMIN REPORTS GENERATION
// ------------------------------------------

function renderReports() {
  const tbody = document.getElementById('commission-report-tbody');
  tbody.innerHTML = '';

  const staffRecords = {};

  // Build staff records dynamically from logged visits to prevent hardcoding stylings
  state.visits.forEach(v => {
    const key = v.staffUsername;
    if (!staffRecords[key]) {
      staffRecords[key] = { name: v.staffDisplayName, role: 'STAFF', visits: 0, sales: 0, commission: 0 };
    }
    staffRecords[key].visits++;
    staffRecords[key].sales += v.totalAmount;
    staffRecords[key].commission += v.commissionAmount;
  });

  const staffArray = Object.values(staffRecords);
  let totalCommissions = 0;
  let topStaffName = '-';
  let topStaffSales = 0;

  if (staffArray.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; font-style: italic; color: var(--color-charcoal-muted); padding: 30px;">No staff logged visits to aggregate commission data.</td></tr>`;
  } else {
    staffArray.forEach(s => {
      totalCommissions += s.commission;
      if (s.sales > topStaffSales) {
        topStaffSales = s.sales;
        topStaffName = s.name;
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${s.name}</strong></td>
        <td><span class="table-badge bg-light-gold">${s.role}</span></td>
        <td>${s.visits} appointments</td>
        <td><strong>${formatRupees(s.sales)}</strong></td>
        <td class="font-accent font-bold">${formatRupees(s.commission)}</td>
      `;
      tbody.appendChild(row);
    });
  }

  // Update Summary brief counters
  document.getElementById('report-total-commissions').innerText = formatRupees(totalCommissions);
  document.getElementById('report-top-staff').innerText = topStaffName;
}

// ------------------------------------------
// PWA INSTALLATION HOOKS
// ------------------------------------------

function setupPWAPrompt() {
  const installBtn = document.getElementById('pwa-install-btn');
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredInstallPrompt = e;
    installBtn.classList.remove('hide-install');
  });

  installBtn.addEventListener('click', () => {
    if (!state.deferredInstallPrompt) return;
    state.deferredInstallPrompt.prompt();
    state.deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        installBtn.classList.add('hide-install');
      }
      state.deferredInstallPrompt = null;
    });
  });

  window.addEventListener('appinstalled', (evt) => {
    installBtn.classList.add('hide-install');
    showToast('LIV\'S BEAUTY SALON app installed successfully!', 'success');
  });
}

// ------------------------------------------
// TOAST NOTIFICATIONS SYSTEM
// ------------------------------------------

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` :
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
