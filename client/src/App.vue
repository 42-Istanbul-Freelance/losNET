<template>
  <div id="app">
    <!-- Navbar: Yalnızca kullanıcı giriş yapmışsa VE sayfa authLayout değilse gösterilir.
         Zaten authLayout olan sayfalarda navigasyon barı kasten gizlenir. -->
    <nav v-if="authStore.isAuthenticated && !$route.meta.authLayout" class="navbar">
      <div class="navbar-brand">
        <router-link to="/student/dashboard" class="brand-link">
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
        <NotificationBell />
        <span class="user-name">{{ authStore.userName }}</span>
        <span class="user-role badge" :class="'badge-' + authStore.role">
          {{ roleLabel }}
        </span>
        <button class="btn-logout" @click="handleLogout">Çıkış</button>
      </div>
    </nav>

    <!-- Ana İçerik Alanı -->
    <main class="main-content" :class="{ 'auth-layout': $route.meta.authLayout }">
      <router-view />
    </main>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import NotificationBell from './components/NotificationBell.vue'

export default {
  name: 'App',
  components: { NotificationBell },
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
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap');

:root {
  /* Unisex Doğa ve Umut Paleti */
  --pastel-mint: #b2dfdb;
  --pastel-peach: #ffe0b2;
  --pastel-lavender: #b3e5fc;
  --pastel-pink: #c8e6c9;
  --pastel-sky: #a8d8ff;
  --pastel-butter: #fff9c4;
  --pastel-coral: #ffcc80;
  --pastel-lilac: #80cbc4;
  --primary: #4db6ac;
  --primary-dark: #00897b;
  --primary-light: #e0f2f1;
  --secondary: #ff9800;
  --accent-coral: #ffb74d;
  --accent-teal: #80cbc4;
  --accent-violet: #81d4fa;
  --success: #81c784;
  --danger: #e57373;
  --warning: #ffb74d;
  --info: #4fc3f7;
  --bg: linear-gradient(135deg, #f1f8e9 0%, #e0f2f1 20%, #e8f4ff 40%, #fff3e0 60%, #e8f5e9 80%, #f9fbe7 100%);
  --bg-solid: #f1f8e9;
  --white-filter: linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92));
  --bg-card: var(--white-filter), rgba(190, 255, 200, 0.96);
  --bg-card-glass: var(--white-filter), rgba(190, 255, 200, 0.85);
  --text: #37474f;
  --text-secondary: #546e7a;
  --border: rgba(77, 182, 172, 0.35);
  --shadow: 0 6px 24px rgba(77, 182, 172, 0.12), 0 4px 12px rgba(255, 152, 0, 0.08);
  --shadow-lg: 0 24px 48px rgba(77, 182, 172, 0.15), 0 12px 24px rgba(255, 152, 0, 0.1);
  --radius: 24px;
  --radius-sm: 16px;
  --radius-xl: 32px;
  --radius-blob: 60% 40% 30% 70% / 60% 30% 70% 40%;
  --transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg-solid);
  background-image: var(--bg);
  background-size: 400% 400%;
  animation: smoothBg 15s ease infinite;
  background-attachment: fixed;
  color: var(--text);
  line-height: 1.6;
  position: relative;
  overflow-x: hidden;
}

