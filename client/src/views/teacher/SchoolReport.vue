<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Okul Raporu</h1>
      <p class="page-subtitle">{{ report.school?.name || '' }} — {{ report.school?.city || '' }}</p>
      <div v-if="report.school?.badge && report.school.badge !== 'none'" class="school-badge-display">
        {{ getSchoolBadgeLabel(report.school.badge) }}
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">{{ report.totalStudents || 0 }}</div><div class="stat-label">Öğrenci</div></div>
      <div class="stat-card"><div class="stat-value">{{ report.totalHours || 0 }}</div><div class="stat-label">Toplam Saat</div></div>
      <div class="stat-card">
        <div class="stat-value">{{ report.school?.targetHours || 40 }}</div>
        <div class="stat-label">Hedef Saat</div>
        <select v-if="canEditTarget" v-model="targetHoursEdit" @change="updateTargetHours" class="target-select">
          <option :value="30">30</option>
          <option :value="40">40</option>
        </select>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title">📊 Aylık Trend</div>
        <div class="chart-container">
          <Bar v-if="monthlyChart" :data="monthlyChart" :options="chartOptions" />
        </div>
      </div>
      <div class="card">
        <div class="card-title">🍩 Etkinlik Türü Dağılımı</div>
        <div class="chart-container">
          <Doughnut v-if="typeChart" :data="typeChart" :options="pieOptions" />
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 16px;">
      <div class="card-title">👩‍🎓 Öğrenci Listesi</div>
      <table>
        <thead><tr><th>#</th><th>Ad Soyad</th><th>Sınıf</th><th>Toplam Saat</th><th>Rozet</th></tr></thead>
        <tbody>
          <tr v-for="(s, i) in report.students" :key="s._id">
            <td>{{ i+1 }}</td>
            <td>{{ s.name }}</td>
            <td>{{ s.grade || '—' }}</td>
            <td><strong>{{ s.totalHours }}</strong></td>
            <td>{{ getBadgeEmoji(s.badgeLevel) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import { useAuthStore } from '../../stores/auth'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import api from '../../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export default {
  name: 'SchoolReport',
  components: { Bar, Doughnut },
  setup() {
    const authStore = useAuthStore()
    const report = ref({})
    const monthlyChart = ref(null)
    const typeChart = ref(null)
    const targetHoursEdit = ref(40)
    const canEditTarget = computed(() => authStore.isTeacher || authStore.isAdmin)
    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    const pieOptions = { responsive: true, maintainAspectRatio: false }
    const getBadgeEmoji = (l) => ({ none:'⭐', bronze:'🥉', silver:'🥈', gold:'🥇', platinum:'💎' })[l] || '⭐'
    const getSchoolBadgeLabel = (b) => ({ none:'', inci_dostu:'🏫 İnci Dostu Okul', etki_lideri:'🌟 Sosyal Etki Lideri Okul', yilin_okulu:'🏆 Yılın En Aktif İnci Okulu' })[b] || ''

    const typeLabels = { seminer:'Seminer', stant:'Stant', bagis:'Bağış', kermes:'Kermes', bilinclenme:'Bilinçlendirme', sosyal_medya:'Sosyal Medya', farkindalik:'Farkındalık', diger:'Diğer' }
    const colors = ['#b388ff','#ff8b94','#80cbc4','#ffb74d','#64b5f6','#ce93d8','#ffaaa5','#a8e6cf']

    onMounted(async () => {
      try {
        const res = await api.get('/reports/my-school')
        report.value = res.data
        targetHoursEdit.value = res.data.school?.targetHours || 40

        const monthly = res.data.monthlyTrend || []
        if (monthly.length) {
          const sorted = [...monthly].sort((a,b) => a._id.year-b._id.year || a._id.month-b._id.month)
          const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
          monthlyChart.value = { labels: sorted.map(m => months[m._id.month-1]), datasets: [{ label:'Saat', data: sorted.map(m=>m.hours), backgroundColor:'rgba(179,136,255,0.6)', borderColor:'#b388ff', borderWidth:2, borderRadius:12 }] }
        }

        const types = res.data.typeDistribution || []
        if (types.length) {
          typeChart.value = { labels: types.map(t => typeLabels[t._id]||t._id), datasets: [{ data: types.map(t=>t.hours), backgroundColor: colors.slice(0,types.length) }] }
        }
      } catch (err) { console.error(err) }
    })

    const updateTargetHours = async () => {
      try {
        await api.patch(`/schools/${report.value.school?._id}/target-hours`, { targetHours: targetHoursEdit.value })
        report.value = { ...report.value, school: { ...report.value.school, targetHours: targetHoursEdit.value } }
      } catch (err) { console.error(err) }
    }

    return { report, monthlyChart, typeChart, chartOptions, pieOptions, getBadgeEmoji, getSchoolBadgeLabel, targetHoursEdit, canEditTarget, updateTargetHours }
  }
}
</script>

<style scoped>
.school-badge-display {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}
.target-select {
  margin-top: 8px;
  padding: 4px 8px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid var(--border);
}
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart-container { height: 250px; }
@media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
