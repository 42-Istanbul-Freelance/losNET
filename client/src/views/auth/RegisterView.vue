<template>
  <div class="auth-container">
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
  padding: 40px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255,255,255,0.3);
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-icon {
  font-size: 52px;
  display: block;
  margin-bottom: 14px;
  filter: drop-shadow(0 4px 8px rgba(124, 58, 237, 0.3));
}

.auth-header h1 {
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-header p {
  color: #6b7280;
  font-size: 14px;
  margin-top: 6px;
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
  margin-top: 24px;
  font-size: 14px;
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

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.kvkk-group {
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
}

.checkbox-label input {
  margin-top: 4px;
  flex-shrink: 0;
}
</style>
