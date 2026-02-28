<template>
  <div class="consent-container">
    <div class="consent-card">
      <div class="consent-header">
        <span class="consent-icon">💙</span>
        <h1>Veli Dijital Onay</h1>
        <p>LÖSEV İnci Gönüllülük Takip Sistemi</p>
      </div>

      <div v-if="loading" class="loading-state">Yükleniyor...</div>
      <div v-else-if="!info.valid" class="error-state">
        <p>{{ info.message || 'Link geçersiz veya süresi dolmuş.' }}</p>
      </div>
      <div v-else-if="approved" class="success-state">
        <p class="success-msg">✅ Veli onayı başarıyla kaydedildi.</p>
        <p>{{ info.studentName }} adlı öğrenci için onayınız alınmıştır.</p>
      </div>
      <div v-else class="consent-form">
        <p class="consent-desc">Aşağıdaki öğrenci için gönüllülük faaliyetlerine katılım izni veriyorum:</p>
        <div class="student-info">
          <p><strong>Ad Soyad:</strong> {{ info.studentName }}</p>
          <p><strong>Sınıf:</strong> {{ info.grade || '—' }}</p>
          <p><strong>Okul:</strong> {{ info.schoolName }}</p>
        </div>
        <p class="kvkk-note">Kişisel veriler LÖSEV tarafından KVKK kapsamında işlenecektir.</p>
        <button class="btn btn-primary btn-full" @click="handleApprove" :disabled="submitting">
          {{ submitting ? 'Kaydediliyor...' : 'Onaylıyorum' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

export default {
  name: 'ConsentView',
  setup() {
    const route = useRoute()
    const token = computed(() => route.params.token)
    const loading = ref(true)
    const info = ref({ valid: false, message: '' })
    const approved = ref(false)
    const submitting = ref(false)

    const api = axios.create({
      baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api'
    })

    onMounted(async () => {
      try {
        const res = await api.get(`/consent/info/${token.value}`)
        info.value = res.data
      } catch (err) {
        info.value = { valid: false, message: err.response?.data?.message || 'Link geçersiz veya süresi dolmuş.' }
      } finally {
        loading.value = false
      }
    })

    const handleApprove = async () => {
      submitting.value = true
      try {
        const res = await api.post(`/consent/approve/${token.value}`)
        approved.value = true
        info.value = { ...info.value, studentName: res.data.studentName }
      } catch (err) {
        info.value = { valid: false, message: err.response?.data?.message || 'Onay kaydedilemedi.' }
      } finally {
        submitting.value = false
      }
    }

    return { info, loading, approved, submitting, handleApprove }
  }
}
</script>

<style scoped>
.consent-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffe8f0 0%, #e8f4ff 25%, #f0e6ff 50%, #e8fff0 75%, #fff4e6 100%);
  padding: 24px;
}

.consent-card {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  border-radius: 32px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 60px rgba(77, 182, 172, 0.2), 0 0 0 3px rgba(255,255,255,0.8);
  border: 3px solid rgba(77, 182, 172, 0.3);
}

.consent-header {
  text-align: center;
  margin-bottom: 28px;
}

.consent-icon { font-size: 52px; display: block; margin-bottom: 12px; filter: drop-shadow(0 6px 12px rgba(77, 182, 172, 0.4)); }
.consent-header h1 { font-family: 'Fredoka', sans-serif; font-size: 26px; font-weight: 700; background: linear-gradient(135deg, #4db6ac, #ff9800); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.consent-header p { color: #7d6b9a; font-size: 15px; margin-top: 6px; }

.loading-state, .error-state {
  text-align: center;
  padding: 24px;
  color: #7d6b9a;
}

.error-state { color: #b71c1c; }

.success-state {
  text-align: center;
  padding: 24px;
}

.success-msg { font-size: 18px; font-weight: 700; color: #2e7d32; margin-bottom: 12px; }

.consent-desc { margin-bottom: 20px; font-size: 15px; color: #5e4a7a; }
.student-info {
  background: linear-gradient(135deg, rgba(77, 182, 172, 0.1), rgba(255, 152, 0, 0.08));
  border-radius: var(--radius-sm);
  padding: 16px;
  font-size: 14px;
  border: 2px solid rgba(77, 182, 172, 0.2);
}
.student-info p { margin: 8px 0; font-size: 14px; }
.kvkk-note { font-size: 12px; color: #7d6b9a; margin-bottom: 20px; }
.btn-full { width: 100%; justify-content: center; padding: 16px; }
</style>
