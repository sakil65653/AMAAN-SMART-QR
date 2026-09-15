// AMAAN CSC CENTER - Multi-Center Billing & Daily Accounting System
// Complete Zero-Base Implementation

const API_BASE = (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) 
    ? `${window.location.origin}/api/billing` 
    : 'http://localhost:5050/api/billing';

const state = {
    token: localStorage.getItem('billing_token') || sessionStorage.getItem('billing_token') || null,
    user: null,
    center: null,
    centers: [],
    viewingCenter: 'all',
    activeTab: 'dashboard',
    todayData: null,
    editingTxn: null,
    services: [],
    serviceCatFilter: 'all',
    searchQuery: '',
    selectedService: null,
    isDropdownOpen: false
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    startLiveClock();
    loadCentralServices();

    // Close searchable dropdown on outside click
    document.addEventListener('click', (e) => {
        const wrap = document.getElementById('serviceSearchDropdownWrap');
        if (wrap && !wrap.contains(e.target)) {
            closeServiceDropdown();
        }
    });

    // Set default month in monthly picker
    const now = new Date();
    const curYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyPicker = document.getElementById('monthlyReportPicker');
    if (monthlyPicker) monthlyPicker.value = curYearMonth;

    const historyDate = document.getElementById('historyDateInput');
    if (historyDate) historyDate.value = now.toISOString().split('T')[0];

    // Check existing auth
    if (state.token) {
        verifyAuth();
    } else {
        showLoginScreen();
    }
});

// --- Live Clock ---
function startLiveClock() {
    function update() {
        const now = new Date();
        const formatted = format12Hr(now);
        const clockEl = document.getElementById('liveClock');
        if (clockEl) clockEl.textContent = formatted;
        const entryTimeEl = document.getElementById('entryLiveTime');
        if (entryTimeEl) entryTimeEl.textContent = formatted;
    }
    update();
    setInterval(update, 1000);
}

function format12Hr(d) {
    const dt = (typeof d === 'string') ? new Date(d) : d;
    if (isNaN(dt.getTime())) return d;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(dt.getDate()).padStart(2, '0');
    const month = months[dt.getMonth()];
    const year = dt.getFullYear();
    let hours = dt.getHours();
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    return `${day} ${month} ${year} — ${strHours}:${minutes} ${ampm}`;
}

// --- API Client ---
async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
        const res = await fetch(`${API_BASE}/${endpoint}`, opts);
        if (res.status === 401) {
            const errData = await res.json().catch(() => ({}));
            if (state.token && !endpoint.startsWith('services') && !endpoint.startsWith('auth/login')) {
                handleLogout();
            }
            throw new Error(errData.error || (endpoint.startsWith('auth/login') ? 'Invalid Username or Password' : 'Session expired. Please log in again.'));
        }
        if (res.status === 403) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'ACCESS DENIED. You do not have permission.');
        }
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || `HTTP error ${res.status}`);
        }
        return data;
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
}

// --- Authentication & Session ---
async function verifyAuth() {
    try {
        const res = await apiCall('auth/me');
        state.user = res.user;
        state.center = res.center;
        state.centers = Array.isArray(res.centers) ? res.centers : (res.centers ? [res.centers] : []);
        
        // If member, strictly set viewing center to member's center
        if (state.user && state.user.role === 'member') {
            state.viewingCenter = state.user.center_id;
        } else {
            state.viewingCenter = 'all';
        }

        setupUIForUser();
        hideLoginScreen();
        await loadCentralServices();
        switchTab('dashboard');
    } catch (e) {
        console.error('verifyAuth failed:', e);
        showLoginScreen();
    }
}

async function handleLoginSubmit(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const userEl = document.getElementById('loginUsername');
    const passEl = document.getElementById('loginPassword');
    const userIn = (userEl ? userEl.value : '').trim();
    const passIn = (passEl ? passEl.value : '').trim();
    const btn = document.getElementById('loginBtn');
    const alertBox = document.getElementById('loginAlert');

    if (!userIn || !passIn) {
        if (alertBox) {
            alertBox.className = 'p-3 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 block';
            alertBox.textContent = 'Please enter both Username and Password / PIN.';
            alertBox.classList.remove('hidden');
        }
        if (!userIn && userEl) userEl.focus();
        else if (passEl) passEl.focus();
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
    }
    if (alertBox) alertBox.classList.add('hidden');

    try {
        const res = await apiCall('auth/login', 'POST', { username: userIn, password: passIn });
        state.token = res.token;
        state.user = res.user;
        state.center = res.center;
        localStorage.setItem('billing_token', res.token);
        sessionStorage.setItem('billing_token', res.token);

        // Fetch full profile & center list
        await verifyAuth();
    } catch (err) {
        if (alertBox) {
            alertBox.className = 'p-3 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 block';
            alertBox.textContent = err.message || 'Login failed. Please check credentials.';
            alertBox.classList.remove('hidden');
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> <span>Sign In to System</span>';
        }
    }
}

function fillLogin(u, p) {
    const userEl = document.getElementById('loginUsername');
    const passEl = document.getElementById('loginPassword');
    const alertBox = document.getElementById('loginAlert');
    if (userEl) userEl.value = u;
    if (passEl) passEl.value = p;
    if (alertBox) alertBox.classList.add('hidden');
}

function handleLogout() {
    if (state.token) {
        fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${state.token}` }
        }).catch(() => {});
    }
    state.token = null;
    state.user = null;
    state.center = null;
    localStorage.removeItem('billing_token');
    localStorage.removeItem('amaan_admin_token');
    localStorage.removeItem('amaan_auth_token');
    localStorage.removeItem('amaan_csc_user');
    try { sessionStorage.clear(); } catch(e) {}

    // Prevent access to protected pages using browser Back button after logout
    try {
        window.history.replaceState(null, '', 'billing.html');
    } catch(e) {}

    showLoginScreen();

    const alertEl = document.getElementById('loginAlert');
    if (alertEl) {
        alertEl.className = 'p-3 rounded-lg text-sm font-bold bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2';
        alertEl.innerHTML = '<span>✅</span><span>You have been logged out successfully.</span>';
        alertEl.classList.remove('hidden');
    }
}

// Prevent access using browser Back button after logout
window.addEventListener('pageshow', function() {
    const token = localStorage.getItem('billing_token') || sessionStorage.getItem('billing_token');
    if (!token || !state.token) {
        showLoginScreen();
    }
});
window.addEventListener('popstate', function() {
    const token = localStorage.getItem('billing_token') || sessionStorage.getItem('billing_token');
    if (!token || !state.token) {
        showLoginScreen();
    }
});

function showLoginScreen() {
    const el = document.getElementById('loginScreen');
    if (el) { el.classList.remove('hidden'); el.style.display = 'flex'; }
    const app = document.getElementById('appContainer');
    if (app) { app.classList.add('hidden'); app.style.display = 'none'; }
}

function hideLoginScreen() {
    const el = document.getElementById('loginScreen');
    if (el) { el.classList.add('hidden'); el.style.display = 'none'; }
    const app = document.getElementById('appContainer');
    if (app) { app.classList.remove('hidden'); app.style.display = 'block'; }
}

// --- Password Visibility Toggle & Password Management ---
function toggleBillingPassVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function openBillingChangePassModal() {
    const modal = document.getElementById('billingChangePassModal');
    if (modal) {
        const form = document.getElementById('billingChangePassForm');
        if (form) form.reset();
        ['billingCurrentPass', 'billingNewPass', 'billingConfirmPass'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.type = 'password';
        });
        ['eyeBillingCurr', 'eyeBillingNew', 'eyeBillingConf'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('fa-eye-slash');
                el.classList.add('fa-eye');
            }
        });
        modal.classList.remove('hidden');
    }
}

function closeBillingChangePassModal() {
    const modal = document.getElementById('billingChangePassModal');
    if (modal) modal.classList.add('hidden');
}

// --- Forgot Password Recovery ---
function openForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        const form = document.getElementById('forgotPassForm');
        if (form) form.reset();
        const alertBox = document.getElementById('forgotAlert');
        if (alertBox) alertBox.classList.add('hidden');

        // Auto-fill username if already typed in login box
        const curUser = document.getElementById('loginUsername');
        const forgotUser = document.getElementById('forgotUsername');
        if (curUser && forgotUser && curUser.value.trim()) {
            forgotUser.value = curUser.value.trim();
        }

        // Update WhatsApp link with typed username
        const waBtn = document.getElementById('forgotWhatsAppBtn');
        if (waBtn && forgotUser && forgotUser.value.trim()) {
            waBtn.href = `https://wa.me/919078765653?text=Hello%20Admin,%20please%20reset%20my%20Billing%20Portal%20password%20for%20username:%20${encodeURIComponent(forgotUser.value.trim())}`;
        }

        modal.classList.remove('hidden');
    }
}

function closeForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) modal.classList.add('hidden');
}

async function handleForgotPasswordSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('forgotUsername').value.trim();
    const masterPin = document.getElementById('forgotMasterPin').value.trim();
    const newPass = document.getElementById('forgotNewPassword').value.trim();
    const confPass = document.getElementById('forgotConfirmPassword').value.trim();
    const btn = document.getElementById('forgotSubmitBtn');
    const alertBox = document.getElementById('forgotAlert');

    if (newPass !== confPass) {
        if (alertBox) {
            alertBox.className = 'p-3 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300';
            alertBox.textContent = 'New passwords do not match! Please check and re-enter.';
            alertBox.classList.remove('hidden');
        }
        return;
    }

    if (newPass.length < 4) {
        if (alertBox) {
            alertBox.className = 'p-3 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300';
            alertBox.textContent = 'New password must be at least 4 characters long.';
            alertBox.classList.remove('hidden');
        }
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Resetting Password...';
    if (alertBox) alertBox.classList.add('hidden');

    try {
        const res = await apiCall('auth/forgot-password', 'POST', {
            username: username,
            master_pin: masterPin,
            new_password: newPass
        });

        if (alertBox) {
            alertBox.className = 'p-3 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
            alertBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${res.message || 'Password reset successfully!'}`;
            alertBox.classList.remove('hidden');
        }

        // Prefill login form
        const loginU = document.getElementById('loginUsername');
        const loginP = document.getElementById('loginPassword');
        if (loginU) loginU.value = username;
        if (loginP) loginP.value = newPass;

        setTimeout(() => {
            closeForgotPasswordModal();
        }, 1600);
    } catch (err) {
        if (alertBox) {
            alertBox.className = 'p-3 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300';
            alertBox.textContent = err.message || 'Failed to reset password. Please check Master PIN.';
            alertBox.classList.remove('hidden');
        }
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-unlock-keyhole"></i> <span>Reset & Update Password</span>';
    }
}

async function handleBillingChangePassSubmit(e) {
    e.preventDefault();
    const curPass = document.getElementById('billingCurrentPass').value;
    const newPass = document.getElementById('billingNewPass').value;
    const confPass = document.getElementById('billingConfirmPass').value;
    const btn = document.getElementById('billingChangePassBtn');

    if (newPass !== confPass) {
        alert('New passwords do not match! Please check and re-enter.');
        return;
    }
    if (newPass.length < 4) {
        alert('New password must be at least 4 characters long.');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

    try {
        const res = await apiCall('auth/change-password', 'POST', {
            current_password: curPass,
            new_password: newPass
        });
        alert(res.message || 'Password changed successfully! Please use your new password next time.');
        closeBillingChangePassModal();
    } catch (err) {
        alert('Error: ' + (err.message || 'Failed to change password'));
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Update Password</span>';
    }
}

// --- UI Setup & Center Switcher ---
function setupUIForUser() {
    const isAdm = state.user && state.user.role === 'admin';

    // Top Header info
    const topUser = document.getElementById('topUserName');
    if (topUser) topUser.textContent = state.user ? state.user.name : '';
    const roleBadge = document.getElementById('roleBadge');
    if (roleBadge) {
        roleBadge.textContent = isAdm ? 'Admin' : 'Member';
        roleBadge.className = isAdm 
            ? 'px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-blue-700 text-blue-100 border border-blue-600'
            : 'px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-700 text-emerald-100 border border-emerald-600';
    }

    if (state.center) {
        const topCenterName = document.getElementById('topCenterName');
        if (topCenterName) topCenterName.textContent = state.center.center_name;
        const topCenterMeta = document.getElementById('topCenterMeta');
        if (topCenterMeta) topCenterMeta.textContent = `${state.center.address} | Contact: ${state.center.mobile}`;
        const topCenterTag = document.getElementById('topCenterTag');
        if (topCenterTag) topCenterTag.textContent = state.center.center_name;
        const formCenterBadge = document.getElementById('formCenterBadge');
        if (formCenterBadge) formCenterBadge.textContent = state.center.center_name;
    }

    // Toggle Admin Only views/buttons
    document.querySelectorAll('.admin-only').forEach(el => {
        if (isAdm) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });

    // Populate and show Center Switcher for Admin
    const switcherWrap = document.getElementById('adminCenterFilterWrapper');
    const switcherSelect = document.getElementById('adminCenterSelect');
    if (isAdm && state.centers && state.centers.length > 0) {
        switcherWrap.classList.remove('hidden');
        switcherSelect.innerHTML = '<option value="all">All Centers (Consolidated)</option>';
        state.centers.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.center_id;
            opt.textContent = c.center_name;
            switcherSelect.appendChild(opt);
        });
        switcherSelect.value = state.viewingCenter;
    } else {
        switcherWrap.classList.add('hidden');
    }
}

function handleCenterSwitch(centerId) {
    state.viewingCenter = centerId;
    loadActiveTabData();
}

// --- Tab Navigation ---
function switchTab(tabId) {
    state.activeTab = tabId;

    // Update nav button active states
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tabNav-${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Show selected view
    document.querySelectorAll('.tab-view').forEach(v => v.classList.add('hidden'));
    const activeView = document.getElementById(`view-${tabId}`);
    if (activeView) activeView.classList.remove('hidden');

    loadActiveTabData();
}

function loadActiveTabData() {
    switch (state.activeTab) {
        case 'dashboard': loadDashboardData(); break;
        case 'newEntry': if (state.services.length === 0) loadCentralServices(); break;
        case 'todayRecords': loadTodayRecords(); break;
        case 'expenses': loadExpenses(); break;
        case 'dailyHistory': loadDailyHistory(); break;
        case 'monthlyReport': loadMonthlyReport(); break;
        case 'serviceReport': loadServiceReport(); break;
        case 'expenseReport': loadExpenseReport(); break;
        case 'auditLog': loadAuditHistory(); break;
        case 'members': loadMembers(); break;
        case 'centers': loadCenters(); break;
    }
}

// --- TAB 1: DASHBOARD ---
async function loadDashboardData() {
    try {
        const queryCenter = (state.user.role === 'member') ? state.user.center_id : state.viewingCenter;
        const res = await apiCall(`summary/today?center_id=${queryCenter}`);
        
        state.todayData = res;

        // KPI Cards
        const elOp = document.getElementById('kpiOpeningBalance'); if (elOp) elOp.textContent = Number(res.opening_balance || 0).toFixed(2);
        const elInc = document.getElementById('kpiTodayIncome'); if (elInc) elInc.textContent = Number(res.today_income || 0).toFixed(2);
        const elExp = document.getElementById('kpiTodayExpense'); if (elExp) elExp.textContent = Number(res.today_expense || 0).toFixed(2);
        const elClo = document.getElementById('kpiClosingBalance'); if (elClo) elClo.textContent = Number(res.today_closing || 0).toFixed(2);
        const elCnt = document.getElementById('kpiTodayCount'); if (elCnt) elCnt.textContent = res.today_entries_count || 0;

        // Month Summary
        const elMInc = document.getElementById('dashMonthIncome'); if (elMInc) elMInc.textContent = Number(res.month_income || 0).toFixed(2);
        const elMExp = document.getElementById('dashMonthExpense'); if (elMExp) elMExp.textContent = Number(res.month_expense || 0).toFixed(2);
        const elMNet = document.getElementById('dashMonthNet'); if (elMNet) elMNet.textContent = Number(res.month_net || 0).toFixed(2);

        // Header titles
        const centerTitle = document.getElementById('dashCenterTitle');
        const centerSubtitle = document.getElementById('dashCenterSubtitle');
        if (state.viewingCenter === 'all' && state.user && state.user.role === 'admin') {
            if (centerTitle) centerTitle.textContent = 'ALL CENTERS (CONSOLIDATED)';
            if (centerSubtitle) centerSubtitle.textContent = 'Consolidated summary of all franchise centers';
        } else {
            const centersList = Array.isArray(state.centers) ? state.centers : [];
            const currentCenterObj = centersList.find(c => c.center_id === queryCenter) || state.center;
            if (currentCenterObj) {
                if (centerTitle) centerTitle.textContent = currentCenterObj.center_name;
                if (centerSubtitle) centerSubtitle.textContent = `${currentCenterObj.address} | Contact: ${currentCenterObj.mobile}`;
            }
        }

        // Opening Balance input prefill
        const opInput = document.getElementById('openingBalanceInput');
        if (opInput) opInput.value = res.opening_balance || 0;

        // Center Breakdown Table
        renderCenterBreakdown(res.breakdown || []);

        // Load today's recent entries
        loadRecentEntries(queryCenter);
    } catch (e) {
        console.error('Failed to load dashboard:', e);
    }
}

function renderCenterBreakdown(breakdown) {
    const tbody = document.getElementById('dashCenterBreakdownTable');
    if (!tbody) return;

    if (!breakdown || breakdown.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-3 text-center text-slate-400">No center data found.</td></tr>';
        return;
    }

    tbody.innerHTML = breakdown.map(c => `
        <tr class="hover:bg-slate-50 transition">
            <td class="p-2.5 font-bold text-slate-800">${c.center_name}</td>
            <td class="p-2.5 text-right font-mono font-bold text-emerald-600">₹ ${Number(c.today_income || 0).toFixed(2)}</td>
            <td class="p-2.5 text-right font-mono font-bold text-rose-600">₹ ${Number(c.today_expense || 0).toFixed(2)}</td>
            <td class="p-2.5 text-right font-mono font-bold text-blue-700">₹ ${Number(c.today_net || 0).toFixed(2)}</td>
            <td class="p-2.5 text-right font-mono font-black text-slate-900">₹ ${Number(c.today_closing || 0).toFixed(2)}</td>
        </tr>
    `).join('');
}

async function loadRecentEntries(centerId) {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const res = await apiCall(`transactions?center_id=${centerId}&date=${todayStr}`);
        const list = res.transactions ? res.transactions.slice(0, 5) : [];
        const tbody = document.getElementById('dashRecentEntriesTable');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-400">No transactions recorded yet today.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(t => renderTxnRow(t)).join('');
    } catch (e) {
        console.error('Recent entries load error:', e);
    }
}

async function saveOpeningBalance() {
    const val = parseFloat(document.getElementById('openingBalanceInput').value);
    if (isNaN(val) || val < 0) {
        alert('Please enter a valid positive opening balance.');
        return;
    }

    const queryCenter = (state.user.role === 'member') ? state.user.center_id : (state.viewingCenter === 'all' ? state.center.center_id : state.viewingCenter);

    try {
        await apiCall('opening-balance', 'POST', {
            center_id: queryCenter,
            amount: val
        });
        alert('Opening balance recorded successfully.');
        loadDashboardData();
    } catch (err) {
        alert(err.message || 'Failed to update opening balance.');
    }
}

// --- TAB 2: NEW INCOME ENTRY (CENTRAL SERVICES SEARCHABLE SELECT) ---

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function capitalize(str) {
    if (!str) return '';
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

function highlightMatch(text, query) {
    if (!text) return '';
    if (!query) return escapeHtml(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark class="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">$1</mark>');
}

const CATEGORY_NAMES = {
    'all': 'All Categories',
    'government': 'Government Services',
    'yojana': 'Schemes & Yojanas',
    'printing': 'Printing & Photo',
    'ticket': 'Ticketing & Insurance',
    'other': 'Other Services'
};

const CATEGORY_ICONS = {
    'government': 'fa-solid fa-building-columns text-blue-600',
    'yojana': 'fa-solid fa-hand-holding-heart text-emerald-600',
    'printing': 'fa-solid fa-print text-purple-600',
    'ticket': 'fa-solid fa-ticket text-amber-600',
    'other': 'fa-solid fa-star text-slate-600'
};

async function loadCentralServices() {
    try {
        const res = await apiCall('services');
        if (res && res.services && res.services.length > 0) {
            state.services = res.services;
        } else if (typeof services !== 'undefined' && Array.isArray(services)) {
            state.services = services;
        }
    } catch (e) {
        if (typeof services !== 'undefined' && Array.isArray(services)) {
            state.services = services;
        }
    }

    const badge = document.getElementById('serviceCountBadge');
    if (badge) {
        badge.textContent = `${state.services.length} Services Available`;
    }

    updateCatPills();
    filterAndRenderServices();
}

function updateCatPills() {
    const counts = {
        all: state.services.length,
        government: 0,
        yojana: 0,
        printing: 0,
        ticket: 0
    };
    state.services.forEach(s => {
        const c = (s.category || 'other').toLowerCase();
        if (counts[c] !== undefined) counts[c]++;
    });

    const pillAll = document.getElementById('catPill-all');
    if (pillAll) pillAll.textContent = `All (${counts.all})`;
    const pillGov = document.getElementById('catPill-government');
    if (pillGov) pillGov.textContent = `Government (${counts.government})`;
    const pillYoj = document.getElementById('catPill-yojana');
    if (pillYoj) pillYoj.textContent = `Schemes (${counts.yojana})`;
    const pillPrt = document.getElementById('catPill-printing');
    if (pillPrt) pillPrt.textContent = `Printing (${counts.printing})`;
    const pillTkt = document.getElementById('catPill-ticket');
    if (pillTkt) pillTkt.textContent = `Ticketing (${counts.ticket})`;
}

function toggleServiceDropdown() {
    if (state.isDropdownOpen) {
        closeServiceDropdown();
    } else {
        openServiceDropdown();
    }
}

function openServiceDropdown() {
    const menu = document.getElementById('serviceDropdownMenu');
    const chevron = document.getElementById('dropdownChevron');
    if (!menu) return;

    menu.classList.remove('hidden');
    state.isDropdownOpen = true;
    if (chevron) chevron.style.transform = 'rotate(180deg)';

    const searchIn = document.getElementById('serviceLiveSearchInput');
    if (searchIn) {
        searchIn.focus();
    }
}

function closeServiceDropdown() {
    const menu = document.getElementById('serviceDropdownMenu');
    const chevron = document.getElementById('dropdownChevron');
    if (!menu) return;

    menu.classList.add('hidden');
    state.isDropdownOpen = false;
    if (chevron) chevron.style.transform = 'rotate(0deg)';
}

function filterServicesByCategory(cat) {
    state.serviceCatFilter = cat;
    document.querySelectorAll('#serviceCatPills .cat-pill').forEach(btn => {
        btn.className = 'cat-pill px-2.5 py-1 rounded-full font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition';
    });
    const activeBtn = document.getElementById(`catPill-${cat}`);
    if (activeBtn) {
        activeBtn.className = 'cat-pill active px-2.5 py-1 rounded-full font-bold bg-blue-900 text-white transition';
    }
    filterAndRenderServices();
}

function handleServiceLiveSearch(query) {
    state.searchQuery = (query || '').toLowerCase().trim();
    const clearBtn = document.getElementById('clearSearchInputBtn');
    if (clearBtn) {
        if (state.searchQuery.length > 0) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }
    filterAndRenderServices();
}

function clearSearchInput() {
    const searchIn = document.getElementById('serviceLiveSearchInput');
    if (searchIn) {
        searchIn.value = '';
        handleServiceLiveSearch('');
        searchIn.focus();
    }
}

function filterAndRenderServices() {
    const container = document.getElementById('serviceListContainer');
    if (!container) return;

    const cat = state.serviceCatFilter;
    const query = state.searchQuery;

    let filtered = state.services.filter(s => {
        const matchesCat = (cat === 'all') || ((s.category || '').toLowerCase() === cat);
        if (!matchesCat) return false;
        if (!query) return true;

        const title = (s.title || s.name || '').toLowerCase();
        const portal = (s.official_portal_name || '').toLowerCase();
        const desc = (s.description || '').toLowerCase();
        const subcat = (s.subcategory || '').toLowerCase();
        const sid = (s.id || '').toLowerCase();

        return title.includes(query) || portal.includes(query) || desc.includes(query) || subcat.includes(query) || sid.includes(query);
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="p-6 text-center text-slate-500 space-y-2">
                <i class="fa-solid fa-magnifying-glass text-2xl text-slate-300"></i>
                <p class="text-xs font-bold text-slate-700">No service found matching "${escapeHtml(query)}"</p>
                <p class="text-[11px] text-slate-400">Click "+ CUSTOM SERVICE" below to enter manually.</p>
            </div>
        `;
        return;
    }

    // Group by category
    const groups = {};
    filtered.forEach(s => {
        const c = (s.category || 'other').toLowerCase();
        if (!groups[c]) groups[c] = [];
        groups[c].push(s);
    });

    let html = '';
    for (const [groupCat, items] of Object.entries(groups)) {
        const catName = CATEGORY_NAMES[groupCat] || capitalize(groupCat);
        const iconClass = CATEGORY_ICONS[groupCat] || 'fa-solid fa-layer-group text-slate-600';

        html += `
            <div class="py-1">
                <div class="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 rounded-md flex items-center gap-1.5 my-1">
                    <i class="${iconClass}"></i>
                    <span>${catName} (${items.length})</span>
                </div>
        `;

        items.forEach(s => {
            const isSelected = state.selectedService && state.selectedService.id === s.id;
            const selectedClass = isSelected ? 'bg-blue-50 border-blue-600 font-bold' : 'hover:bg-slate-50';
            const sTitle = highlightMatch(s.title || s.name, query);
            const portalName = s.official_portal_name || s.subcategory || capitalize(s.category);

            html += `
                <div onclick="onSelectService('${s.id}')" 
                    class="p-2.5 rounded-lg cursor-pointer transition flex items-center justify-between gap-3 border border-transparent ${selectedClass}">
                    <div class="flex items-center gap-2.5 overflow-hidden">
                        <div class="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0 text-xs">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="truncate">
                            <div class="text-xs font-bold text-slate-800 truncate">${sTitle}</div>
                            <div class="text-[10px] text-slate-400 truncate">${escapeHtml(portalName)} · <span class="font-mono">${s.id}</span></div>
                        </div>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 bg-slate-100 text-slate-600 border border-slate-200">
                        ${s.category}
                    </span>
                </div>
            `;
        });

        html += `</div>`;
    }

    container.innerHTML = html;
}

function highlightMatch(text, query) {
    if (!text) return '';
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query);
    const regex = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escapedText.replace(regex, '<mark class="bg-amber-200 text-amber-900 rounded px-0.5 font-black">$1</mark>');
}

