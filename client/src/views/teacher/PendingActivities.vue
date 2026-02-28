<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Onay Bekleyen Faaliyetler</h1>
      <p class="page-subtitle">Öğrencilerin girdiği faaliyetleri inceleyin ve onaylayın.</p>
    </div>

    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <div v-if="loading" class="loading">Yükleniyor...</div>
    <div v-else-if="activities.length === 0" class="card">
      <div class="empty-state">
        <p>🎉 Onay bekleyen faaliyet bulunmuyor.</p>
      </div>
    </div>
    <div v-else>
      <div v-for="a in activities" :key="a._id" class="card activity-review-card">
        <div class="review-header">
          <div>
            <strong>{{ a.student?.name || 'Öğrenci' }}</strong>
            <span class="grade-tag">{{ a.student?.grade || '' }}</span>
          </div>
          <span class="date">{{ formatDate(a.date) }}</span>
        </div>

        <div class="review-body">
          <div class="info-row">
            <span class="info-label">Tür:</span>
            <span>{{ getTypeLabel(a.type) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Saat:</span>
            <span class="hours-value">{{ a.hours }} saat</span>
          </div>
          <div v-if="a.description" class="info-row">
            <span class="info-label">Açıklama:</span>
            <span>{{ a.description }}</span>
          </div>
          <div v-if="a.photos && a.photos.length" class="info-row">
            <span class="info-label">Fotoğraflar:</span>
            <div class="photo-grid">
              <a v-for="(p, i) in a.photos" :key="i" :href="p" target="_blank" class="photo-thumb">📷</a>
            </div>
          </div>
        </div>

        <div class="review-actions">
          <input v-model="reviewNotes[a._id]" type="text" class="form-input note-input" placeholder="Not ekleyin (opsiyonel)" />
          <div class="action-buttons">
            <button class="btn btn-success" @click="reviewActivity(a._id, 'approved')">✅ Onayla</button>
            <button class="btn btn-warning" @click="reviewActivity(a._id, 'revision_requested')">✏️ Düzenleme İste</button>
            <button class="btn btn-danger" @click="reviewActivity(a._id, 'rejected')">❌ Reddet</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import api from '../../services/api'

export default {
  name: 'PendingActivities',
  setup() {
    const activities = ref([])
    const loading = ref(true)
    const success = ref('')
    const reviewNotes = reactive({})

    const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR')
    const getTypeLabel = (t) => ({ seminer:'Seminer', stant:'Stant', bagis:'Bağış', kermes:'Kermes', bilinclenme:'Bilinçlendirme', sosyal_medya:'Sosyal Medya', farkindalik:'Farkındalık', diger:'Diğer' })[t] || t

    const loadActivities = async () => {
      loading.value = true
      try {
        const res = await api.get('/activities/pending')
        activities.value = res.data
      } catch (err) { console.error(err) }
      finally { loading.value = false }
    }

    const reviewActivity = async (id, status) => {
      try {
        await api.put(`/activities/${id}/review`, { status, reviewNote: reviewNotes[id] || '' })
        const labels = { approved: 'onaylandı', rejected: 'reddedildi', revision_requested: 'için düzenleme istendi' }
        success.value = `Faaliyet ${labels[status]}.`
        activities.value = activities.value.filter(a => a._id !== id)
        setTimeout(() => { success.value = '' }, 3000)
      } catch (err) { console.error(err) }
    }

    onMounted(loadActivities)
    return { activities, loading, success, reviewNotes, formatDate, getTypeLabel, reviewActivity }
  }
}
</script>

<style scoped>
.activity-review-card { margin-bottom: 16px; }
.review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.grade-tag { margin-left: 8px; padding: 2px 8px; background: var(--primary-light); border-radius: 12px; font-size: 12px; color: var(--primary); }
.date { color: var(--text-secondary); font-size: 13px; }
.review-body { margin-bottom: 16px; }
.info-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 14px; }
.info-label { font-weight: 600; min-width: 80px; color: var(--text-secondary); }
.hours-value { font-weight: 700; color: var(--primary); }
.photo-grid { display: flex; gap: 4px; }
.photo-thumb { text-decoration: none; font-size: 20px; }
.review-actions { display: flex; gap: 12px; align-items: center; padding-top: 12px; border-top: 1px solid var(--border); }
.note-input { flex: 1; }
.action-buttons { display: flex; gap: 8px; }
.empty-state { text-align: center; padding: 40px; color: var(--text-secondary); font-size: 18px; }
</style>
