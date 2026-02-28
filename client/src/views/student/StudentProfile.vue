<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Profilim</h1>
      <p class="page-subtitle">Kişisel bilgilerinizi güncelleyebilirsiniz.</p>
    </div>

    <div v-if="saved" class="alert alert-success">✅ Profil başarıyla güncellendi.</div>

    <div class="card">
      <form @submit.prevent="handleSave">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Ad Soyad</label>
            <input v-model="form.name" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">E-posta</label>
            <input :value="authStore.user?.email" type="email" class="form-input" disabled />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Telefon</label>
            <input v-model="form.phone" type="tel" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Sınıf</label>
            <input v-model="form.grade" type="text" class="form-input" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">İl</label>
            <input v-model="form.city" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">İlçe</label>
            <input v-model="form.district" type="text" class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Koordinatör Öğretmen</label>
          <input v-model="form.coordinatorTeacher" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">T.C. Kimlik No (Opsiyonel, KVKK uyumlu)</label>
          <input v-model="form.tcKimlik" type="text" class="form-input" maxlength="11" placeholder="11 haneli" pattern="[0-9]*" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label class="form-label">Profil Fotoğrafı</label>
          <div class="photo-upload">
            <div v-if="form.profilePhoto" class="photo-preview">
              <img :src="form.profilePhoto" alt="Profil" />
              <button type="button" class="btn btn-outline btn-sm" @click="removePhoto">Kaldır</button>
            </div>
            <div v-else class="photo-placeholder">
              <input ref="photoInput" type="file" accept="image/*" @change="handlePhotoSelect" style="display:none" />
              <button type="button" class="btn btn-outline" @click="triggerPhotoInput">📷 Fotoğraf Yükle</button>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card" style="margin-top: 24px;">
      <div class="card-title">👨‍👩‍👧 Veli Dijital Onay</div>
      <p v-if="authStore.user?.parentConsent" class="consent-status approved">✅ Veli onayı alındı ({{ formatConsentDate(authStore.user.parentConsentAt) }})</p>
      <template v-else>
        <p class="consent-desc">18 yaş altı öğrenciler için veli onayı gereklidir. Aşağıdaki butonla oluşturduğunuz linki velinize iletin.</p>
        <button class="btn btn-outline" @click="createConsentLink" :disabled="consentLoading">
          {{ consentLoading ? 'Oluşturuluyor...' : 'Veli Onay Linki Oluştur' }}
        </button>
        <div v-if="consentUrl" class="consent-url-box">
          <p>Linki kopyalayıp velinize iletin:</p>
          <input :value="consentUrl" readonly class="url-input" />
          <button class="btn btn-primary btn-sm" @click="copyConsentUrl">Kopyala</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

export default {
  name: 'StudentProfile',
  setup() {
    const authStore = useAuthStore()
    const saving = ref(false)
    const saved = ref(false)
    const consentLoading = ref(false)
    const consentUrl = ref('')
    const form = reactive({ name: '', phone: '', grade: '', city: '', district: '', coordinatorTeacher: '', tcKimlik: '', profilePhoto: '' })

    onMounted(() => {
      if (authStore.user) {
        form.name = authStore.user.name || ''
        form.phone = authStore.user.phone || ''
        form.grade = authStore.user.grade || ''
        form.city = authStore.user.city || ''
        form.district = authStore.user.district || ''
        form.coordinatorTeacher = authStore.user.coordinatorTeacher || ''
        form.tcKimlik = authStore.user.tcKimlik || ''
        form.profilePhoto = authStore.user.profilePhoto || ''
      }
    })

    const handleSave = async () => {
      saving.value = true
      try {
        await authStore.updateProfile(form)
        saved.value = true
        setTimeout(() => { saved.value = false }, 3000)
      } catch (err) { console.error(err) }
      finally { saving.value = false }
    }

    const createConsentLink = async () => {
      consentLoading.value = true
      consentUrl.value = ''
      try {
        const res = await api.get('/consent/create')
        consentUrl.value = res.data.consentUrl
      } catch (err) { console.error(err) }
      finally { consentLoading.value = false }
    }

    const copyConsentUrl = () => {
      navigator.clipboard.writeText(consentUrl.value)
    }

    const formatConsentDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR') : ''

    const photoInput = ref(null)
    const handlePhotoSelect = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        form.profilePhoto = res.data.url
      } catch (err) { console.error(err) }
      e.target.value = ''
    }
    const removePhoto = () => { form.profilePhoto = '' }
    const triggerPhotoInput = () => { photoInput.value?.click() }

    return { authStore, form, saving, saved, handleSave, createConsentLink, copyConsentUrl, consentLoading, consentUrl, formatConsentDate, photoInput, handlePhotoSelect, removePhoto, triggerPhotoInput }
  }
}
</script>

<style scoped>
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
.consent-status.approved { color: var(--success); font-weight: 600; }
.consent-desc { margin-bottom: 12px; color: var(--text-secondary); font-size: 14px; }
.consent-url-box { margin-top: 16px; padding: 12px; background: #f9fafb; border-radius: 8px; }
.consent-url-box p { font-size: 13px; margin-bottom: 8px; }
.url-input { width: 100%; padding: 8px; font-size: 12px; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 8px; }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.photo-upload { margin-top: 8px; }
.photo-preview { display: flex; align-items: center; gap: 12px; }
.photo-preview img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border); }
.photo-placeholder { margin-top: 4px; }
</style>
