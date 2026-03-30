<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Faaliyetlerim</h1>
      <p class="page-subtitle">Okulunuzdaki tüm etkinlikleri inceleyin, oluşturduklarınızı veya onayladıklarınızı takip edin.</p>
    </div>

    <div class="filters">
      <div class="filter-group">
        <button 
          class="btn" 
          :class="activeTab === 'all' ? 'btn-primary' : 'btn-outline'" 
          @click="setTab('all')"
        >
          Tüm Okul
        </button>
        <button 
          class="btn" 
          :class="activeTab === 'created' ? 'btn-primary' : 'btn-outline'" 
          @click="setTab('created')"
        >
          Oluşturduklarım
        </button>
        <button 
          class="btn" 
          :class="activeTab === 'approved' ? 'btn-primary' : 'btn-outline'" 
          @click="setTab('approved')"
        >
          Onayladıklarım
        </button>
      </div>

      <div class="filter-group">
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
              <th>Oluşturan</th>
              <th>Tarih</th>
              <th>Tür</th>
              <th>Saat</th>
              <th>Katılımcı Sayısı</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in activities" :key="a._id">
              <td>
                <span v-if="a.createdBy?._id === authStore.user?._id" class="badge badge-teacher">Ben</span>
                <span v-else>{{ a.createdBy?.name || 'Belirtilmedi' }}</span>
              </td>
              <td>{{ formatDate(a.date) }}</td>
              <td>{{ getTypeLabel(a.type) }}</td>
              <td><strong>{{ a.hours }}</strong></td>
              <td>{{ getApprovedCount(a) }} onaylı</td>
              <td>
                <div class="action-buttons">
                  <router-link :to="`/teacher/activities/${a._id}/edit`" class="btn btn-outline btn-sm">
                    İncele / Düzenle
                  </router-link>
                </div>
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
  name: 'TeacherActivityList',
  setup() {
    const authStore = useAuthStore()
    const activities = ref([])
    const loading = ref(true)
    const activeTab = ref('all') // all | created | approved
    const typeFilter = ref('')
    const pagination = reactive({ page: 1, pages: 1, total: 0 })

    const loadActivities = async () => {
      loading.value = true
      try {
        const params = { page: pagination.page, limit: 20 }
        
        if (activeTab.value !== 'all') {
          params.filter = activeTab.value
        }
        
        if (typeFilter.value) params.type = typeFilter.value
        
        const res = await api.get('/activities', { params })
        activities.value = res.data.activities
        Object.assign(pagination, res.data.pagination)
      } catch (err) {
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const setTab = (tab) => {
      activeTab.value = tab
      pagination.page = 1
      loadActivities()
    }

    const changePage = (delta) => {
      pagination.page += delta
      loadActivities()
    }

    const formatDate = (dateString) => {
      if (!dateString) return '—'
      const date = new Date(dateString)
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    const getTypeLabel = (type) => {
      const types = {
        seminer: 'Seminer',
        stant: 'Stant',
        bagis: 'Bağış',
        kermes: 'Kermes',
        bilinclenme: 'Bilinçlendirme',
        sosyal_medya: 'Sosyal Medya',
        farkindalik: 'Farkındalık',
        diger: 'Diğer'
      }
      return types[type] || type
    }

    const getApprovedCount = (activity) => {
      if (!activity.participantStudents) return 0
      return activity.participantStudents.filter(p => p.participationStatus === 'approved').length
    }

    onMounted(() => {
      loadActivities()
    })

    return {
      authStore,
      activities,
      loading,
      activeTab,
      typeFilter,
      pagination,
      loadActivities,
      setTab,
      changePage,
      formatDate,
      getTypeLabel,
      getApprovedCount
    }
  }
}
</script>

<style scoped>
.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  min-width: 150px;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
}

.table-container {
  overflow-x: auto;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.badge-teacher {
  background-color: var(--primary);
  color: white;
  margin-right: 8px;
}
</style>
