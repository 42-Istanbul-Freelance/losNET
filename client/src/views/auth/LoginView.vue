<template>
  <div class="auth-container">
    <!-- Dekoratif çizgi film şekilleri -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
      <div class="shape shape-6"></div>
    </div>
    <div class="auth-card">
      <div class="auth-header">
        <span class="auth-icon">💙</span>
        <h1>LÖSEV İnci</h1>
        <p>Gönüllülük Takip Sistemi</p>
      </div>

      <div v-if="authStore.error" class="alert alert-error">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">E-posta</label>
          <input v-model="email" type="email" class="form-input" placeholder="ornek@email.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Şifre</label>
          <input v-model="password" type="password" class="form-input" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
        </button>
      </form>

      <div class="auth-footer">
        <p><router-link to="/forgot-password">Şifremi unuttum</router-link></p>
        <p>Hesabınız yok mu? <router-link to="/register">Kayıt Ol</router-link></p>
        <p><router-link to="/about">Hakkında</router-link></p>
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

    return { authStore, email, password, loading, handleLogin }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffe8f0 0%, #e8f4ff 25%, #f0e6ff 50%, #e8fff0 75%, #fff4e6 100%);
  background-size: 400% 400%;
  animation: gradientShift 12s ease infinite;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  25% { background-position: 50% 100%; }
  50% { background-position: 100% 50%; }
  75% { background-position: 50% 0%; }
}

/* Çizgi film tarzı yüzen şekiller */
.floating-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.7;
  animation: floatShape 15s ease-in-out infinite;
}

.shape-1 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #d4a5ff 0%, transparent 70%);
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.shape-2 {
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, #ffaaa5 0%, transparent 70%);
  top: 20%;
  right: 15%;
  animation-delay: -3s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #a8e6cf 0%, transparent 70%);
  bottom: 25%;
  left: 10%;
  animation-delay: -6s;
}

.shape-4 {
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, #a8d8ff 0%, transparent 70%);
  bottom: 15%;
  right: 20%;
  animation-delay: -2s;
}

.shape-5 {
  width: 90px;
  height: 90px;
  background: radial-gradient(circle, #fff9c4 0%, transparent 70%);
  top: 50%;
  left: 3%;
  animation-delay: -9s;
}

.shape-6 {
  width: 70px;
  height: 70px;
  background: radial-gradient(circle, #ffd3b6 0%, transparent 70%);
  top: 60%;
  right: 5%;
  animation-delay: -5s;
}

@keyframes floatShape {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  25% { transform: translate(20px, -30px) scale(1.1) rotate(5deg); }
  50% { transform: translate(-15px, 20px) scale(0.95) rotate(-3deg); }
  75% { transform: translate(25px, 15px) scale(1.05) rotate(2deg); }
}

.auth-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 32px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 60px rgba(179, 136, 255, 0.2), 0 0 0 3px rgba(255,255,255,0.8);
  position: relative;
  z-index: 1;
  border: 3px solid rgba(212, 165, 255, 0.3);
  border-radius: 60% 40% 50% 50% / 40% 60% 40% 60%;
}

.auth-header {
  text-align: center;
  margin-bottom: 36px;
}

.auth-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  filter: drop-shadow(0 6px 12px rgba(179, 136, 255, 0.4));
  animation: iconBounce 2s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.auth-header h1 {
  font-family: 'Fredoka', sans-serif;
  font-size: 30px;
  font-weight: 700;
  background: linear-gradient(135deg, #b388ff, #ff8b94, #80cbc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-header p {
  color: #7d6b9a;
  font-size: 16px;
  margin-top: 10px;
  font-weight: 600;
}

.btn-full {
  width: 100%;
  justify-content: center;
  padding: 16px;
  font-size: 17px;
  font-weight: 700;
  margin-top: 12px;
  background: linear-gradient(135deg, #b388ff, #ff8b94) !important;
  box-shadow: 0 8px 24px rgba(179, 136, 255, 0.4) !important;
  border-radius: 20px !important;
}

.btn-full:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(179, 136, 255, 0.5) !important;
}

.auth-footer {
  text-align: center;
  margin-top: 28px;
  font-size: 15px;
  color: #7d6b9a;
  font-weight: 600;
}

.auth-footer p + p {
  margin-top: 10px;
}

.auth-footer a {
  background: linear-gradient(135deg, #b388ff, #ff8b94);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  font-weight: 700;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