function onSelectService(svcId) {
    const svc = state.services.find(s => s.id === svcId);
    if (!svc) return;

    state.selectedService = svc;

    // Update Trigger UI
    document.getElementById('triggerServiceName').textContent = svc.title || svc.name;
    document.getElementById('triggerServiceMeta').textContent = `${svc.official_portal_name || capitalize(svc.category)} | ID: ${svc.id}`;
    
    const catIconWrap = document.getElementById('triggerCatIcon');
    if (catIconWrap) {
        const iconClass = CATEGORY_ICONS[(svc.category || '').toLowerCase()] || 'fa-solid fa-list-check';
        catIconWrap.innerHTML = `<i class="${iconClass}"></i>`;
    }

    const clearBtn = document.getElementById('clearServiceSelectionBtn');
    if (clearBtn) clearBtn.classList.remove('hidden');

    // Set Hidden Inputs
    document.getElementById('entryServiceId').value = svc.id;
    document.getElementById('entryServiceName').value = svc.title || svc.name;
    document.getElementById('entryCategory').value = svc.category || 'government';

    // Hide custom drawer if open
    cancelCustomServiceMode();

    // Close Dropdown
    closeServiceDropdown();

    // Focus Amount Input
    const amtInput = document.getElementById('entryAmount');
    if (amtInput) amtInput.focus();
}

