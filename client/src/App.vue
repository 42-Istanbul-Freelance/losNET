<template>
  <div id="app">
    <nav v-if="authStore.isAuthenticated" class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-icon">💙</span>
          <span class="brand-text">LÖSEV İnci</span>
        </router-link>
      </div>

      <div class="navbar-menu">
        <!-- Öğrenci menüsü -->
        <template v-if="authStore.isStudent">
          <router-link to="/student/dashboard" class="nav-link">Panelim</router-link>
          <router-link to="/student/activities" class="nav-link">Faaliyetlerim</router-link>
          <router-link to="/student/activities/new" class="nav-link nav-link-primary">+ Faaliyet Ekle</router-link>
          <router-link to="/student/certificates" class="nav-link">Rozetlerim</router-link>
          <router-link to="/student/profile" class="nav-link">Profilim</router-link>
        </template>

        <!-- Öğretmen menüsü -->
        <template v-if="authStore.isTeacher">
          <router-link to="/teacher/dashboard" class="nav-link">Panel</router-link>
          <router-link to="/teacher/pending" class="nav-link">Onay Bekleyenler</router-link>
          <router-link to="/teacher/school-report" class="nav-link">Okul Raporu</router-link>
        </template>

        <!-- Admin menüsü -->
        <template v-if="authStore.isAdmin">
          <router-link to="/admin/dashboard" class="nav-link">Genel Merkez</router-link>
        </template>
      </div>

      <div class="navbar-end">
        <span class="user-name">{{ authStore.userName }}</span>
        <span class="user-role badge" :class="'badge-' + authStore.role">
          {{ roleLabel }}
        </span>
        <button class="btn-logout" @click="handleLogout">Çıkış</button>
      </div>
    </nav>

    <main class="main-content" :class="{ 'no-nav': !authStore.isAuthenticated }">
      <router-view />
    </main>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const roleLabel = computed(() => {
      const labels = { student: 'Öğrenci', teacher: 'Öğretmen', admin: 'Genel Merkez' }
      return labels[authStore.role] || ''
    })

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    return { authStore, roleLabel, handleLogout }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

:root {
  --primary: #7c3aed;
  --primary-dark: #5b21b6;
  --primary-light: #ede9fe;
  --secondary: #f59e0b;
  --accent-coral: #f43f5e;
  --accent-teal: #14b8a6;
  --accent-violet: #8b5cf6;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  --bg: linear-gradient(135deg, #fdf4ff 0%, #f5f3ff 25%, #ecfeff 50%, #fefce8 75%, #fdf2f8 100%);
  --bg-solid: #faf5ff;
  --bg-card: rgba(255, 255, 255, 0.85);
  --bg-card-glass: rgba(255, 255, 255, 0.6);
  --text: #1e1b4b;
  --text-secondary: #6b7280;
  --border: rgba(139, 92, 246, 0.2);
  --shadow: 0 4px 20px rgba(124, 58, 237, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 20px 40px rgba(124, 58, 237, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06);
  --radius: 16px;
  --radius-sm: 10px;
  --radius-xl: 24px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg-solid);
  background-image: var(--bg);
  background-attachment: fixed;
  color: var(--text);
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navbar */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 72px;
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(253,244,255,0.95) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 4px 30px rgba(124, 58, 237, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  background: linear-gradient(135deg, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
  font-size: 20px;
  transition: var(--transition);
}

.brand-link:hover {
  transform: scale(1.02);
}

.brand-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(124, 58, 237, 0.3));
}

.navbar-menu {
  display: flex;
  gap: 6px;
}

.nav-link {
  padding: 10px 18px;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  transition: var(--transition);
}

