<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Etkinliklerim</h1>
      <p class="page-subtitle">Okulunuzdaki etkinlikleri görüntüleyin ve katılım isteği gönderin.</p>
    </div>

    <div class="filters">
      <div class="filter-group">
        <select v-model="statusFilter" class="form-select filter-select" @change="loadActivities">
          <option value="">Tüm Durumlar</option>
          <option value="pending">Bekliyor</option>
          <option value="approved">Onaylandı</option>
          <option value="rejected">Reddedildi</option>
        </select>
        <select v-model="typeFilter" class="form-select filter-select" @change="loadActivities">
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
    </div>

    <div class="card">
      <div v-if="loading" class="loading">Yükleniyor...</div>
      <div v-else-if="activities.length === 0" class="empty-state">
        <p>Henüz etkinlik bulunmuyor.</p>
      </div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Tür</th>
              <th>Saat</th>
              <th>Açıklama</th>
              <th>Katılım</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in activities" :key="a._id">
              <td>{{ formatDate(a.date) }}</td>
              <td>{{ getTypeLabel(a.type) }}</td>
              <td><strong>{{ a.hours }}</strong></td>
              <td>{{ a.description || '—' }}</td>
              <td>
                <span class="status-badge" :class="'status-' + getMyStatus(a)">
                  {{ getStatusLabel(getMyStatus(a)) }}
                </span>
              </td>
              <td>
                <button
                  v-if="canRequest(a)"
                  class="btn btn-primary btn-sm"
                  :disabled="requestingId === a._id"
                  @click="requestParticipation(a._id)"
                >
                  {{ requestingId === a._id ? 'Gönderiliyor...' : 'Katılım İste' }}
                </button>
                <span v-else class="no-action">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.pages > 1" class="pagination">
        <button class="btn btn-outline" :disabled="pagination.page <= 1" @click="changePage(-1)">←</button>
        <span>{{ pagination.page }} / {{ pagination.pages }}</span>
        <button class="btn btn-outline" :disabled="pagination.page >= pagination.pages" @click="changePage(1)">→</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'ActivityList',
  setup() {
    const authStore = useAuthStore()
    const activities = ref([])
    const loading = ref(true)
    const statusFilter = ref('')
    const typeFilter = ref('')
    const pagination = reactive({ page: 1, pages: 1, total: 0 })
    const requestingId = ref('')

    const loadActivities = async () => {
      loading.value = true
      try {
        const params = { page: pagination.page, limit: 20 }
        if (statusFilter.value) params.status = statusFilter.value
        if (typeFilter.value) params.type = typeFilter.value
        const res = await api.get('/activities', { params })
        activities.value = res.data.activities
        Object.assign(pagination, res.data.pagination)
      } catch (err) { console.error(err) }
      finally { loading.value = false }
    }

    const getMyStatus = (activity) => {
      const me = authStore.user?._id
      if (!me) return 'none'
      const entry = (activity.participantStudents || []).find(p => (p.student?._id || p.student) === me)
      return entry?.participationStatus || 'none'
    }

    const canRequest = (activity) => getMyStatus(activity) === 'none'

    const requestParticipation = async (id) => {
      requestingId.value = id
      try {
        await api.post(`/activities/${id}/participation-request`)
        await loadActivities()
      } catch (err) {
        console.error(err)
      } finally {
        requestingId.value = ''
      }
    }

    const changePage = (dir) => { pagination.page += dir; loadActivities() }
    const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR')
    const getTypeLabel = (t) => ({ seminer:'Seminer', stant:'Stant', bagis:'Bağış', kermes:'Kermes', bilinclenme:'Bilinçlendirme', sosyal_medya:'Sosyal Medya', farkindalik:'Farkındalık', diger:'Diğer' })[t] || t
    const getStatusLabel = (s) => ({ none:'—', pending:'Bekliyor', approved:'Onaylandı', rejected:'Reddedildi' })[s] || s

    onMounted(loadActivities)
    return { authStore, activities, loading, statusFilter, typeFilter, pagination, requestingId, loadActivities, changePage, getMyStatus, canRequest, requestParticipation, formatDate, getTypeLabel, getStatusLabel }
  }
}
</script>

<style scoped>
.filters { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
.filter-group { display: flex; gap: 8px; }
.filter-select { max-width: 220px; }
.empty-state { text-align: center; padding: 40px; color: var(--text-secondary); }
.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.no-action { color: var(--text-secondary); font-size: 13px; }
</style>