function clearServiceSelection(e) {
    if (e) e.stopPropagation();
    state.selectedService = null;

    document.getElementById('triggerServiceName').textContent = 'Select or Search a Service...';
    document.getElementById('triggerServiceMeta').textContent = 'Click to search across all central website services';
    
    const catIconWrap = document.getElementById('triggerCatIcon');
    if (catIconWrap) {
        catIconWrap.innerHTML = `<i class="fa-solid fa-list-check"></i>`;
    }

    const clearBtn = document.getElementById('clearServiceSelectionBtn');
    if (clearBtn) clearBtn.classList.add('hidden');

    document.getElementById('entryServiceId').value = '';
    document.getElementById('entryServiceName').value = '';
    document.getElementById('entryCategory').value = 'government';

    filterAndRenderServices();
}

function selectCustomServiceMode() {
    closeServiceDropdown();
    const drawer = document.getElementById('customServiceDrawer');
    if (drawer) drawer.classList.remove('hidden');

    document.getElementById('triggerServiceName').textContent = '✨ Custom Service (Fill details below)';
    document.getElementById('triggerServiceMeta').textContent = 'Manual entry mode active';

    document.getElementById('entryServiceId').value = 'srv-custom';
    document.getElementById('entryServiceName').value = '';

    const nameIn = document.getElementById('customServiceNameInput');
    if (nameIn) {
        nameIn.value = '';
        nameIn.focus();
    }
}

