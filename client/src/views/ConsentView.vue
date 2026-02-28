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
  background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #14b8a6 100%);
  padding: 24px;
}

.consent-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
}

.consent-header {
  text-align: center;
  margin-bottom: 28px;
}

.consent-icon { font-size: 48px; display: block; margin-bottom: 12px; }
.consent-header h1 { font-size: 24px; font-weight: 800; color: #1e1b4b; }
.consent-header p { color: #6b7280; font-size: 14px; margin-top: 4px; }

.loading-state, .error-state {
  text-align: center;
  padding: 24px;
  color: #6b7280;
}

.error-state { color: #b91c1c; }

.success-state {
  text-align: center;
  padding: 24px;
}

.success-msg { font-size: 18px; font-weight: 700; color: #047857; margin-bottom: 12px; }

.consent-desc { margin-bottom: 20px; font-size: 15px; color: #4b5563; }
.student-info {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}
.student-info p { margin: 8px 0; font-size: 14px; }
.kvkk-note { font-size: 12px; color: #6b7280; margin-bottom: 20px; }
.btn-full { width: 100%; justify-content: center; padding: 14px; }
</style>
