<template>
  <div class="auth-container">

    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
      <div class="shape shape-6"></div>
    </div>

    <!-- Yeni Geniş Split Layout -->
    <div class="auth-card-wide">
      
      <!-- Sol Görsel Panel -->
      <div class="auth-visual-pane">
        <router-link to="/" class="btn-home-inside" title="Ana Sayfaya Dön">
          <span>⬅</span> Ana Sayfa
        </router-link>

        <div class="visual-content">
          <span class="auth-icon-large">💙</span>
          <h2>İyilik Hareketine Hoş Geldin!</h2>
          <p>
            Ortak bir vizyon etrafında birleşerek umut damlalarını okyanusa dönüştürüyoruz.
            LÖSEV İnci Gönüllülük Takip Sistemi üzerinden kendi paneline gir, faaliyetlerini yönet ve rozetleri topla!
          </p>
        </div>
        <!-- Dekoratif Görsel Arkaplan Öğeleri -->
        <div class="visual-bg-circle1"></div>
        <div class="visual-bg-circle2"></div>
      </div>

      <!-- Sağ Form Paneli -->
      <div class="auth-form-pane">
        <div class="auth-header-minimal">
          <h1>Giriş Yap</h1>
          <p>Hesabına giriş yaparak iyilik yolculuğuna devam et.</p>
        </div>

        <div v-if="authStore.error" class="alert alert-error">
          {{ authStore.error }}
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="form-label">E-posta</label>
            <input v-model="email" type="email" class="form-input" placeholder="ornek@email.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Şifre</label>
            <input v-model="password" type="password" class="form-input" placeholder="••••••••" required />
          </div>
          
          <button type="submit" class="btn btn-primary btn-full pulse-btn" :disabled="loading">
            {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
          </button>
        </form>

        <div class="auth-footer">
          <p><router-link to="/forgot-password" class="link-hover">Şifremi unuttum</router-link></p>
          <p>Hesabınız yok mu? <router-link to="/register" class="link-hover">Kayıt Ol</router-link></p>
        </div>

        <div class="demo-accounts">
          <p class="demo-title">Test Hesapları (Tek Tıkla Giriş)</p>
          <div class="demo-buttons row-demo">
            <button type="button" class="btn-demo btn-student" @click="autoLogin('student')" :disabled="loading" title="Öğrenci Girişi">
              <span>🎓</span> Öğrenci
            </button>
            <button type="button" class="btn-demo btn-teacher" @click="autoLogin('teacher')" :disabled="loading" title="Öğretmen Girişi">
              <span>👩‍🏫</span> Öğretmen
            </button>
            <button type="button" class="btn-demo btn-admin" @click="autoLogin('admin')" :disabled="loading" title="Admin Girişi">
              <span>🏢</span> Yönetici
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'LoginView',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      loading.value = true
      try {
        await authStore.login(email.value, password.value)
        const dashboardMap = { student: '/student/dashboard', teacher: '/teacher/dashboard', admin: '/admin/dashboard' }
        router.push(dashboardMap[authStore.role] || '/student/dashboard')
      } catch (err) {
        console.error('Giriş hatası:', err)
      } finally {
        loading.value = false
      }
    }

    const autoLogin = async (role) => {
      email.value = `${role}@demo.local`
      password.value = 'demo123'
      await handleLogin()
    }

    return { authStore, email, password, loading, handleLogin, autoLogin }
  }
}
</script>

<style scoped>
/* Container: Tam Ekran */
.auth-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffe8f0 0%, #e8f4ff 25%, #f0e6ff 50%, #e8fff0 75%, #fff4e6 100%);
  background-size: 400% 400%;
  animation: gradientShift 12s ease infinite;
  padding: 40px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* Ana Sayfaya Dön Butonu (İçeride) */
.btn-home-inside {
  position: absolute;
  top: 30px;
  left: 30px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  z-index: 10;
}

.btn-home-inside:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  25% { background-position: 50% 100%; }
  50% { background-position: 100% 50%; }
  75% { background-position: 50% 0%; }
}

/* Yüzen Şekiller */
.floating-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  animation: floatShape 15s ease-in-out infinite;
}

