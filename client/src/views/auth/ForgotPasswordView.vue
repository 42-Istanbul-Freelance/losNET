<template>
  <div class="auth-container">
    <div class="auth-card">
      <router-link to="/" class="btn-home-inside" title="Ana Sayfaya Dön">
        <span>⬅</span> Ana Sayfa
      </router-link>
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

.auth-card {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 32px;
  padding: 64px 48px 48px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 60px rgba(77, 182, 172, 0.2), 0 0 0 3px rgba(255,255,255,0.8);
  position: relative;
  z-index: 1;
  border: 3px solid rgba(77, 182, 172, 0.3);
}

/* İçerideki Ana Sayfa Butonu */
.btn-home-inside {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 137, 123, 0.05);
  color: #00897b;
  padding: 8px 14px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  z-index: 10;
  border: 1px solid rgba(0, 137, 123, 0.1);
}

.btn-home-inside:hover {
  background: rgba(0, 137, 123, 0.1);
  transform: translateY(-2px);
}

.auth-header {
  text-align: center;
  margin-bottom: 36px;
}

.auth-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 16px;
  filter: drop-shadow(0 6px 12px rgba(77, 182, 172, 0.4));
}

.auth-header h1 {
  font-family: 'Fredoka', sans-serif;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #00897b, #ff9800, #4db6ac);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-header p {
  color: #7d6b9a;
  font-size: 15px;
  margin-top: 8px;
  font-weight: 600;
}

.success-message,
.demo-message {
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  font-size: 15px;
}

.success-message {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #2e7d32;
}

.demo-message {
  background: linear-gradient(135deg, #fff9c4, #ffd3b6);
  color: #8b6914;
}

.btn-full {
  width: 100%;
  justify-content: center;
  padding: 16px;
  font-size: 17px;
  font-weight: 700;
  margin-top: 12px;
  background: linear-gradient(135deg, #4db6ac, #ff9800) !important;
  box-shadow: 0 8px 24px rgba(77, 182, 172, 0.4) !important;
}

.btn-full:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(77, 182, 172, 0.5) !important;
}

.auth-footer {
  text-align: center;
  margin-top: 28px;
  font-size: 15px;
  color: #7d6b9a;
  font-weight: 600;
}

.auth-footer a {
  background: linear-gradient(135deg, #4db6ac, #ff9800);
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
