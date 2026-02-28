<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Öğretmen Paneli</h1>
      <p class="page-subtitle">{{ authStore.userSchool }} — Okul gönüllülük genel durumu</p>
      <p v-if="schoolBadge" class="school-badge">{{ schoolBadge }}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.pendingCount || 0 }}</div>
        <div class="stat-label">Onay Bekleyen</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalStudents || 0 }}</div>
        <div class="stat-label">Öğrenci Sayısı</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalHours || 0 }}</div>
        <div class="stat-label">Toplam Saat</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.approvedCount || 0 }}</div>
        <div class="stat-label">Onaylanan Faaliyet</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title">📊 Aylık Trend</div>
        <div class="chart-container">
          <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
          <p v-else class="loading">Veri yükleniyor...</p>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🏆 En Aktif Öğrenciler</div>
        <div v-if="topStudents.length === 0" class="loading">Veri yükleniyor...</div>
        <div v-else class="student-list">
          <div v-for="(s, i) in topStudents" :key="s._id" class="student-item">
            <span class="rank">{{ i + 1 }}</span>
            <span class="name">{{ s.name }}</span>
            <span class="hours">{{ s.totalHours }} saat</span>
            <span class="badge-mini">{{ getBadgeEmoji(s.badgeLevel) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="quick-actions" style="margin-top: 16px;">
      <router-link to="/teacher/pending" class="btn btn-warning">⏳ Onay Bekleyenleri Gör ({{ stats.pendingCount || 0 }})</router-link>
      <router-link to="/teacher/school-report" class="btn btn-primary">📈 Detaylı Okul Raporu</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default {
  name: 'TeacherDashboard',
  components: { Bar },
  setup() {
    const authStore = useAuthStore()
    const stats = ref({})
    const topStudents = ref([])
    const chartData = ref(null)
    const schoolBadge = ref('')

    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    const getBadgeEmoji = (l) => ({ none:'⭐', bronze:'🥉', silver:'🥈', gold:'🥇', platinum:'💎' })[l] || '⭐'

    onMounted(async () => {
      try {
        const [reportRes, pendingRes, activitiesRes] = await Promise.all([
          api.get('/reports/my-school'),
          api.get('/activities/pending'),
          api.get('/activities', { params: { status: 'approved' } })
        ])

        const report = reportRes.data
        topStudents.value = (report.students || []).slice(0, 5)
        const badgeLabels = { inci_dostu: '🏫 İnci Dostu Okul', etki_lideri: '🌟 Sosyal Etki Lideri', yilin_okulu: '🏆 Yılın En Aktif İnci Okulu' }
        schoolBadge.value = report.school?.badge && report.school.badge !== 'none' ? badgeLabels[report.school.badge] : ''

        stats.value = {
          totalStudents: report.totalStudents || 0,
          totalHours: report.totalHours || 0,
          pendingCount: (pendingRes.data || []).length,
          approvedCount: activitiesRes.data.pagination?.total || 0
        }

        const monthly = report.monthlyTrend || []
        if (monthly.length) {
          const sorted = [...monthly].sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month)
          const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
          chartData.value = {
            labels: sorted.map(m => `${months[m._id.month-1]}`),
            datasets: [{ label: 'Saat', data: sorted.map(m => m.hours), backgroundColor: 'rgba(179,136,255,0.6)', borderColor: '#b388ff', borderWidth: 2, borderRadius: 12 }]
          }
        }
      } catch (err) { console.error(err) }
    })

    return { authStore, stats, topStudents, chartData, chartOptions, getBadgeEmoji, schoolBadge }
  }
}
</script>

<style scoped>
.school-badge { margin-top: 6px; font-size: 15px; font-weight: 700; color: var(--primary); }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart-container { height: 250px; }
.student-list { display: flex; flex-direction: column; gap: 8px; }
.student-item { display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); }
.rank { font-weight: 700; color: var(--primary); width: 24px; text-align: center; }
.name { flex: 1; font-weight: 500; }
.hours { color: var(--text-secondary); font-size: 13px; }
.badge-mini { font-size: 18px; }
.quick-actions { display: flex; gap: 12px; }
@media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
