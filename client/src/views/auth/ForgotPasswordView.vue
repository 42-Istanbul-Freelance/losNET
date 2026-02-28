<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <span class="auth-icon">💙</span>
        <h1>Şifremi Unuttum</h1>
        <p>LÖSEV İnci Gönüllülük Takip Sistemi</p>
      </div>

      <div v-if="authStore.error" class="alert alert-error">
        {{ authStore.error }}
      </div>

      <div v-if="success" class="success-message">
        <p>Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.</p>
      </div>

      <div v-else-if="demoMode" class="demo-message">
        <p>Demo modda şifre sıfırlama kullanılamaz. Firebase Auth yapılandırıldığında bu özellik aktif olacaktır.</p>
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">E-posta</label>
          <input v-model="email" type="email" class="form-input" placeholder="ornek@email.com" required />
        </div>
        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          {{ loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder' }}
        </button>
      </form>

      <div class="auth-footer">
        <p><router-link to="/login">Giriş sayfasına dön</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'ForgotPasswordView',
  setup() {
    const authStore = useAuthStore()
    const email = ref('')
    const loading = ref(false)
    const success = ref(false)
    const demoMode = ref(false)

    const handleSubmit = async () => {
      loading.value = true
      authStore.error = null
      try {
        const result = await authStore.sendPasswordReset(email.value)
        if (result.demoMode) {
          demoMode.value = true
        } else {
          success.value = true
        }
      } catch (err) {
        console.error('Şifre sıfırlama hatası:', err)
      } finally {
        loading.value = false
      }
    }

    return { authStore, email, loading, success, demoMode, handleSubmit }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #14b8a6 100%);
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255,255,255,0.3);
  position: relative;
  z-index: 1;
}

.auth-header {
  text-align: center;
  margin-bottom: 36px;
}

.auth-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 8px rgba(124, 58, 237, 0.3));
}

.auth-header h1 {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-header p {
  color: #6b7280;
  font-size: 15px;
  margin-top: 8px;
  font-weight: 600;
}

.success-message,
.demo-message {
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 15px;
  color: #4b5563;
}

.success-message {
  background: #d1fae5;
  color: #065f46;
}

.demo-message {
  background: #fef3c7;
  color: #92400e;
}

.btn-full {
  width: 100%;
  justify-content: center;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  margin-top: 12px;
  background: linear-gradient(135deg, #7c3aed, #ec4899) !important;
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4) !important;
}

.btn-full:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(124, 58, 237, 0.5) !important;
}

.auth-footer {
  text-align: center;
  margin-top: 28px;
  font-size: 15px;
  color: #6b7280;
  font-weight: 600;
}

.auth-footer a {
  background: linear-gradient(135deg, #7c3aed, #ec4899);
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
