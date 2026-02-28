<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Faaliyetlerim</h1>
      <p class="page-subtitle">Tüm gönüllülük faaliyetlerinizi buradan görüntüleyebilirsiniz.</p>
    </div>

    <div class="filters">
      <div class="filter-group">
        <select v-model="statusFilter" class="form-select filter-select" @change="loadActivities">
          <option value="">Tüm Durumlar</option>
          <option value="pending">Bekliyor</option>
          <option value="approved">Onaylandı</option>
          <option value="rejected">Reddedildi</option>
          <option value="revision_requested">Düzenleme İstendi</option>
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
      <router-link to="/student/activities/new" class="btn btn-primary">+ Yeni Faaliyet</router-link>
    </div>

    <div class="card">
      <div v-if="loading" class="loading">Yükleniyor...</div>
      <div v-else-if="activities.length === 0" class="empty-state">
        <p>Henüz faaliyet kaydı bulunmuyor.</p>
      </div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Tür</th>
              <th>Saat</th>
              <th>Açıklama</th>
              <th>Durum</th>
              <th>Not</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in activities" :key="a._id">
              <td>{{ formatDate(a.date) }}</td>
              <td>{{ getTypeLabel(a.type) }}</td>
              <td><strong>{{ a.hours }}</strong></td>
              <td>{{ a.description || '—' }}</td>
              <td><span class="status-badge" :class="'status-' + a.status">{{ getStatusLabel(a.status) }}</span></td>
              <td>{{ a.reviewNote || '—' }}</td>
              <td>
                <router-link
                  v-if="canEdit(a.status)"
                  :to="`/student/activities/${a._id}/edit`"
                  class="btn btn-outline btn-sm"
                >
                  ✏️ Düzenle
                </router-link>
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

export default {
  name: 'ActivityList',
  setup() {
    const activities = ref([])
    const loading = ref(true)
    const statusFilter = ref('')
    const typeFilter = ref('')
    const pagination = reactive({ page: 1, pages: 1, total: 0 })

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

    const canEdit = (status) => ['revision_requested', 'rejected'].includes(status)
    const changePage = (dir) => { pagination.page += dir; loadActivities() }
    const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR')
    const getTypeLabel = (t) => ({ seminer:'Seminer', stant:'Stant', bagis:'Bağış', kermes:'Kermes', bilinclenme:'Bilinçlendirme', sosyal_medya:'Sosyal Medya', farkindalik:'Farkındalık', diger:'Diğer' })[t] || t
    const getStatusLabel = (s) => ({ pending:'Bekliyor', approved:'Onaylandı', rejected:'Reddedildi', revision_requested:'Düzenleme' })[s] || s

    onMounted(loadActivities)
    return { activities, loading, statusFilter, typeFilter, pagination, loadActivities, changePage, canEdit, formatDate, getTypeLabel, getStatusLabel }
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
