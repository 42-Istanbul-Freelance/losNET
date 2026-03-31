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
      <div v-else-if="activeTab === 'approved' && approvedStudents.length === 0" class="empty-state">
        <p>Henüz onayladığınız bir öğrenci bulunmuyor.</p>
      </div>
      <div v-else-if="activeTab !== 'approved' && activities.length === 0" class="empty-state">
        <p>Henüz etkinlik bulunmuyor.</p>
      </div>
      
      <!-- Öğrenci Tablosu (Onayladıklarım sekmesi) -->
      <div v-else-if="activeTab === 'approved' && approvedStudents.length > 0" class="table-container">
        <table>
          <thead>
            <tr>
              <th>Öğrenci Adı</th>
              <th>Sınıf</th>
              <th>Etkinlik Sayısı</th>
              <th>Toplam Onaylanan Saat</th>
              <th>Detay</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="student in approvedStudents" :key="student._id">
              <tr>
                <td>{{ student.studentInfo?.name || 'Bilinmiyor' }} <br><small class="text-muted">{{ student.studentInfo?.email }}</small></td>
                <td>{{ student.studentInfo?.grade || '—' }}</td>
                <td>{{ student.activityCount }}</td>
                <td><strong>{{ student.totalHours }}</strong></td>
                <td>
                  <button class="btn btn-outline btn-sm" @click="toggleStudentDetails(student._id)">
                    {{ expandedStudents.includes(student._id) ? 'Gizle' : 'Göster' }}
                  </button>
                </td>
              </tr>
              <tr v-if="expandedStudents.includes(student._id)" class="expanded-row">
                <td colspan="5">
                  <div class="student-activities-detail">
                    <h4 class="detail-title">Katıldığı Etkinlikler:</h4>
                    <ul class="detail-list">
                      <li v-for="act in student.activities" :key="act._id">
                        <span class="act-type">{{ getTypeLabel(act.type) }}</span> — 
                        <span class="act-date">{{ formatDate(act.date) }}</span> 
                        (<strong>{{ act.hours }} saat</strong>)
                        <span class="act-desc" v-if="act.title"> - {{ act.title }}</span>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Normal Etkinlik Tablosu -->
      <div v-else-if="activeTab !== 'approved' && activities.length > 0" class="table-container">
        <table>
          <thead>
            <tr>
              <th>Oluşturan</th>
              <th>Tarih</th>
              <th>Tür</th>
              <th>Tahmini Saat</th>
              <th>Katılımcı Sayısı</th>
              <th v-if="activeTab === 'created'">Doğrulama Kodu</th>
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
              <td v-if="activeTab === 'created'">
                <div v-if="a.verificationCode" class="code-display">
                  <code class="v-code">{{ a.verificationCode }}</code>
                  <button class="btn-icon-small" title="Kodu Yenile" @click="generateCode(a._id)">
                    🔄
                  </button>
                </div>
                <button v-else class="btn btn-outline btn-sm" @click="generateCode(a._id)">
                  Kod Oluştur
                </button>
              </td>
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

      <div v-if="activeTab !== 'approved' && pagination.pages > 1" class="pagination">
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
    
    const approvedStudents = ref([])
    const expandedStudents = ref([])

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

    const loadApprovedStudents = async () => {
      loading.value = true
      try {
        const res = await api.get('/activities/teacher/approved-students')
        approvedStudents.value = res.data
      } catch (err) {
        console.error('Öğrenci özeti getirilemedi:', err)
      } finally {
        loading.value = false
      }
    }

    const setTab = (tab) => {
      activeTab.value = tab
      expandedStudents.value = []
      typeFilter.value = ''
      
      if (tab === 'approved') {
        loadApprovedStudents()
      } else {
        pagination.page = 1
        loadActivities()
      }
    }

    const toggleStudentDetails = (id) => {
      const idx = expandedStudents.value.indexOf(id)
      if (idx > -1) expandedStudents.value.splice(idx, 1)
      else expandedStudents.value.push(id)
    }

    const generateCode = async (id) => {
      try {
        const res = await api.post(`/activities/${id}/verification-code`)
        // Update local activity state
        const activity = activities.value.find(a => a._id === id)
        if (activity) {
          activity.verificationCode = res.data.code
        }
      } catch (err) {
        console.error('Kod oluşturulamadı:', err)
      }
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
      approvedStudents,
      expandedStudents,
      loadActivities,
      setTab,
      changePage,
      formatDate,
      getTypeLabel,
      getApprovedCount,
      toggleStudentDetails,
      generateCode
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

.text-muted {
  color: var(--text-secondary);
}

.expanded-row {
  background-color: #f8f9fa;
}

.expanded-row td {
  padding: 16px;
  border-bottom: 2px solid var(--border);
}

.student-activities-detail {
  padding-left: 12px;
  border-left: 3px solid var(--primary);
}

.detail-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--text);
}

.detail-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13.5px;
}

.detail-list li {
  margin-bottom: 4px;
}

.act-type {
  font-weight: 500;
  color: var(--primary-dark);
}

.act-date {
  color: var(--text-light);
}

.act-desc {
  color: var(--text-secondary);
  font-style: italic;
}

.code-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.v-code {
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  font-family: monospace;
  color: var(--primary-dark);
}

.btn-icon-small {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.btn-icon-small:hover {
  transform: rotate(45deg);
}
</style>
