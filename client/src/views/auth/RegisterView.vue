<template>
  <div class="auth-container">
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>
    <div class="auth-card">
      <div class="auth-header">
        <span class="auth-icon">💙</span>
        <h1>Kayıt Ol</h1>
        <p>LÖSEV İnci Gönüllülük Takip Sistemi</p>
      </div>

      <div v-if="authStore.error" class="alert alert-error">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">Ad Soyad *</label>
          <input v-model="form.name" type="text" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">E-posta *</label>
          <input v-model="form.email" type="email" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Şifre *</label>
          <input v-model="form.password" type="password" class="form-input" placeholder="En az 6 karakter" required />
        </div>
        <div class="form-group">
          <label class="form-label">Rol *</label>
          <select v-model="form.role" class="form-select" required>
            <option value="student">Öğrenci</option>
            <option value="teacher">Koordinatör Öğretmen</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Telefon</label>
          <input v-model="form.phone" type="tel" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Okul Adı *</label>
          <input v-model="form.schoolName" type="text" class="form-input" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">İl *</label>
            <input v-model="form.city" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">İlçe</label>
            <input v-model="form.district" type="text" class="form-input" />
          </div>
        </div>

        <template v-if="form.role === 'student'">
          <div class="form-group">
            <label class="form-label">Sınıf</label>
            <input v-model="form.grade" type="text" class="form-input" placeholder="Örn: 10-A" />
          </div>
          <div class="form-group">
            <label class="form-label">Koordinatör Öğretmen Adı</label>
            <input v-model="form.coordinatorTeacher" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">T.C. Kimlik No (Opsiyonel)</label>
            <input v-model="form.tcKimlik" type="text" class="form-input" maxlength="11" placeholder="11 haneli" pattern="[0-9]*" inputmode="numeric" />
            <p class="form-hint">KVKK kapsamında güvenle saklanır. Sadece LÖSEV amacıyla kullanılır.</p>
          </div>
          <div class="form-group kvkk-group">
            <label class="checkbox-label">
              <input v-model="form.kvkkConsent" type="checkbox" />
              <span>Kişisel verilerimin LÖSEV tarafından işlenmesini ve gönüllülük takibi amacıyla kullanılmasını kabul ediyorum.</span>
            </label>
          </div>
        </template>

        <button type="submit" class="btn btn-primary btn-full" :disabled="loading || (form.role === 'student' && !form.kvkkConsent)">
          {{ loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Zaten hesabınız var mı? <router-link to="/login">Giriş Yap</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'RegisterView',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const loading = ref(false)

    const form = reactive({
      name: '',
      email: '',
      password: '',
      role: 'student',
      phone: '',
      schoolName: '',
      city: '',
      district: '',
      grade: '',
      coordinatorTeacher: '',
      tcKimlik: '',
      kvkkConsent: false
    })

    const handleRegister = async () => {
      loading.value = true
      try {
        // eslint-disable-next-line no-unused-vars
        const { password, email, kvkkConsent, ...userData } = form
        await authStore.register(email, password, userData)
        const dashboardMap = { student: '/student/dashboard', teacher: '/teacher/dashboard', admin: '/admin/dashboard' }
        router.push(dashboardMap[authStore.role] || '/student/dashboard')
      } catch (err) {
        console.error('Kayıt hatası:', err)
      } finally {
        loading.value = false
      }
    }

    return { authStore, form, loading, handleRegister }
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
  animation: floatShape 18s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #d4a5ff 0%, transparent 70%);
  top: 8%;
  right: 10%;
}

.shape-2 {
  width: 70px;
  height: 70px;
  background: radial-gradient(circle, #a8e6cf 0%, transparent 70%);
  bottom: 20%;
  left: 5%;
  animation-delay: -5s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, #ffd3b6 0%, transparent 70%);
  top: 40%;
  right: 3%;
  animation-delay: -10s;
}

.shape-4 {
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, #a8d8ff 0%, transparent 70%);
  bottom: 10%;
  right: 20%;
  animation-delay: -7s;
}

@keyframes floatShape {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(15px, -20px) scale(1.05); }
  66% { transform: translate(-10px, 15px) scale(0.98); }
}

.auth-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 32px;
  padding: 40px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 25px 60px rgba(179, 136, 255, 0.2), 0 0 0 3px rgba(255,255,255,0.8);
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  border: 3px solid rgba(212, 165, 255, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-icon {
  font-size: 52px;
  display: block;
  margin-bottom: 14px;
  filter: drop-shadow(0 6px 12px rgba(179, 136, 255, 0.4));
}

.auth-header h1 {
  font-family: 'Fredoka', sans-serif;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #b388ff, #ff8b94, #80cbc4);
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
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
  margin-top: 24px;
  font-size: 15px;
  color: #7d6b9a;
  font-weight: 600;
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

.form-hint {
  font-size: 12px;
  color: #7d6b9a;
  margin-top: 4px;
}

.kvkk-group {
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #5e4a7a;
  cursor: pointer;
}

.checkbox-label input {
  margin-top: 4px;
  flex-shrink: 0;
}
</style>