function cancelCustomServiceMode() {
    const drawer = document.getElementById('customServiceDrawer');
    if (drawer) drawer.classList.add('hidden');

    if (!state.selectedService) {
        clearServiceSelection();
    }
}

async function applyCustomService() {
    const name = document.getElementById('customServiceNameInput').value.trim();
    const cat = document.getElementById('customServiceCategorySelect').value;
    const saveToCatalog = document.getElementById('saveCustomToCatalog').checked;

    if (!name) {
        alert('Please enter a custom service name.');
        return;
    }

    document.getElementById('entryServiceId').value = 'srv-custom-' + Date.now().toString(36);
    document.getElementById('entryServiceName').value = name;
    document.getElementById('entryCategory').value = cat;

    document.getElementById('triggerServiceName').textContent = name;
    document.getElementById('triggerServiceMeta').textContent = `Custom Service · ${CATEGORY_NAMES[cat] || cat}`;

    const clearBtn = document.getElementById('clearServiceSelectionBtn');
    if (clearBtn) clearBtn.classList.remove('hidden');

    // If permanent save requested, call API
    if (saveToCatalog) {
        try {
            const res = await apiCall('services/custom', 'POST', {
                title: name,
                category: cat
            });
            if (res && res.service) {
                document.getElementById('entryServiceId').value = res.service.id;
            }
            await loadCentralServices();
        } catch (err) {
            console.warn('Failed to save to catalog:', err);
        }
    }

    cancelCustomServiceMode();

    const amtIn = document.getElementById('entryAmount');
    if (amtIn) amtIn.focus();
}

async function handleNewEntrySubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('saveEntryBtn');
    const alertBox = document.getElementById('newEntryAlert');

    const serviceId = document.getElementById('entryServiceId').value.trim();
    const serviceName = document.getElementById('entryServiceName').value.trim();
    const category = document.getElementById('entryCategory').value.trim() || 'government';
    const amountVal = parseFloat(document.getElementById('entryAmount').value);
    const paymentMode = document.getElementById('entryPaymentMode').value;
    const notes = document.getElementById('entryNotes').value.trim();
    const shouldPrint = document.getElementById('autoPrintSlip').checked;

    if (!serviceName) {
        alert('Please select or enter a Service Name.');
        openServiceDropdown();
        return;
    }
    if (isNaN(amountVal) || amountVal <= 0) {
        alert('Please enter a valid amount in ₹ (greater than 0).');
        document.getElementById('entryAmount').focus();
        return;
    }

    // Anti-duplicate button lock (1.5 seconds)
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving Entry...';
    alertBox.classList.add('hidden');

    try {
        const payload = {
            service_id: serviceId || ('srv-custom-' + Date.now().toString(36)),
            service_name: serviceName,
            category: category,
            amount: amountVal,
            payment_mode: paymentMode,
            notes: notes
        };

        const res = await apiCall('transactions', 'POST', payload);

        // Feedback alert
        alertBox.className = 'p-3 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-between';
        alertBox.innerHTML = `
            <span><i class="fa-solid fa-circle-check text-emerald-600"></i> Entry recorded successfully! <strong>${escapeHtml(serviceName)}</strong> — ₹${Number(amountVal).toFixed(2)} (${res.transaction.transaction_id})</span>
            <span class="font-mono text-[10px] text-emerald-700">${res.transaction.created_at_12hr || ''}</span>
        `;
        alertBox.classList.remove('hidden');

        if (shouldPrint) {
            printSlip(res.transaction);
        }

        // Reset amount to BLANK as required
        document.getElementById('entryAmount').value = '';
        document.getElementById('entryNotes').value = '';

        // Auto hide alert after 4s
        setTimeout(() => alertBox.classList.add('hidden'), 4000);

        // Refresh dashboard and today's records
        if (state.activeTab === 'dashboard') loadDashboardData();
        if (state.activeTab === 'todayRecords') loadTodayRecords();
    } catch (err) {
        alertBox.className = 'p-3 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300';
        alertBox.textContent = err.message || 'Failed to record entry.';
        alertBox.classList.remove('hidden');
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Save & Record Entry</span>';
        }, 1500);
    }
}

// --- TAB 3: EXPENSES MANAGEMENT ---
function onExpenseCategoryChange(val) {
    const wrap = document.getElementById('customExpenseCatWrap');
    if (val === 'Custom Expense') {
        wrap.classList.remove('hidden');
        document.getElementById('customExpenseCatInput').focus();
    } else {
        wrap.classList.add('hidden');
    }
}

async function handleExpenseSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('saveExpenseBtn');
    const alertBox = document.getElementById('expenseAlert');

    let category = document.getElementById('expenseCategory').value;
    if (category === 'Custom Expense') {
        const custVal = document.getElementById('customExpenseCatInput').value.trim();
        category = custVal || 'Custom Expense';
    }

    const amountVal = parseFloat(document.getElementById('expenseAmount').value);
    const paymentMode = document.getElementById('expensePaymentMode').value;
    const note = document.getElementById('expenseNote').value.trim();

    if (isNaN(amountVal) || amountVal <= 0) {
        alert('Please enter a valid expense amount.');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    alertBox.classList.add('hidden');

    try {
        await apiCall('expenses', 'POST', {
            category,
            amount: amountVal,
            payment_mode: paymentMode,
            note
        });

        alertBox.className = 'p-3 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
        alertBox.textContent = `Expense of ₹${Number(amountVal).toFixed(2)} recorded successfully.`;
        alertBox.classList.remove('hidden');

        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseNote').value = '';
        loadExpenses();
    } catch (err) {
        alertBox.className = 'p-3 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300';
        alertBox.textContent = err.message || 'Failed to save expense.';
        alertBox.classList.remove('hidden');
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>Save Expense</span>';
        }, 1000);
    }
}

async function loadExpenses() {
    try {
        const queryCenter = (state.user.role === 'member') ? state.user.center_id : state.viewingCenter;
        const todayStr = new Date().toISOString().split('T')[0];
        const res = await apiCall(`expenses?center_id=${queryCenter}&date=${todayStr}`);
        const list = res.expenses || [];

        const total = list.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        document.getElementById('todayExpenseTotalBadge').textContent = total.toFixed(2);

        const tbody = document.getElementById('expensesTableBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400">No expenses recorded today.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(e => `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-2.5 font-mono text-slate-500">${e.created_at_12hr || format12Hr(e.created_at)}</td>
                <td class="p-2.5 font-bold text-slate-800">${e.category}</td>
                <td class="p-2.5 text-slate-600">${e.note || '-'}</td>
                <td class="p-2.5 text-slate-500">${e.payment_mode || 'Cash'}</td>
                <td class="p-2.5 text-right font-mono font-bold text-rose-600">₹ ${Number(e.amount).toFixed(2)}</td>
                <td class="p-2.5 text-center">
                    <button onclick="deleteExpense('${e.expense_id}')" class="text-rose-600 hover:text-rose-800 p-1" title="Delete Expense">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Failed to load expenses:', e);
    }
}

async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
        await apiCall(`expenses/${id}`, 'DELETE');
        loadExpenses();
    } catch (err) {
        alert(err.message || 'Failed to delete expense.');
    }
}

