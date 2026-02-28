<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Genel Merkez Paneli</h1>
      <p class="page-subtitle">Türkiye geneli gönüllülük takip istatistikleri</p>
    </div>

    <!-- Özet kartlar -->
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">{{ overview.totalStudents || 0 }}</div><div class="stat-label">Toplam Öğrenci</div></div>
      <div class="stat-card"><div class="stat-value">{{ overview.totalSchools || 0 }}</div><div class="stat-label">Toplam Okul</div></div>
      <div class="stat-card"><div class="stat-value">{{ overview.totalHours || 0 }}</div><div class="stat-label">Toplam Saat</div></div>
      <div class="stat-card"><div class="stat-value">{{ overview.totalActivities || 0 }}</div><div class="stat-label">Toplam Faaliyet</div></div>
      <div class="stat-card"><div class="stat-value">{{ overview.pendingActivities || 0 }}</div><div class="stat-label">Onay Bekleyen</div></div>
      <div class="stat-card"><div class="stat-value">{{ overview.totalTeachers || 0 }}</div><div class="stat-label">Öğretmen</div></div>
    </div>

    <div class="grid-2">
      <!-- Aylık trend -->
      <div class="card">
        <div class="card-title">📈 Aylık Faaliyet Trendi</div>
        <div class="chart-container">
          <Line v-if="monthlyChart" :data="monthlyChart" :options="lineOptions" />
          <p v-else class="loading">Veri yükleniyor...</p>
        </div>
      </div>

      <!-- Etkinlik türü dağılımı -->
      <div class="card">
        <div class="card-title">🍩 Etkinlik Türü Dağılımı</div>
        <div class="chart-container">
          <Doughnut v-if="typeChart" :data="typeChart" :options="pieOptions" />
          <p v-else class="loading">Veri yükleniyor...</p>
        </div>
      </div>
    </div>

    <div class="grid-2" style="margin-top: 16px;">
      <!-- En aktif öğrenciler -->
      <div class="card">
        <div class="card-title">🏆 En Aktif 10 Öğrenci</div>
        <div v-if="topStudents.length === 0" class="loading">Veri yükleniyor...</div>
        <table v-else>
          <thead><tr><th>#</th><th>Ad Soyad</th><th>Okul</th><th>Saat</th><th>Rozet</th></tr></thead>
          <tbody>
            <tr v-for="(s, i) in topStudents" :key="s._id">
              <td><strong>{{ i+1 }}</strong></td>
              <td>{{ s.name }}</td>
              <td>{{ s.school?.name || '—' }}</td>
              <td><strong>{{ s.totalHours }}</strong></td>
              <td>{{ getBadgeEmoji(s.badgeLevel) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- En aktif okullar -->
      <div class="card">
        <div class="card-title">🏫 En Aktif 10 Okul</div>
        <div v-if="topSchools.length === 0" class="loading">Veri yükleniyor...</div>
        <table v-else>
          <thead><tr><th>#</th><th>Okul</th><th>İl</th><th>Öğrenci</th><th>Saat</th><th>Rozet</th></tr></thead>
          <tbody>
            <tr v-for="(s, i) in topSchools" :key="s._id">
              <td><strong>{{ i+1 }}</strong></td>
              <td>{{ s.name }}</td>
              <td>{{ s.city }}</td>
              <td>{{ s.totalStudents }}</td>
              <td><strong>{{ s.totalHours }}</strong></td>
              <td>{{ getSchoolBadgeLabel(s.badge) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- İl bazlı dağılım ve harita -->
    <div class="card" style="margin-top: 16px;">
      <div class="card-title">🗺️ İl Bazlı Etki Dağılımı</div>
      <div v-if="overview.cityDistribution && overview.cityDistribution.length" class="map-section">
        <CityMap :city-data="overview.cityDistribution" />
        <div class="table-container" style="margin-top: 16px;">
          <table>
            <thead><tr><th>İl</th><th>Okul Sayısı</th><th>Toplam Saat</th></tr></thead>
            <tbody>
              <tr v-for="city in overview.cityDistribution" :key="city._id">
                <td><strong>{{ city._id }}</strong></td>
                <td>{{ city.schoolCount }}</td>
                <td>{{ city.totalHours }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p v-else class="loading">Veri yükleniyor...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import CityMap from '../../components/CityMap.vue'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import api from '../../services/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

export default {
  name: 'AdminDashboard',
  components: { Line, Doughnut, CityMap },
  setup() {
    const overview = ref({})
    const topStudents = ref([])
    const topSchools = ref([])
    const monthlyChart = ref(null)
    const typeChart = ref(null)

    const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(124,58,237,0.08)' } }, x: { grid: { display: false } } } }
    const pieOptions = { responsive: true, maintainAspectRatio: false }
    const getBadgeEmoji = (l) => ({ none:'⭐', bronze:'🥉', silver:'🥈', gold:'🥇', platinum:'💎' })[l] || '⭐'
    const getSchoolBadgeLabel = (b) => ({ none:'—', inci_dostu:'🏫 İnci Dostu', etki_lideri:'🌟 Etki Lideri', yilin_okulu:'🏆 Yılın Okulu' })[b] || '—'

    const typeLabels = { seminer:'Seminer', stant:'Stant', bagis:'Bağış', kermes:'Kermes', bilinclenme:'Bilinçlendirme', sosyal_medya:'Sosyal Medya', farkindalik:'Farkındalık', diger:'Diğer' }
    const colors = ['#7c3aed','#ec4899','#14b8a6','#f59e0b','#3b82f6','#8b5cf6','#f472b6','#2dd4bf']

    onMounted(async () => {
      try {
        const [overviewRes, studentsRes, schoolsRes, monthlyRes, typesRes] = await Promise.all([
          api.get('/reports/overview'),
          api.get('/reports/top-students'),
          api.get('/reports/top-schools'),
          api.get('/reports/monthly'),
          api.get('/reports/activity-types')
        ])

        overview.value = overviewRes.data
        topStudents.value = studentsRes.data
        topSchools.value = schoolsRes.data

        const monthly = monthlyRes.data || []
        if (monthly.length) {
          const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
          monthlyChart.value = {
            labels: monthly.map(m => `${months[m._id.month-1]} ${m._id.year}`),
            datasets: [{
              label: 'Saat',
              data: monthly.map(m => m.totalHours),
              borderColor: '#7c3aed',
              backgroundColor: 'rgba(124,58,237,0.15)',
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointBackgroundColor: '#ec4899'
            }]
          }
        }

        const types = typesRes.data || []
        if (types.length) {
          typeChart.value = {
            labels: types.map(t => typeLabels[t._id]||t._id),
            datasets: [{ data: types.map(t=>t.totalHours), backgroundColor: colors.slice(0,types.length) }]
          }
        }
      } catch (err) { console.error(err) }
    })

    return { overview, topStudents, topSchools, monthlyChart, typeChart, lineOptions, pieOptions, getBadgeEmoji, getSchoolBadgeLabel }
  }
}
</script>

<style scoped>
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart-container { height: 280px; }
@media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
