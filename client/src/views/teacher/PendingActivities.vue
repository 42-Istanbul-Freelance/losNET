<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Onay Bekleyen Faaliyetler</h1>
      <p class="page-subtitle">Öğrencilerin girdiği faaliyetleri inceleyin ve onaylayın.</p>
    </div>

    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <!-- Filtreler -->
    <div class="filters">
      <div class="filter-group">
        <input v-model="searchQuery" type="text" class="form-input filter-input" placeholder="🔍 Öğrenci adı..." @input="filterActivities" />
        <select v-model="typeFilter" class="form-select filter-select" @change="filterActivities">
          <option value="">Tüm Türler</option>
          <option value="seminer">Seminer</option>
          <option value="stant">Stant</option>
          <option value="bagis">Bağış</option>
          <option value="kermes">Kermes</option>
          <option value="bilinclenme">Bilinçlendirme</option>
          <option value="sosyal_medya">Sosyal Medya</option>
          <option value="farkindalik">Farkındalık</option>
          <option value="diger">Diğer</option>
        </select>
      </div>
      <span v-if="filteredActivities.length !== allActivities.length" class="filter-info">
        {{ filteredActivities.length }}/{{ allActivities.length }} faaliyet gösteriliyor
      </span>
    </div>

    <div v-if="loading" class="loading">Yükleniyor...</div>
    <div v-else-if="filteredActivities.length === 0" class="card">
      <div class="empty-state">
        <p>🎉 {{ allActivities.length === 0 ? 'Onay bekleyen faaliyet bulunmuyor.' : 'Filtreye uygun faaliyet yok.' }}</p>
      </div>
    </div>
    <div v-else>
      <div v-for="a in filteredActivities" :key="a._id" class="card activity-review-card">
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
          <div v-if="a.documents && a.documents.length" class="info-row">
            <span class="info-label">Belgeler:</span>
            <div class="photo-grid">
              <a v-for="(d, i) in a.documents" :key="i" :href="d" target="_blank" class="photo-thumb">📄</a>
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
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../../services/api'

export default {
  name: 'PendingActivities',
  setup() {
    const allActivities = ref([])
    const loading = ref(true)
    const success = ref('')
    const reviewNotes = reactive({})
    const searchQuery = ref('')
    const typeFilter = ref('')

    const filteredActivities = computed(() => {
      let result = allActivities.value
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(a => a.student?.name?.toLowerCase().includes(q))
      }
      if (typeFilter.value) {
        result = result.filter(a => a.type === typeFilter.value)
      }
      return result
    })

    const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR')
    const getTypeLabel = (t) => ({ seminer:'Seminer', stant:'Stant', bagis:'Bağış', kermes:'Kermes', bilinclenme:'Bilinçlendirme', sosyal_medya:'Sosyal Medya', farkindalik:'Farkındalık', diger:'Diğer' })[t] || t

    const loadActivities = async () => {
      loading.value = true
      try {
        const res = await api.get('/activities/pending')
        allActivities.value = res.data
      } catch (err) { console.error(err) }
      finally { loading.value = false }
    }

    const reviewActivity = async (id, status) => {
      try {
        await api.put(`/activities/${id}/review`, { status, reviewNote: reviewNotes[id] || '' })
        const labels = { approved: 'onaylandı', rejected: 'reddedildi', revision_requested: 'için düzenleme istendi' }
        success.value = `Faaliyet ${labels[status]}.`
        allActivities.value = allActivities.value.filter(a => a._id !== id)
        setTimeout(() => { success.value = '' }, 3000)
      } catch (err) { console.error(err) }
    }

    const filterActivities = () => { /* computed handles this */ }

    onMounted(loadActivities)
    return { allActivities, filteredActivities, loading, success, reviewNotes, searchQuery, typeFilter, formatDate, getTypeLabel, reviewActivity, filterActivities }
  }
}
</script>

<style scoped>
.filters { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
.filter-group { display: flex; gap: 8px; }
.filter-input { max-width: 220px; padding: 10px 14px; }
.filter-select { max-width: 180px; }
.filter-info { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
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