.shape-1 { width: 300px; height: 300px; background: radial-gradient(circle, #81d4fa 0%, transparent 70%); top: -10%; left: -5%; }
.shape-2 { width: 250px; height: 250px; background: radial-gradient(circle, #ffaaa5 0%, transparent 70%); bottom: -5%; right: 10%; animation-delay: -3s; }
.shape-3 { width: 120px; height: 120px; background: radial-gradient(circle, #a8e6cf 0%, transparent 70%); top: 40%; left: 15%; animation-delay: -5s; }
.shape-4 { width: 150px; height: 150px; background: radial-gradient(circle, #fff9c4 0%, transparent 70%); top: 10%; right: 25%; animation-delay: -7s; }
.shape-5 { width: 200px; height: 200px; background: radial-gradient(circle, #b3e5fc 0%, transparent 70%); bottom: 20%; left: 30%; opacity: 0.3; animation-delay: -2s; }

@keyframes floatShape {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  25% { transform: translate(30px, -40px) scale(1.1) rotate(10deg); }
  50% { transform: translate(-20px, 30px) scale(0.95) rotate(-5deg); }
  75% { transform: translate(40px, 20px) scale(1.05) rotate(5deg); }
}

/* Wide Auth Card (Split Panes) */
.auth-card-wide {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 40px;
  width: 100%;
  max-width: 1100px;
  min-height: 600px;
  box-shadow: 0 40px 80px rgba(77, 182, 172, 0.2), 0 0 0 3px rgba(255,255,255,0.8);
  border: 4px solid rgba(77, 182, 172, 0.3);
  display: flex;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* Sol Panel (Görsel ve Marka) */
.auth-visual-pane {
  flex: 1;
  background: linear-gradient(135deg, #00897b, #4db6ac);
  color: white;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.visual-content {
  position: relative;
  z-index: 2;
  text-align: left;
}

.auth-icon-large {
  font-size: 80px;
  display: block;
  margin-bottom: 24px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
  animation: pulseIcon 3s ease-in-out infinite;
}

@keyframes pulseIcon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.visual-content h2 {
  font-family: 'Fredoka', sans-serif;
  font-size: 42px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 20px;
  color: #fff;
}

.visual-content p {
  font-size: 17px;
  line-height: 1.6;
  opacity: 0.9;
}

/* Sol panel dekorasyonu */
.visual-bg-circle1 {
  position: absolute;
  width: 400px;
  height: 400px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  top: -100px;
  right: -100px;
}
.visual-bg-circle2 {
  position: absolute;
  width: 250px;
  height: 250px;
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
  bottom: -50px;
  left: -50px;
}

/* Sağ Panel (Form) */
.auth-form-pane {
  flex: 1;
  padding: 60px 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
}

.auth-header-minimal {
  margin-bottom: 40px;
  text-align: left;
}

.auth-header-minimal h1 {
  font-family: 'Fredoka', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #2f3640;
  margin-bottom: 8px;
}

.auth-header-minimal p {
  color: #546e7a;
  font-size: 16px;
}

.auth-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2f3640;
  margin-bottom: 8px;
  font-size: 15px;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  border-radius: 16px;
  border: 2px solid #e0e0e0;
  background: #f9f9f9;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4db6ac;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(77, 182, 172, 0.15);
}

.btn-full {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 18px;
  font-size: 18px;
  font-weight: 700;
  margin-top: 16px;
  border-radius: 20px;
  background: linear-gradient(135deg, #4db6ac, #ff9800);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(77, 182, 172, 0.4);
  transition: all 0.3s ease;
}

.btn-full:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(77, 182, 172, 0.5);
}

.pulse-btn:disabled {
  background: #b0bec5;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Footer & Links */
.auth-footer {
  text-align: left;
  border-top: 2px solid #f0f0f0;
  padding-top: 24px;
}

.auth-footer p {
  margin-bottom: 8px;
  color: #546e7a;
  font-size: 15px;
  font-weight: 500;
}

.link-hover {
  color: #00897b;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.3s;
}

.link-hover:hover {
  color: #ff9800;
  text-decoration: underline;
}

/* Demo Paneli Yanyana (Minimal) */
.demo-accounts {
  margin-top: 24px;
  padding-top: 24px;
  animation: fadeIn 1s ease 0.5s both;
}

.demo-title {
  font-size: 13px;
  color: #7d6b9a;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.row-demo {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
}

.btn-demo {
  flex: 1;
  padding: 12px 8px;
  font-size: 14px;
  border-radius: 12px;
  border: 2px solid transparent;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.btn-demo span {
  font-size: 18px;
}

.btn-student {
  background: #e8f4ff; border-color: #bbdefb; color: #1565c0;
}
.btn-student:hover { background: #bbdefb; transform: translateY(-2px); }

.btn-teacher {
  background: #fff3e0; border-color: #ffe0b2; color: #e65100;
}
.btn-teacher:hover { background: #ffe0b2; transform: translateY(-2px); }

.btn-admin {
  background: #e8f5e9; border-color: #c8e6c9; color: #2e7d32;
}
.btn-admin:hover { background: #c8e6c9; transform: translateY(-2px); }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Mobil / Tablet Uyumluluk */
@media (max-width: 900px) {
  .auth-card-wide {
    flex-direction: column;
    max-width: 500px;
    border-radius: 32px;
  }
  .auth-visual-pane {
    padding: 40px;
    text-align: center;
  }
  .visual-content h2 {
    font-size: 32px;
  }
  .auth-form-pane {
    padding: 40px;
  }
  .row-demo {
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .auth-container {
    padding: 16px;
  }
  .auth-form-pane {
    padding: 32px 24px;
  }
  .auth-header-minimal h1 {
    font-size: 28px;
  }
}
</style>