// --- TAB 4: TODAY'S RECORDS ---
async function loadTodayRecords() {
    try {
        const queryCenter = (state.user.role === 'member') ? state.user.center_id : state.viewingCenter;
        const todayStr = new Date().toISOString().split('T')[0];
        const res = await apiCall(`transactions?center_id=${queryCenter}&date=${todayStr}`);
        state.todayTransactions = res.transactions || [];
        renderTodayTable(state.todayTransactions);
    } catch (e) {
        console.error('Failed to load today records:', e);
    }
}

function renderTxnRow(t) {
    const isDeleted = t.status === 'DELETED' || t.is_deleted === true;
    const isEdited = !isDeleted && (t.status === 'EDITED' || t.is_edited === true);

    let rowClass = 'hover:bg-slate-50';
    let statusBadge = `<span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">NEW</span>`;

    if (isDeleted) {
        rowClass = 'bg-rose-50/90 border-l-4 border-rose-600';
        statusBadge = `<span class="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-black tracking-wide border border-rose-700" title="Deleted on: ${t.deleted_at || ''}">DELETED</span>`;
    } else if (isEdited) {
        rowClass = 'bg-rose-50/70 border-l-4 border-rose-400';
        statusBadge = `<span class="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-extrabold border border-rose-300" title="Edited by: ${t.edited_by || ''} on ${t.updated_at_12hr || ''}">EDITED</span>`;
    }

    const strikeClass = isDeleted ? 'line-through text-slate-400' : '';
    const amountColor = isDeleted ? 'text-slate-400 line-through' : 'text-emerald-600';

    return `
        <tr class="${rowClass} transition border-b border-slate-100">
            <td class="p-2.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">${t.created_at_12hr || format12Hr(t.created_at)}</td>
            <td class="p-2.5 font-medium text-slate-700 text-xs">${t.category}</td>
            <td class="p-2.5 font-bold text-slate-900 text-xs ${strikeClass}">
                ${escapeHtml(t.service_name)}
                ${t.service_id ? `<span class="block text-[10px] font-mono text-slate-400 font-normal">ID: ${t.service_id}</span>` : ''}
            </td>
            <td class="p-2.5 text-slate-500 text-xs">${t.payment_mode || 'Cash'}</td>
            <td class="p-2.5 text-right font-mono font-bold text-xs ${amountColor}">₹ ${Number(t.amount).toFixed(2)}</td>
            <td class="p-2.5 text-center">${statusBadge}</td>
            <td class="p-2.5 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                    ${!isDeleted ? `
                    <button onclick="printSlipById('${t.transaction_id}')" class="p-1 text-slate-500 hover:text-blue-900" title="Print Slip">
                        <i class="fa-solid fa-print"></i>
                    </button>
                    <button onclick="openEditModal('${t.transaction_id}')" class="p-1 text-blue-600 hover:text-blue-800" title="Edit Entry">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onclick="deleteTxn('${t.transaction_id}')" class="p-1 text-rose-600 hover:text-rose-800" title="Delete Entry">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                    ` : `
                    <span class="text-[10px] text-rose-600 font-bold italic">Audited</span>
                    `}
                </div>
            </td>
        </tr>
    `;
}

function renderTodayTable(list) {
    const tbody = document.getElementById('todayRecordsTableBody');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-slate-400">No transactions match the selected filters.</td></tr>';
        return;
    }

    tbody.innerHTML = list.map(t => renderTxnRow(t)).join('');
}

function filterTodayTable() {
    const cat = document.getElementById('todayFilterCategory').value;
    const pay = document.getElementById('todayFilterPayment').value;
    const search = document.getElementById('todaySearchInput').value.toLowerCase().trim();

    let filtered = state.todayTransactions || [];
    if (cat) filtered = filtered.filter(t => t.category === cat);
    if (pay) filtered = filtered.filter(t => (t.payment_mode || 'Cash').includes(pay));
    if (search) {
        filtered = filtered.filter(t => 
            (t.service_name || '').toLowerCase().includes(search) || 
            (t.notes || '').toLowerCase().includes(search) ||
            (t.category || '').toLowerCase().includes(search)
        );
    }
    renderTodayTable(filtered);
}

// --- EDIT MODAL & AUDIT LOGGING ---
function openEditModal(txnId) {
    const txn = state.todayTransactions.find(t => t.transaction_id === txnId);
    if (!txn) return;
    state.editingTxn = txn;

    document.getElementById('editTxnId').value = txn.transaction_id;
    document.getElementById('editServiceName').value = txn.service_name;
    document.getElementById('editAmount').value = txn.amount;
    document.getElementById('editPaymentMode').value = txn.payment_mode || 'Cash';
    document.getElementById('editReason').value = '';

    document.getElementById('editTxnModal').classList.remove('hidden');
}

function closeEditModal() {
    state.editingTxn = null;
    document.getElementById('editTxnModal').classList.add('hidden');
}

