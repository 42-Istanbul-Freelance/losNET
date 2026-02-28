<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">Merhaba, {{ authStore.userName }} 👋</h1>
      <p class="page-subtitle">Gönüllülük yolculuğundaki ilerlemenizi buradan takip edebilirsiniz.</p>
    </div>

    <!-- İstatistik kartları -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ hours.totalHours || 0 }}</div>
        <div class="stat-label">Toplam Saat</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ currentMonthHours }}</div>
        <div class="stat-label">Bu Ay</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ currentYearHours }}</div>
        <div class="stat-label">Bu Yıl</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ badgeEmoji }}</div>
        <div class="stat-label">{{ badgeLabel }}</div>
      </div>
    </div>

    <!-- Hedef ilerleme -->
    <div class="card target-card">
      <div class="card-title">🎯 Hedef İlerleme</div>
      <div class="target-info">
        <span>{{ hours.totalHours || 0 }} / {{ hours.targetHours || 40 }} saat</span>
        <span>{{ targetPercent }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: targetPercent + '%' }"></div>
      </div>
      <p v-if="nextBadge" class="next-badge-text">
        Sonraki rozet: {{ nextBadge.emoji }} {{ nextBadge.label }} — {{ nextBadge.remaining }} saat kaldı
      </p>
    </div>

    <div class="grid-2">
      <!-- Aylık trend grafiği -->
      <div class="card">
        <div class="card-title">📊 Aylık Saat Trendi</div>
        <div class="chart-container">
          <Bar v-if="monthlyChartData" :data="monthlyChartData" :options="chartOptions" />
          <p v-else class="loading">Veri yükleniyor...</p>
        </div>
      </div>

      <!-- Son faaliyetler -->
      <div class="card">
        <div class="card-title">📋 Son Faaliyetler</div>
        <div v-if="recentActivities.length === 0" class="empty-state">
          <p>Henüz faaliyet girişi yapılmamış</p>
          <router-link to="/student/activities/new" class="btn btn-primary">İlk Faaliyetini Ekle</router-link>
        </div>
        <div v-else class="activity-list">
          <div v-for="activity in recentActivities" :key="activity._id" class="activity-item">
            <div class="activity-info">
              <span class="activity-type">{{ getTypeLabel(activity.type) }}</span>
              <span class="activity-hours">{{ activity.hours }} saat</span>
            </div>
            <div class="activity-meta">
              <span>{{ formatDate(activity.date) }}</span>
              <span class="status-badge" :class="'status-' + activity.status">{{ getStatusLabel(activity.status) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default {
  name: 'StudentDashboard',
  components: { Bar },
  setup() {
    const authStore = useAuthStore()
    const hours = ref({})
    const recentActivities = ref([])
    const nextBadge = ref(null)

    const badgeInfo = {
      none: { emoji: '⭐', label: 'Başlangıç' },
      bronze: { emoji: '🥉', label: 'Bronz İnci' },
      silver: { emoji: '🥈', label: 'Gümüş İnci' },
      gold: { emoji: '🥇', label: 'Altın İnci' },
      platinum: { emoji: '💎', label: 'Platin İnci Lideri' }
    }

    const badgeEmoji = computed(() => badgeInfo[authStore.user?.badgeLevel || 'none']?.emoji)
    const badgeLabel = computed(() => badgeInfo[authStore.user?.badgeLevel || 'none']?.label)

    const targetPercent = computed(() => {
      const total = hours.value.totalHours || 0
      const target = hours.value.targetHours || 40
      return Math.min(Math.round((total / target) * 100), 100)
    })

    const currentMonthHours = computed(() => {
      const now = new Date()
      const monthly = hours.value.monthly || []
      const current = monthly.find(m => m._id.year === now.getFullYear() && m._id.month === now.getMonth() + 1)
      return current ? current.hours : 0
    })

    const currentYearHours = computed(() => {
      const now = new Date()
      const yearly = hours.value.yearly || []
      const current = yearly.find(y => y._id.year === now.getFullYear())
      return current ? current.hours : 0
    })

    const monthlyChartData = computed(() => {
      const monthly = hours.value.monthly || []
      if (monthly.length === 0) return null
      const sorted = [...monthly].sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month)
      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
      return {
        labels: sorted.map(m => `${months[m._id.month - 1]} ${m._id.year}`),
        datasets: [{
          label: 'Saat',
          data: sorted.map(m => m.hours),
          backgroundColor: 'rgba(179, 136, 255, 0.6)',
          borderColor: '#b388ff',
          borderWidth: 2,
          borderRadius: 12
        }]
      }
    })

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }

    const getTypeLabel = (type) => {
      const labels = { seminer: 'Seminer', stant: 'Stant', bagis: 'Bağış', kermes: 'Kermes', bilinclenme: 'Bilinçlendirme', sosyal_medya: 'Sosyal Medya', farkindalik: 'Farkındalık', diger: 'Diğer' }
      return labels[type] || type
    }

    const getStatusLabel = (status) => {
      const labels = { pending: 'Bekliyor', approved: 'Onaylandı', rejected: 'Reddedildi', revision_requested: 'Düzenleme' }
      return labels[status] || status
    }

    const formatDate = (date) => new Date(date).toLocaleDateString('tr-TR')

    onMounted(async () => {
      try {
        const [hoursRes, activitiesRes] = await Promise.all([
          api.get('/reports/my-hours'),
          api.get('/activities', { params: { limit: 5 } })
        ])
        hours.value = hoursRes.data
        recentActivities.value = activitiesRes.data.activities || []

        // Rozet bilgisi
        const certRes = await api.get('/certificates')
        nextBadge.value = certRes.data.nextBadge
      } catch (err) {
        console.error('Dashboard veri yükleme hatası:', err)
      }
    })

    return { authStore, hours, recentActivities, nextBadge, badgeEmoji, badgeLabel, targetPercent, currentMonthHours, currentYearHours, monthlyChartData, chartOptions, getTypeLabel, getStatusLabel, formatDate }
  }
}
</script>

<style scoped>
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.target-card .target-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.next-badge-text {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.chart-container {
  height: 250px;
}

.empty-state {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
}

.empty-state .btn { margin-top: 12px; }

.activity-list { display: flex; flex-direction: column; gap: 8px; }

.activity-item {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-info { display: flex; gap: 12px; align-items: center; }
.activity-type { font-weight: 500; font-size: 14px; }
.activity-hours { color: var(--primary); font-weight: 600; }

.activity-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .grid-2 { grid-template-columns: 1fr; }
}
</style>
