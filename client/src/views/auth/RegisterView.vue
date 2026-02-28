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

    <!-- Geniş Split Layout -->
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
            Herkesin dünyayı değiştirmek için yapabileceği bir şey vardır. LÖSEV İnci ile sende iyiliğin bir parçası olabilirsin.<br><br>
            Hesabını oluşturarak okullardaki LÖSEV projelerine dahil ol ve gönüllülük sertifikanı almaya başla.
          </p>
        </div>
        <!-- Dekoratif Görsel Arkaplan Öğeleri -->
        <div class="visual-bg-circle1"></div>
        <div class="visual-bg-circle2"></div>
      </div>

      <!-- Sağ Form Paneli -->
      <div class="auth-form-pane">
        <div class="auth-header-minimal">
          <h1>Hesap Oluştur</h1>
          <p>Hemen kayıt ol ve LÖSEV İnci sistemine katıl.</p>
        </div>

        <div v-if="authStore.error" class="alert alert-error">
          {{ authStore.error }}
        </div>

        <div class="form-wrapper-scroll">
          <form @submit.prevent="handleRegister" class="auth-form">
            
            <div class="form-group">
              <label class="form-label">Rol *</label>
              <select v-model="form.role" class="form-select" required>
                <option value="student">Öğrenci</option>
                <option value="teacher">Koordinatör Öğretmen</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Ad Soyad *</label>
                <input v-model="form.name" type="text" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">E-posta *</label>
                <input v-model="form.email" type="email" class="form-input" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Şifre *</label>
                <input v-model="form.password" type="password" class="form-input" placeholder="En az 6 karakter" required />
              </div>
              <div class="form-group">
                <label class="form-label">Telefon</label>
                <input v-model="form.phone" type="tel" class="form-input" />
              </div>
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
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Sınıf</label>
                  <input v-model="form.grade" type="text" class="form-input" placeholder="Örn: 10-A" />
                </div>
                <div class="form-group">
                  <label class="form-label">Koordinatör Öğretmen</label>
                  <input v-model="form.coordinatorTeacher" type="text" class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">T.C. Kimlik No (Opsiyonel)</label>
                <input v-model="form.tcKimlik" type="text" class="form-input" maxlength="11" placeholder="11 haneli" pattern="[0-9]*" inputmode="numeric" />
                <p class="form-hint">KVKK kapsamında şifrelenir. Sadece sertifika amacıyla kullanılır.</p>
              </div>
              <div class="form-group kvkk-group">
                <label class="checkbox-label">
                  <input v-model="form.kvkkConsent" type="checkbox" />
                  <span>Kişisel verilerimin LÖSEV tarafından işlenmesini ve gönüllülük takibi amacıyla kullanılmasını kabul ediyorum.</span>
                </label>
              </div>
            </template>

            <button type="submit" class="btn btn-primary btn-full pulse-btn" :disabled="loading || (form.role === 'student' && !form.kvkkConsent)">
              {{ loading ? 'Kayıt oluşturuluyor...' : 'Hemen Kaydol' }}
            </button>
          </form>
        </div>

        <div class="auth-footer">
          <p>Zaten hesabınız var mı? <router-link to="/login" class="link-hover">Giriş Yap</router-link></p>
        </div>

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
  max-width: 1200px;
  height: 85vh; /* Form yüksekliği için fixed limit ve iç scroll sağlayacak */
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
  flex: 1.2;
  padding: 50px 60px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  height: 100%;
}

.auth-header-minimal {
  margin-bottom: 30px;
  text-align: left;
  flex-shrink: 0;
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

/* İç Scroll Yapısı */
.form-wrapper-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 16px;
  margin-right: -16px;
}

/* Scrollbar şekillendirme */
.form-wrapper-scroll::-webkit-scrollbar { width: 6px; }
.form-wrapper-scroll::-webkit-scrollbar-track { background: transparent; }
.form-wrapper-scroll::-webkit-scrollbar-thumb { background: rgba(77, 182, 172, 0.3); border-radius: 10px; }
.form-wrapper-scroll::-webkit-scrollbar-thumb:hover { background: rgba(77, 182, 172, 0.6); }

.auth-form {
  padding-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2f3640;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input, .form-select {
  width: 100%;
  padding: 14px 18px;
  border-radius: 16px;
  border: 2px solid #e0e0e0;
  background: #f9f9f9;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #4db6ac;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(77, 182, 172, 0.15);
}

.form-hint {
  font-size: 12px;
  color: #7d6b9a;
  margin-top: 6px;
}

.kvkk-group {
  margin-top: 10px;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 12px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
  color: #546e7a;
  cursor: pointer;
  line-height: 1.5;
}

.checkbox-label input {
  margin-top: 2px;
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
  margin-top: 12px;
  flex-shrink: 0;
}

.auth-footer p {
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

/* Mobil / Tablet Uyumluluk */
@media (max-width: 900px) {
  .auth-card-wide {
    flex-direction: column;
    max-width: 500px;
    height: auto;
    border-radius: 32px;
    overflow-y: auto;
  }
  .auth-visual-pane {
    padding: 30px;
    text-align: center;
    flex: none;
  }
  .visual-content h2 {
    font-size: 28px;
  }
  .auth-form-pane {
    padding: 30px;
    height: auto;
  }
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 600px) {
  .auth-container {
    padding: 16px;
  }
  .auth-form-pane {
    padding: 24px;
  }
  .auth-header-minimal h1 {
    font-size: 28px;
  }
}
</style>