.nav-link:hover {
  background: linear-gradient(135deg, #ede9fe, #fce7f3);
  color: var(--primary);
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #ede9fe, #fce7f3);
  color: var(--primary);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
}

.nav-link-primary {
  background: linear-gradient(135deg, #7c3aed, #ec4899) !important;
  color: white !important;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
}

.nav-link-primary:hover {
  background: linear-gradient(135deg, #6d28d9, #db2777) !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5);
}

.navbar-end {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
}

.badge {
  padding: 6px 12px;
  border-radius: 24px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-student {
  background: linear-gradient(135deg, #ddd6fe, #e9d5ff);
  color: #5b21b6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}
.badge-teacher {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #b45309;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.badge-admin {
  background: linear-gradient(135deg, #a7f3d0, #6ee7b7);
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.btn-logout {
  padding: 8px 18px;
  background: transparent;
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-sm);
  color: var(--danger);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-logout:hover {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Main content */
.main-content {
  flex: 1;
  padding: 28px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.main-content.no-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: none;
  padding: 0;
}

/* Genel yardımcı stiller */
.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 30px;
  font-weight: 800;
  background: linear-gradient(135deg, #1e1b4b, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin-top: 6px;
  font-weight: 500;
}

.card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  transition: var(--transition);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: rgba(124, 58, 237, 0.3);
}

.card-title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  text-align: center;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--accent-teal));
  opacity: 0.8;
}

.stat-card:nth-child(1)::before { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
.stat-card:nth-child(2)::before { background: linear-gradient(90deg, #14b8a6, #2dd4bf); }
.stat-card:nth-child(3)::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.stat-card:nth-child(4)::before { background: linear-gradient(90deg, #ec4899, #f472b6); }

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--accent-teal));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-card:nth-child(1) .stat-value { background: linear-gradient(135deg, #7c3aed, #a78bfa); -webkit-background-clip: text; background-clip: text; }
.stat-card:nth-child(2) .stat-value { background: linear-gradient(135deg, #14b8a6, #2dd4bf); -webkit-background-clip: text; background-clip: text; }
.stat-card:nth-child(3) .stat-value { background: linear-gradient(135deg, #f59e0b, #fbbf24); -webkit-background-clip: text; background-clip: text; }
.stat-card:nth-child(4) .stat-value { background: linear-gradient(135deg, #ec4899, #f472b6); -webkit-background-clip: text; background-clip: text; }

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 6px;
  font-weight: 600;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, #7c3aed, #ec4899);
  color: white;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #6d28d9, #db2777);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
}

.btn-outline {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
}

.btn-outline:hover {
  background: var(--primary-light);
  transform: translateY(-1px);
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: inherit;
  transition: var(--transition);
  background: rgba(255, 255, 255, 0.9);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.15);
}

.form-textarea {
  resize: vertical;
  min-height: 90px;
}

.table-container {
  overflow-x: auto;
  border-radius: var(--radius);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 14px 18px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  font-weight: 700;
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  background: rgba(124, 58, 237, 0.05);
}

td {
  font-size: 14px;
}

tr:hover {
  background: linear-gradient(90deg, rgba(124, 58, 237, 0.06), rgba(236, 72, 153, 0.04));
}

.status-badge {
  padding: 6px 12px;
  border-radius: 24px;
  font-size: 12px;
  font-weight: 700;
}

.status-pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #b45309;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.status-approved {
  background: linear-gradient(135deg, #a7f3d0, #6ee7b7);
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.3);
}
.status-rejected {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  color: #b91c1c;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.status-revision_requested {
  background: linear-gradient(135deg, #ddd6fe, #e9d5ff);
  color: #5b21b6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.alert {
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  margin-bottom: 18px;
  font-size: 14px;
  font-weight: 600;
}

.alert-error {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  color: #b91c1c;
  border: 2px solid rgba(239, 68, 68, 0.3);
}

.alert-success {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #047857;
  border: 2px solid rgba(16, 185, 129, 0.3);
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(124, 58, 237, 0.15);
  border-radius: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #ec4899);
  border-radius: 12px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: var(--text-secondary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .navbar {
    flex-wrap: wrap;
    height: auto;
    padding: 16px;
    gap: 10px;
  }
  .navbar-menu {
    order: 3;
    width: 100%;
    overflow-x: auto;
  }
  .main-content {
    padding: 20px;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
