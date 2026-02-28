<template>
  <div class="activity-form-page">
    <div class="page-header">
      <h1 class="page-title">Yeni Faaliyet Ekle</h1>
      <p class="page-subtitle">Gerçekleştirdiğiniz gönüllülük faaliyetini kayıt altına alın.</p>
    </div>

    <div v-if="success" class="alert alert-success">
      ✅ Faaliyet başarıyla eklendi! Öğretmen onayı bekleniyor.
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Etkinlik Tarihi *</label>
            <input v-model="form.date" type="date" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Harcanan Saat *</label>
            <input v-model.number="form.hours" type="number" class="form-input" min="0.5" step="0.5" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Etkinlik Türü *</label>
          <select v-model="form.type" class="form-select" required>
            <option value="">Seçiniz</option>
            <option value="seminer">📢 Seminer</option>
            <option value="stant">🏪 Stant</option>
            <option value="bagis">💝 Bağış</option>
            <option value="kermes">🎪 Kermes</option>
            <option value="bilinclenme">📣 Kamuoyu Bilinçlendirme</option>
            <option value="sosyal_medya">📱 Sosyal Medya Çalışması</option>
            <option value="farkindalik">🎗️ Farkındalık Etkinliği</option>
            <option value="diger">📌 Diğer</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Kısa Açıklama</label>
          <textarea v-model="form.description" class="form-textarea" placeholder="Faaliyetin kısa bir açıklamasını yazın..." rows="3"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">📷 Fotoğraf Yükle</label>
          <input type="file" @change="handlePhotoUpload" accept="image/*" multiple class="form-input" />
          <div v-if="uploadedPhotos.length" class="uploaded-files">
            <span v-for="(p, i) in uploadedPhotos" :key="i" class="file-tag">📷 {{ p.name }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">📄 Belge Yükle</label>
          <input type="file" @change="handleDocUpload" accept=".pdf,.doc,.docx" multiple class="form-input" />
          <div v-if="uploadedDocs.length" class="uploaded-files">
            <span v-for="(d, i) in uploadedDocs" :key="i" class="file-tag">📄 {{ d.name }}</span>
          </div>
        </div>

        <div class="form-actions">
          <router-link to="/student/activities" class="btn btn-outline">İptal</router-link>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Gönderiliyor...' : 'Faaliyeti Kaydet' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import api from '../../services/api'

export default {
  name: 'ActivityForm',
  setup() {
    const submitting = ref(false)
    const success = ref(false)
    const uploadedPhotos = ref([])
    const uploadedDocs = ref([])

    const form = reactive({
      date: new Date().toISOString().split('T')[0],
      type: '',
      hours: 1,
      description: '',
      photos: [],
      documents: []
    })

    const uploadFile = async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    }

    const handlePhotoUpload = async (event) => {
      const files = event.target.files
      for (const file of files) {
        try {
          const result = await uploadFile(file)
          form.photos.push(result.url)
          uploadedPhotos.value.push({ name: file.name, url: result.url })
        } catch (err) {
          console.error('Fotoğraf yükleme hatası:', err)
        }
      }
    }

    const handleDocUpload = async (event) => {
      const files = event.target.files
      for (const file of files) {
        try {
          const result = await uploadFile(file)
          form.documents.push(result.url)
          uploadedDocs.value.push({ name: file.name, url: result.url })
        } catch (err) {
          console.error('Belge yükleme hatası:', err)
        }
      }
    }

    const handleSubmit = async () => {
      submitting.value = true
      try {
        await api.post('/activities', form)
        success.value = true
        // Formu sıfırla
        form.date = new Date().toISOString().split('T')[0]
        form.type = ''
        form.hours = 1
        form.description = ''
        form.photos = []
        form.documents = []
        uploadedPhotos.value = []
        uploadedDocs.value = []
      } catch (err) {
        console.error('Faaliyet ekleme hatası:', err)
      } finally {
        submitting.value = false
      }
    }

    return { form, submitting, success, uploadedPhotos, uploadedDocs, handlePhotoUpload, handleDocUpload, handleSubmit }
  }
}
</script>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.uploaded-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.file-tag {
  padding: 4px 10px;
  background: var(--primary-light);
  border-radius: 20px;
  font-size: 12px;
  color: var(--primary);
}
</style>