async function handleEditSubmit(e) {
    e.preventDefault();
    if (!state.editingTxn) return;

    const txnId = document.getElementById('editTxnId').value;
    const serviceName = document.getElementById('editServiceName').value.trim();
    const amountVal = parseFloat(document.getElementById('editAmount').value);
    const paymentMode = document.getElementById('editPaymentMode').value;
    const reason = document.getElementById('editReason').value.trim();

    if (isNaN(amountVal) || amountVal <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    try {
        await apiCall(`transactions/${txnId}`, 'PUT', {
            service_name: serviceName,
            amount: amountVal,
            payment_mode: paymentMode,
            reason
        });

        alert('Transaction updated successfully. Audit history recorded.');
        closeEditModal();
        loadTodayRecords();
        loadDashboardData();
    } catch (err) {
        alert(err.message || 'Failed to update transaction.');
    }
}

async function deleteTxn(txnId) {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;
    try {
        await apiCall(`transactions/${txnId}`, 'DELETE');
        loadTodayRecords();
        loadDashboardData();
    } catch (err) {
        alert(err.message || 'Failed to delete transaction.');
    }
}

// --- TAB 5: DAILY HISTORY ---
async function loadDailyHistory() {
    const d = document.getElementById('historyDateInput').value;
    if (d) loadHistoryForDate(d);
}

async function loadHistoryForDate(dateStr) {
    if (!dateStr) return;
    try {
        const queryCenter = (state.user.role === 'member') ? state.user.center_id : state.viewingCenter;
        const res = await apiCall(`daily-history?center_id=${queryCenter}&date=${dateStr}`);

        document.getElementById('histOpeningBalance').textContent = Number(res.opening_balance || 0).toFixed(2);
        document.getElementById('histTotalIncome').textContent = Number(res.total_income || 0).toFixed(2);
        document.getElementById('histTotalExpense').textContent = Number(res.total_expense || 0).toFixed(2);
        document.getElementById('histClosingBalance').textContent = Number(res.closing_balance || 0).toFixed(2);

        const tbody = document.getElementById('historyTableBody');
        const list = res.transactions || [];
        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400">No transactions recorded on this date.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(t => `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-2.5 font-mono text-slate-500">${t.created_at_12hr || format12Hr(t.created_at)}</td>
                <td class="p-2.5 font-medium text-slate-700">${t.category}</td>
                <td class="p-2.5 font-bold text-slate-900">${t.service_name}</td>
                <td class="p-2.5 text-slate-500">${t.payment_mode || 'Cash'}</td>
                <td class="p-2.5 text-right font-mono font-bold text-emerald-600">₹ ${Number(t.amount).toFixed(2)}</td>
                <td class="p-2.5 text-center">${t.is_edited ? '<span class="badge-edited px-1.5 py-0.5 rounded text-[10px] font-bold">EDITED</span>' : '<span class="text-emerald-600 text-[11px] font-bold">OK</span>'}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Failed to load history:', e);
    }
}

// --- TAB 6: MONTHLY REPORT ---
async function loadMonthlyReport(monthStr) {
    if (!monthStr) {
        const picker = document.getElementById('monthlyReportPicker');
        monthStr = picker ? picker.value : '';
    }
    if (!monthStr) return;

    try {
        const queryCenter = (state.user.role === 'member') ? state.user.center_id : state.viewingCenter;
        const res = await apiCall(`summary/today?center_id=${queryCenter}&month=${monthStr}`);

        document.getElementById('monthGrossIncome').textContent = Number(res.month_income || 0).toFixed(2);
        document.getElementById('monthTotalExpense').textContent = Number(res.month_expense || 0).toFixed(2);
        document.getElementById('monthNetIncome').textContent = Number(res.month_net || 0).toFixed(2);

        // Fetch day by day transactions to build breakdown
        const txnsRes = await apiCall(`transactions?center_id=${queryCenter}&month=${monthStr}`);
        const expsRes = await apiCall(`expenses?center_id=${queryCenter}&month=${monthStr}`);

        const daysMap = {};
        (txnsRes.transactions || []).forEach(t => {
            const d = t.transaction_date;
            if (!daysMap[d]) daysMap[d] = { income: 0, expense: 0, count: 0 };
            daysMap[d].income += parseFloat(t.amount) || 0;
            daysMap[d].count += 1;
        });
        (expsRes.expenses || []).forEach(e => {
            const d = e.expense_date;
            if (!daysMap[d]) daysMap[d] = { income: 0, expense: 0, count: 0 };
            daysMap[d].expense += parseFloat(e.amount) || 0;
        });

        const sortedDays = Object.keys(daysMap).sort().reverse();
        const tbody = document.getElementById('monthBreakdownTableBody');
        if (!tbody) return;

        if (sortedDays.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400">No records found for this month.</td></tr>';
            return;
        }

        tbody.innerHTML = sortedDays.map(d => {
            const row = daysMap[d];
            const net = row.income - row.expense;
            return `
                <tr class="hover:bg-slate-50 transition">
                    <td class="p-2.5 font-bold font-mono text-slate-800">${d}</td>
                    <td class="p-2.5 text-right font-mono font-bold text-emerald-600">₹ ${row.income.toFixed(2)}</td>
                    <td class="p-2.5 text-right font-mono font-bold text-rose-600">₹ ${row.expense.toFixed(2)}</td>
                    <td class="p-2.5 text-right font-mono font-bold ${net >= 0 ? 'text-blue-700' : 'text-rose-700'}">₹ ${net.toFixed(2)}</td>
                    <td class="p-2.5 text-center font-bold text-slate-600">${row.count}</td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        console.error('Failed to load monthly report:', e);
    }
}

// --- TAB 7: SERVICE REPORT ---
async function loadServiceReport() {
    try {
        const queryCenter = (state.user.role === 'member') ? state.user.center_id : state.viewingCenter;
        const res = await apiCall(`reports/service?center_id=${queryCenter}`);
        const list = res.report || [];
        const tbody = document.getElementById('serviceReportTableBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400">No service data found.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map((item, idx) => `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-2.5 font-bold text-slate-400">${idx + 1}</td>
                <td class="p-2.5 font-bold text-slate-800">${item.service_name}</td>
                <td class="p-2.5 text-center font-bold text-blue-900">${item.count}</td>
                <td class="p-2.5 text-right font-mono font-bold text-emerald-600">₹ ${Number(item.total_amount).toFixed(2)}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Service report error:', e);
    }
}

// --- TAB 8: EXPENSE REPORT ---
async function loadExpenseReport() {
    try {
        const queryCenter = (state.user.role === 'member') ? state.user.center_id : state.viewingCenter;
        const res = await apiCall(`reports/expense?center_id=${queryCenter}`);
        const list = res.report || [];
        const tbody = document.getElementById('expenseReportTableBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400">No expense data found.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map((item, idx) => `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-2.5 font-bold text-slate-400">${idx + 1}</td>
                <td class="p-2.5 font-bold text-slate-800">${item.category}</td>
                <td class="p-2.5 text-center font-bold text-blue-900">${item.count}</td>
                <td class="p-2.5 text-right font-mono font-bold text-rose-600">₹ ${Number(item.total_amount).toFixed(2)}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Expense report error:', e);
    }
}

// --- TAB 9: AUDIT HISTORY ---
async function loadAuditHistory() {
    try {
        const queryCenter = (state.user.role === 'member') ? state.user.center_id : state.viewingCenter;
        const res = await apiCall(`audit-history?center_id=${queryCenter}`);
        const list = res.history || [];
        const tbody = document.getElementById('auditHistoryTableBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-400">No audit logs found.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(h => `
            <tr class="hover:bg-slate-50 transition text-xs">
                <td class="p-2.5 font-mono text-slate-500">${format12Hr(h.edited_at)}</td>
                <td class="p-2.5 font-bold text-slate-800">${h.edited_by_name || h.edited_by}</td>
                <td class="p-2.5 text-slate-600">${h.center_id}</td>
                <td class="p-2.5 text-slate-600">${h.entity_type}</td>
                <td class="p-2.5 font-semibold text-slate-700">${h.field_changed}</td>
                <td class="p-2.5 text-right font-mono text-rose-600">${h.old_value}</td>
                <td class="p-2.5 text-right font-mono text-emerald-600 font-bold">${h.new_value}</td>
                <td class="p-2.5 text-slate-500 italic">${h.reason || '-'}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Audit history error:', e);
    }
}

// --- TAB 10: MEMBER MANAGEMENT (Admin Only) ---
async function loadMembers() {
    try {
        const res = await apiCall('members');
        const list = res.members || [];
        const tbody = document.getElementById('membersTableBody');
        if (!tbody) return;

        tbody.innerHTML = list.map(m => {
            const centerObj = state.centers.find(c => c.center_id === m.center_id);
            const centerName = centerObj ? centerObj.center_name : m.center_id;
            const statusClass = m.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';

            return `
                <tr class="hover:bg-slate-50 transition">
                    <td class="p-2.5 font-bold text-slate-900">${m.name}</td>
                    <td class="p-2.5 font-mono text-slate-600">${m.username}</td>
                    <td class="p-2.5 font-medium text-slate-800">${centerName}</td>
                    <td class="p-2.5 capitalize text-slate-600 font-semibold">${m.role}</td>
                    <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${statusClass}">${m.status}</span></td>
                    <td class="p-2.5 text-center">
                        <button onclick="toggleMemberStatus('${m.user_id}', '${m.status === 'active' ? 'inactive' : 'active'}')" 
                            class="px-2 py-1 rounded text-xs font-bold ${m.status === 'active' ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}">
                            ${m.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        console.error('Members load error:', e);
    }
}

function openAddMemberModal() {
    const sel = document.getElementById('newMemberCenterSelect');
    if (sel && state.centers) {
        sel.innerHTML = state.centers.map(c => `<option value="${c.center_id}">${c.center_name}</option>`).join('');
    }
    document.getElementById('addMemberModal').classList.remove('hidden');
}

function closeAddMemberModal() {
    document.getElementById('addMemberModal').classList.add('hidden');
}

async function handleAddMemberSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('newMemberName').value.trim();
    const username = document.getElementById('newMemberUsername').value.trim();
    const password = document.getElementById('newMemberPassword').value.trim();
    const center_id = document.getElementById('newMemberCenterSelect').value;
    const role = document.getElementById('newMemberRole').value;

    try {
        await apiCall('members', 'POST', { name, username, password, center_id, role });
        alert('New member created successfully.');
        closeAddMemberModal();
        loadMembers();
    } catch (err) {
        alert(err.message || 'Failed to create member.');
    }
}

async function toggleMemberStatus(userId, newStatus) {
    try {
        await apiCall(`members/${userId}/status`, 'POST', { status: newStatus });
        loadMembers();
    } catch (err) {
        alert(err.message || 'Failed to update member status.');
    }
}

// --- TAB 11: CENTER MANAGEMENT (Admin Only) ---
async function loadCenters() {
    try {
        const res = await apiCall('centers');
        state.centers = res.centers || [];
        const tbody = document.getElementById('centersTableBody');
        if (!tbody) return;

        tbody.innerHTML = state.centers.map(c => `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-2.5 font-mono font-bold text-blue-900">${c.center_id}</td>
                <td class="p-2.5 font-bold text-slate-800">${c.center_name}</td>
                <td class="p-2.5 text-slate-600">${c.address}</td>
                <td class="p-2.5 font-mono text-slate-700">${c.mobile}</td>
                <td class="p-2.5 text-slate-500">${c.email || '-'}</td>
                <td class="p-2.5 text-center">
                    <span class="text-xs text-emerald-600 font-bold">Active Outlet</span>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Centers load error:', e);
    }
}

function openAddCenterModal() {
    document.getElementById('addCenterModal').classList.remove('hidden');
}

function closeAddCenterModal() {
    document.getElementById('addCenterModal').classList.add('hidden');
}

async function handleAddCenterSubmit(e) {
    e.preventDefault();
    const center_id = document.getElementById('newCenterId').value.trim().toUpperCase();
    const center_name = document.getElementById('newCenterName').value.trim();
    const address = document.getElementById('newCenterAddress').value.trim();
    const mobile = document.getElementById('newCenterMobile').value.trim();
    const email = document.getElementById('newCenterEmail').value.trim();

    try {
        await apiCall('centers', 'POST', { center_id, center_name, address, mobile, email });
        alert('New center registered successfully.');
        closeAddCenterModal();
        loadCenters();
        setupUIForUser();
    } catch (err) {
        alert(err.message || 'Failed to add center.');
    }
}

// --- TAB 12: BACKUP & RESTORE ---
async function downloadBillingBackup() {
    try {
        const res = await apiCall('backup');
        const blob = new Blob([JSON.stringify(res.database, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `billing_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        alert(err.message || 'Failed to export backup.');
    }
}

async function restoreBillingBackup() {
    const fileInput = document.getElementById('restoreFileInput');
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a JSON backup file to restore.');
        return;
    }
    if (!confirm('WARNING: Restoring will overwrite current billing records with backup data. Proceed?')) {
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const dbData = JSON.parse(e.target.result);
            await apiCall('restore', 'POST', { database: dbData });
            alert('Database restored successfully! Reloading...');
            location.reload();
        } catch (err) {
            alert('Failed to restore database: ' + err.message);
        }
    };
    reader.readAsText(file);
}

// --- PRINT FUNCTIONS ---
function printSlipById(txnId) {
    const txn = state.todayTransactions.find(t => t.transaction_id === txnId);
    if (txn) printSlip(txn);
}

function printSlip(t) {
    const center = state.centers.find(c => c.center_id === t.center_id) || state.center;
    if (center) {
        document.getElementById('slipCenterName').textContent = center.center_name;
        document.getElementById('slipCenterAddress').textContent = center.address;
        document.getElementById('slipCenterContact').textContent = `Mob: ${center.mobile}`;
    }
    document.getElementById('slipTxnId').textContent = t.transaction_id;
    document.getElementById('slipTimestamp').textContent = t.created_at_12hr || format12Hr(t.created_at);
    document.getElementById('slipCategory').textContent = t.category;
    document.getElementById('slipPaymentMode').textContent = t.payment_mode || 'Cash';
    document.getElementById('slipServiceName').textContent = t.service_name;
    document.getElementById('slipAmount').textContent = `₹ ${Number(t.amount).toFixed(2)}`;

    const slip = document.getElementById('printableSlip');
    slip.classList.remove('hidden');
    window.print();
    slip.classList.add('hidden');
}

function printDailySummary() {
    const center = (state.viewingCenter === 'all' && state.user.role === 'admin') 
        ? { center_name: 'ALL CENTERS CONSOLIDATED REGISTER', address: 'Consolidated Accounts Summary', mobile: 'N/A' }
        : (state.centers.find(c => c.center_id === state.viewingCenter) || state.center);

    document.getElementById('repCenterName').textContent = center.center_name;
    document.getElementById('repCenterMeta').textContent = `${center.address} | Contact: ${center.mobile}`;
    document.getElementById('repTitle').textContent = `DAILY ACCOUNTING SUMMARY — ${new Date().toLocaleDateString('en-GB')}`;
    document.getElementById('repDate').textContent = `Generated: ${format12Hr(new Date())}`;

    const repContent = document.getElementById('repContent');
    const income = state.todayData ? state.todayData.today_income : 0;
    const expense = state.todayData ? state.todayData.today_expense : 0;
    const opening = state.todayData ? state.todayData.opening_balance : 0;
    const closing = state.todayData ? state.todayData.today_closing : 0;

    repContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border: 1px solid #ccc; padding: 10px;">
            <div><strong>Opening Balance:</strong> ₹ ${Number(opening).toFixed(2)}</div>
            <div><strong>Total Income:</strong> ₹ ${Number(income).toFixed(2)}</div>
            <div><strong>Total Expense:</strong> ₹ ${Number(expense).toFixed(2)}</div>
            <div><strong>Closing Cash:</strong> ₹ ${Number(closing).toFixed(2)}</div>
        </div>
        <h4>Today's Income Transactions (${(state.todayTransactions || []).length} items):</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px;">
            <thead>
                <tr style="background: #f0f0f0; border-bottom: 1px solid #000;">
                    <th style="padding: 4px; text-align: left;">Time</th>
                    <th style="padding: 4px; text-align: left;">Service</th>
                    <th style="padding: 4px; text-align: left;">Payment</th>
                    <th style="padding: 4px; text-align: right;">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                ${(state.todayTransactions || []).map(t => `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 4px;">${t.created_at_12hr || format12Hr(t.created_at)}</td>
                        <td style="padding: 4px;">${t.service_name}</td>
                        <td style="padding: 4px;">${t.payment_mode || 'Cash'}</td>
                        <td style="padding: 4px; text-align: right; font-weight: bold;">₹ ${Number(t.amount).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    const rep = document.getElementById('printableReport');
    rep.classList.remove('hidden');
    window.print();
    rep.classList.add('hidden');
}

function printHistoryReport() {
    printDailySummary();
}

function printMonthlyReport() {
    window.print();
}
