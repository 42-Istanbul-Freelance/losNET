<template>
  <div class="activity-form-page">
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Oluştur' }}</h1>
      <p class="page-subtitle">{{ isEdit ? 'Etkinlik bilgilerini güncelle' : 'Sistem genelinde yapılacak bir etkinlik oluşturun ve öğrencileri davet edin.' }}</p>
    </div>

    <div v-if="success" class="alert alert-success">
      ✅ {{ isEdit ? 'Etkinlik güncellendi!' : 'Etkinlik başarıyla oluşturuldu!' }}
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Etkinlik Tarihi *</label>
            <input v-model="form.date" type="date" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Tahmini Saat *</label>
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
          <label class="form-label">Etkinlik Açıklaması *</label>
          <textarea v-model="form.description" class="form-textarea" placeholder="Etkinliğin amacı ve detaylarını açıklayın..." rows="3" required></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Mekan / Kurum</label>
            <input v-model="form.location" type="text" class="form-input" placeholder="Örn: Merkez, Online, Şubeler" />
          </div>
          <div class="form-group">
            <label class="form-label">Tahmini Katılımcı Sayısı</label>
            <input v-model.number="form.participantCount" type="number" class="form-input" min="1" />
          </div>
        </div>

        <!-- Öğrenci Seçimi -->
        <div class="form-group">
          <label class="form-label">Öğrencileri Davet Et (İsteğe Bağlı)</label>
          <div class="student-selector">
            <input
              v-model="studentSearch"
              type="text"
              class="form-input"
              placeholder="Öğrenci adı, e-posta veya okul adı ile ara..."
            />
            <div v-if="studentSearch && filteredStudents.length > 0" class="student-list">
              <div
                v-for="student in filteredStudents"
                :key="student._id"
                class="student-item"
                @click="toggleStudent(student._id)"
              >
                <input
                  type="checkbox"
                  :checked="form.participantStudents.includes(student._id)"
                  :id="`student-${student._id}`"
                />
                <label :for="`student-${student._id}`" class="student-label">
                  <span class="student-name">{{ student.name }}</span>
                  <span class="student-email">{{ student.email }}</span>
                  <span class="student-school" v-if="student.school?.name">({{ student.school.name }})</span>
                </label>
              </div>
            </div>
            <div v-else-if="studentSearch && filteredStudents.length === 0" class="no-results">
              Sonuç bulunamadı
            </div>
          </div>
          <div v-if="selectedStudentsInfo.length > 0" class="selected-students">
            <span v-for="student in selectedStudentsInfo" :key="student._id" class="student-tag">
              {{ student.name }}
              <button
                type="button"
                @click="removeStudent(student._id)"
                class="remove-btn"
              >
                ✕
              </button>
            </span>
          </div>
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
          <router-link to="/admin/dashboard" class="btn btn-outline">İptal</router-link>
          <button type="submit" class="btn btn-primary" :disabled="submitting || !form.type">
            {{ submitting ? 'Kaydediliyor...' : (isEdit ? 'Etkinliği Güncelle' : 'Etkinliği Oluştur') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'

export default {
  name: 'AdminActivityForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const submitting = ref(false)
    const success = ref(false)
    const uploadedPhotos = ref([])
    const uploadedDocs = ref([])
    const studentSearch = ref('')
    const availableStudents = ref([])

    const activityId = computed(() => route.params.id)
    const isEdit = computed(() => !!activityId.value)

    const form = reactive({
      date: new Date().toISOString().split('T')[0],
      type: '',
      hours: 2,
      description: '',
      location: '',
      participantCount: null,
      photos: [],
      documents: [],
      participantStudents: []
    })

    const filteredStudents = computed(() => {
      if (!studentSearch.value) return []
      const search = studentSearch.value.toLowerCase()
      return availableStudents.value.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.school?.name?.toLowerCase().includes(search)
      ).filter(s => !form.participantStudents.includes(s._id))
    })

    const selectedStudentsInfo = computed(() => {
      return availableStudents.value.filter(s => form.participantStudents.includes(s._id))
    })

    onMounted(async () => {
      // Load all students for admin
      try {
        const res = await api.get('/activities')
        const students = new Map()
        res.data.activities?.forEach(a => {
          if (a.student) {
            students.set(a.student._id, a.student)
          }
          a.participantStudents?.forEach(p => {
            if (p.student) {
              students.set(p.student._id, p.student)
            }
          })
        })
        availableStudents.value = Array.from(students.values())
          .sort((a, b) => a.name.localeCompare(b.name))
      } catch (err) {
        console.error('Öğrenci listesi yükleme hatası:', err)
      }

      // Load existing activity if editing
      if (isEdit.value) {
        try {
          const res = await api.get(`/activities/${activityId.value}`)
          const activity = res.data
          form.date = new Date(activity.date).toISOString().split('T')[0]
          form.type = activity.type
          form.hours = activity.hours
          form.description = activity.description || ''
          form.location = activity.location || ''
          form.participantCount = activity.participantCount || null
          form.photos = activity.photos || []
          form.documents = activity.documents || []
          form.participantStudents = activity.participantStudents?.map(p => p.student?._id || p.student) || []

          if (activity.photos?.length) {
            uploadedPhotos.value = activity.photos.map((url, i) => ({ name: `Fotoğraf ${i + 1}`, url }))
          }
          if (activity.documents?.length) {
            uploadedDocs.value = activity.documents.map((url, i) => ({ name: `Belge ${i + 1}`, url }))
          }
        } catch (err) {
          console.error('Etkinlik yükleme hatası:', err)
        }
      }
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

    const toggleStudent = (studentId) => {
      const index = form.participantStudents.indexOf(studentId)
      if (index > -1) {
        form.participantStudents.splice(index, 1)
      } else {
        form.participantStudents.push(studentId)
      }
    }

    const removeStudent = (studentId) => {
      const index = form.participantStudents.indexOf(studentId)
      if (index > -1) {
        form.participantStudents.splice(index, 1)
      }
    }

    const handleSubmit = async () => {
      submitting.value = true
      try {
        if (isEdit.value) {
          await api.put(`/activities/${activityId.value}`, form)
        } else {
          await api.post('/activities', form)
        }
        success.value = true

        // Reset form if new
        if (!isEdit.value) {
          form.date = new Date().toISOString().split('T')[0]
          form.type = ''
          form.hours = 2
          form.description = ''
          form.location = ''
          form.participantCount = null
          form.photos = []
          form.documents = []
          form.participantStudents = []
          uploadedPhotos.value = []
          uploadedDocs.value = []
        }

        // Redirect after 2s
        setTimeout(() => { router.push('/admin/dashboard') }, 2000)
      } catch (err) {
        console.error('Etkinlik kaydetme hatası:', err)
      } finally {
        submitting.value = false
      }
    }

    return {
      form,
      submitting,
      success,
      uploadedPhotos,
      uploadedDocs,
      isEdit,
      studentSearch,
      filteredStudents,
      selectedStudentsInfo,
      handlePhotoUpload,
      handleDocUpload,
      handleSubmit,
      toggleStudent,
      removeStudent
    }
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

.student-selector {
  position: relative;
}

.student-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.student-item {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.student-item:hover {
  background-color: #f5f5f5;
}

.student-item input[type="checkbox"] {
  cursor: pointer;
}

.student-label {
  cursor: pointer;
  flex: 1;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.student-name {
  font-weight: 500;
}

.student-email {
  font-size: 0.85rem;
  color: #666;
}

.student-school {
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
}

.selected-students {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.student-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #1976d2;
}

.remove-btn {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
}

.remove-btn:hover {
  color: #d32f2f;
}

.no-results {
  padding: 12px;
  text-align: center;
  color: #999;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
