// ==================== CONFIG ====================
const API_URL = 'http://localhost:3000/api/v1';
let authToken = localStorage.getItem('admin_token');

// ==================== AUTH ====================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const login = document.getElementById('loginInput').value;
    const password = document.getElementById('passwordInput').value;
    const otp = document.getElementById('otpInput').value;

    try {
        const response = await fetch(`${API_URL}/admin/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password, otpCode: otp || undefined }),
        });

        const data = await response.json();

        if (data.accessToken) {
            authToken = data.accessToken;
            localStorage.setItem('admin_token', authToken);
            showApp();
        } else if (data.requiresOtp) {
            document.getElementById('loginError').textContent = data.message;
            document.getElementById('loginError').style.display = 'block';
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'Ошибка подключения';
        document.getElementById('loginError').style.display = 'block';
    }
});

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
    navigate('dashboard');
}

function logout() {
    localStorage.removeItem('admin_token');
    authToken = null;
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display = 'none';
}

// ==================== NAVIGATION ====================
function navigate(page) {
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    document.querySelector(`a[href="#${page}"]`)?.classList.add('active');

    const content = document.getElementById('pageContent');

    switch(page) {
        case 'dashboard': renderDashboard(content); break;
        case 'users': renderUsers(content); break;
        case 'reports': renderReports(content); break;
        case 'stats': renderStats(content); break;
        case 'audit': renderAudit(content); break;
        case 'legal': renderLegal(content); break;
    }
}

// ==================== DASHBOARD ====================
async function renderDashboard(container) {
    container.innerHTML = '<div class="row"><div class="col-12"><h2>Dashboard</h2><div class="spinner-border"></div></div></div>';

    try {
        const res = await fetch(`${API_URL}/admin/stats/overview`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        const data = await res.json();

        container.innerHTML = `
            <h2>Dashboard</h2>
            <div class="row g-3 mt-2">
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${data.totalUsers}</h3>
                        <p>Всего пользователей</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${data.activeUsers}</h3>
                        <p>Активных</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${data.activeSubscriptions}</h3>
                        <p>Активных подписок</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${data.conversionRate}%</h3>
                        <p>Конверсия</p>
                    </div>
                </div>
            </div>
            <div class="row g-3 mt-2">
                <div class="col-md-4">
                    <div class="stat-card">
                        <h3>${data.newToday}</h3>
                        <p>Новых сегодня</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card">
                        <h3>${data.newThisWeek}</h3>
                        <p>Новых за неделю</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card">
                        <h3>${data.newThisMonth}</h3>
                        <p>Новых за месяц</p>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<div class="alert alert-danger">Ошибка загрузки данных</div>';
    }
}

// ==================== USERS ====================
async function renderUsers(container) {
    container.innerHTML = `
        <h2>Users</h2>
        <div class="table-container mt-3">
            <input type="text" class="form-control mb-3" id="searchInput" placeholder="Поиск по email/имени...">
            <table class="table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>City</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="usersTable"></tbody>
            </table>
        </div>
    `;

    try {
        const res = await fetch(`${API_URL}/admin/users?page=1&limit=50`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        const data = await res.json();

        const tbody = document.getElementById('usersTable');
        data.data.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td>${user.email || '-'}</td>
                    <td>${user.name || '-'}</td>
                    <td>${user.city || '-'}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        container.innerHTML += '<div class="alert alert-danger mt-3">Ошибка загрузки</div>';
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure?')) return;

    await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` },
    });

    navigate('users');
}

// ==================== REPORTS ====================
async function renderReports(container) {
    container.innerHTML = `
        <h2>Reports</h2>
        <div class="table-container mt-3">
            <table class="table">
                <thead>
                    <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="reportsTable"></tbody>
            </table>
        </div>
    `;

    try {
        const res = await fetch(`${API_URL}/admin/reports`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        const data = await res.json();

        const tbody = document.getElementById('reportsTable');
        data.forEach(report => {
            tbody.innerHTML += `
                <tr>
                    <td>${report.fromUser.email}</td>
                    <td>${report.toUser.email}</td>
                    <td>${report.reason}</td>
                    <td>${report.status}</td>
                    <td>${new Date(report.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="updateReport('${report.id}', 'RESOLVED')">Resolve</button>
                        <button class="btn btn-sm btn-secondary" onclick="updateReport('${report.id}', 'IGNORED')">Ignore</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        container.innerHTML += '<div class="alert alert-danger mt-3">Ошибка загрузки</div>';
    }
}

async function updateReport(reportId, status) {
    await fetch(`${API_URL}/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });

    navigate('reports');
}

// ==================== AUDIT ====================
async function renderAudit(container) {
    container.innerHTML = `
        <h2>Audit Log</h2>
        <div class="table-container mt-3">
            <table class="table">
                <thead>
                    <tr>
                        <th>Admin</th>
                        <th>Action</th>
                        <th>Type</th>
                        <th>IP</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody id="auditTable"></tbody>
            </table>
        </div>
    `;

    try {
        const res = await fetch(`${API_URL}/admin/audit?page=1&limit=50`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        const data = await res.json();

        const tbody = document.getElementById('auditTable');
        data.data.forEach(log => {
            tbody.innerHTML += `
                <tr>
                    <td>${log.admin.login}</td>
                    <td>${log.action}</td>
                    <td>${log.targetType}</td>
                    <td>${log.ip || '-'}</td>
                    <td>${new Date(log.createdAt).toLocaleDateString()}</td>
                </tr>
            `;
        });
    } catch (error) {
        container.innerHTML += '<div class="alert alert-danger mt-3">Ошибка загрузки</div>';
    }
}

// ==================== STATS ====================
async function renderStats(container) {
    container.innerHTML = `
        <h2>Stats</h2>
        <div class="table-container mt-3">
            <p>Графики будут добавлены в следующей версии</p>
        </div>
    `;
}

// ==================== LEGAL ====================
async function renderLegal(container) {
    container.innerHTML = `
        <h2>Legal Documents</h2>
        <div class="table-container mt-3">
            <p>Управление юридическими документами</p>
        </div>
    `;
}

// ==================== INIT ====================
if (authToken) {
    showApp();
}