@keyframes smoothBg {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Dekoratif çizgi film şekilleri - arka plan */
body::before,
body::after {
  content: '';
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}
body::before {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--pastel-lavender) 0%, transparent 70%);
  top: -150px;
  right: -100px;
  animation: float 20s ease-in-out infinite;
}
body::after {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--pastel-peach) 0%, transparent 70%);
  bottom: -80px;
  left: -80px;
  animation: float 18s ease-in-out infinite reverse;
}
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* Navbar - çizgi film tarzı */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 76px;
  background: linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,243,224,0.92) 50%, rgba(232,245,255,0.92) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, var(--pastel-coral), var(--pastel-lavender), var(--pastel-mint)) 1;
  box-shadow: 0 8px 32px rgba(77, 182, 172, 0.15), 0 2px 12px rgba(255, 152, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  border-radius: 0 0 24px 24px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  background: linear-gradient(135deg, #00897b, #ff9800, #4db6ac);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  font-size: 22px;
  transition: var(--transition);
}

.brand-link:hover {
  transform: scale(1.05) rotate(-1deg);
}

.brand-icon {
  font-size: 32px;
  filter: drop-shadow(0 4px 8px rgba(77, 182, 172, 0.4));
  animation: bounce 2s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.navbar-menu {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 12px 20px;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  transition: var(--transition);
  border: 2px solid transparent;
}

.nav-link:hover {
  background: linear-gradient(135deg, var(--pastel-lavender), var(--pastel-pink));
  color: var(--text);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(77, 182, 172, 0.3);
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, var(--pastel-lilac), var(--pastel-pink));
  color: var(--text);
  box-shadow: 0 4px 16px rgba(77, 182, 172, 0.35);
  border-color: rgba(255, 255, 255, 0.5);
}

.nav-link-primary {
  background: linear-gradient(135deg, #4db6ac, #ff9800) !important;
  color: white !important;
  box-shadow: 0 6px 20px rgba(77, 182, 172, 0.4);
  border: 2px solid rgba(255,255,255,0.5) !important;
}

.nav-link-primary:hover {
  background: linear-gradient(135deg, #00897b, #f57c00) !important;
  color: white !important;
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 10px 28px rgba(77, 182, 172, 0.5);
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
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 2px solid rgba(255,255,255,0.6);
}
.badge-student {
  background: linear-gradient(135deg, var(--pastel-lavender), var(--pastel-lilac));
  color: #5e4a7a;
}
.badge-teacher {
  background: linear-gradient(135deg, var(--pastel-butter), var(--pastel-peach));
  color: #8b6914;
}
.badge-admin {
  background: linear-gradient(135deg, var(--pastel-mint), var(--accent-teal));
  color: #2d6a4f;
}

.btn-logout {
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(255,138,128,0.2), rgba(229,115,115,0.2));
  border: 2px solid var(--pastel-coral);
  border-radius: var(--radius-sm);
  color: #ffffff;
  text-shadow: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-logout:hover {
  background: linear-gradient(135deg, #ff8a80, #e57373);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(229, 115, 115, 0.4);
}

/* Main content */
.main-content {
  flex: 1;
  padding: 24px;
  max-width: 75%;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 900px) {
  .main-content {
    max-width: 100%;
    padding: 16px;
  }
}

.auth-layout {
  max-width: none !important;
  padding: 0 !important;
  margin: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

/* Genel yardımcı stiller - çizgi film tarzı */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #00897b, #4db6ac, #ff9800);
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
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow);
  border: 3px solid rgba(255, 255, 255, 0.8);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.card, .stat-card, [class*="-card"] {
  --text: #2f3640;
  --text-secondary: #353b48;
  color: var(--text);
  text-shadow: none;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, var(--pastel-pink), var(--pastel-lavender), var(--pastel-mint));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  border-color: rgba(77, 182, 172, 0.5);
}

.card-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 18px;
  color: var(--text);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
  border: 3px solid rgba(255, 255, 255, 0.8);
  text-align: center;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, var(--primary), var(--accent-teal));
  opacity: 0.9;
  border-radius: 20px 20px 0 0;
}

.stat-card:nth-child(1) { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
.stat-card:nth-child(1)::before { background: linear-gradient(90deg, var(--pastel-lavender), var(--pastel-lilac)); }
.stat-card:nth-child(2) { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
.stat-card:nth-child(2)::before { background: linear-gradient(90deg, var(--pastel-mint), var(--accent-teal)); }
.stat-card:nth-child(3) { border-radius: 70% 30% 50% 50% / 30% 70% 30% 70%; }
.stat-card:nth-child(3)::before { background: linear-gradient(90deg, var(--pastel-butter), var(--pastel-peach)); }
.stat-card:nth-child(4) { border-radius: 40% 60% 60% 40% / 70% 30% 70% 30%; }
.stat-card:nth-child(4)::before { background: linear-gradient(90deg, var(--pastel-pink), var(--pastel-coral)); }

.stat-card:hover {
  box-shadow: var(--shadow-lg);
}

.stat-value {
  font-family: 'Fredoka', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #2f3640;
  text-shadow: none;
}

/* Removed conflicting text gradients to let the cartoon stroke pop */

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 6px;
  font-weight: 600;
}

.btn {
  padding: 14px 28px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: 'Quicksand', sans-serif;
  border: 2px solid rgba(255,255,255,0.4);
}

.btn-primary {
  background: linear-gradient(135deg, #4db6ac, #ff9800);
  color: #ffffff;
  text-shadow: none;
  box-shadow: 0 6px 20px rgba(77, 182, 172, 0.4);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #00897b, #f57c00);
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(77, 182, 172, 0.5);
}

.btn-success {
  background: linear-gradient(135deg, #81c784, #a8e6cf);
  color: #ffffff;
  text-shadow: none;
  box-shadow: 0 6px 20px rgba(129, 199, 132, 0.4);
}

.btn-success:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(129, 199, 132, 0.5);
}

.btn-danger {
  background: linear-gradient(135deg, #e57373, #ff8a80);
  color: #ffffff;
  text-shadow: none;
  box-shadow: 0 6px 20px rgba(229, 115, 115, 0.4);
}

.btn-danger:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(229, 115, 115, 0.5);
}

.btn-warning {
  background: linear-gradient(135deg, #ffb74d, #ffd3b6);
  color: #5d4e37;
  text-shadow: none;
  box-shadow: 0 6px 20px rgba(255, 183, 77, 0.4);
}

.btn-outline {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
}

.btn-outline:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
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
  padding: 14px 18px;
  border: 3px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-family: inherit;
  transition: var(--transition);
  background: rgba(255, 255, 255, 0.95);
  color: #37474f;
  text-shadow: none;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--pastel-lilac);
  box-shadow: 0 0 0 4px rgba(77, 182, 172, 0.25);
}

.form-textarea {
  resize: vertical;
  min-height: 90px;
}

.table-container {
  overflow-x: auto;
  border-radius: var(--radius);
  overflow: hidden;
  border: 3px solid rgba(77, 182, 172, 0.3);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 2px solid rgba(77, 182, 172, 0.2);
}

th {
  font-weight: 700;
  font-size: 13px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(135deg, rgba(77, 182, 172, 0.15), rgba(255, 152, 0, 0.1));
}

td {
  font-size: 15px;
}

tr:hover {
  background: linear-gradient(90deg, rgba(77, 182, 172, 0.08), rgba(255, 152, 0, 0.06));
}

.status-badge {
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid rgba(255,255,255,0.5);
}

.status-pending {
  background: linear-gradient(135deg, var(--pastel-butter), var(--pastel-peach));
  color: #8b6914;
}
.status-approved {
  background: linear-gradient(135deg, var(--pastel-mint), var(--accent-teal));
  color: #2d6a4f;
}
.status-rejected {
  background: linear-gradient(135deg, var(--pastel-pink), var(--pastel-coral));
  color: #b71c1c;
}
.status-revision_requested {
  background: linear-gradient(135deg, var(--pastel-lavender), var(--pastel-lilac));
  color: #5e4a7a;
}

.alert {
  padding: 16px 20px;
  border-radius: var(--radius-sm);
  margin-bottom: 18px;
  font-size: 15px;
  font-weight: 600;
  border: 3px solid;
}

.alert-error {
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  color: #b71c1c;
  border-color: var(--pastel-coral);
}

.alert-success {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #2e7d32;
  border-color: var(--pastel-mint);
}

.progress-bar {
  width: 100%;
  height: 18px;
  background: rgba(77, 182, 172, 0.25);
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,0.6);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--pastel-lavender), var(--pastel-pink), var(--pastel-coral));
  border-radius: 20px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
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
