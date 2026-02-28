<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Rozetlerim & Sertifikalarım</h1>
      <p class="page-subtitle">Gönüllülük saatlerinize göre kazandığınız rozetler.</p>
    </div>

    <div class="badges-grid">
      <div v-for="badge in allBadges" :key="badge.level" class="badge-card" :class="{ earned: isEarned(badge.level), active: currentBadge === badge.level }">
        <div class="badge-emoji">{{ badge.emoji }}</div>
        <div class="badge-name">{{ badge.label }}</div>
        <div class="badge-hours">{{ badge.requiredHours }} saat</div>
        <div v-if="isEarned(badge.level)" class="badge-earned-tag">✅ Kazanıldı</div>
        <div v-else-if="nextBadge && nextBadge.level === badge.level" class="badge-progress">
          {{ nextBadge.remaining }} saat kaldı
        </div>
        <div v-else class="badge-locked">🔒</div>
      </div>
    </div>

    <div v-if="certificates.length" class="card" style="margin-top: 24px;">
      <div class="card-title">📜 Sertifika Geçmişi</div>
      <table>
        <thead>
          <tr><th>Rozet</th><th>Kazanıldığında Toplam Saat</th><th>Tarih</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="cert in certificates" :key="cert._id">
            <td>{{ getBadgeLabel(cert.level) }}</td>
            <td>{{ cert.totalHoursAtGrant }} saat</td>
            <td>{{ formatDate(cert.grantedAt) }}</td>
            <td><button class="btn btn-outline btn-sm" @click="downloadCertificatePdf(cert)">📥 İndir</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="currentBadge !== 'none'" class="card" style="margin-top: 24px;">
      <div class="card-title">📄 Güncel Sertifika</div>
      <p class="cert-desc">Mevcut rozetinize ait sertifikayı indirebilirsiniz.</p>
      <button class="btn btn-primary" @click="downloadCurrentBadgePdf">
        📥 {{ getBadgeLabel(currentBadge) }} Sertifikasını İndir
      </button>
    </div>

    <div class="card" style="margin-top: 24px;">
      <div class="card-title">🎓 Üniversite Başvurusu Belgesi</div>
      <p class="cert-desc">Toplam saat, rozetler ve faaliyet özetini içeren resmi görünümlü belge. Üniversite başvurularında kullanılabilir.</p>
      <button class="btn btn-primary" @click="downloadUniversityDocument" :disabled="downloadingDoc">
        {{ downloadingDoc ? 'Hazırlanıyor...' : '📥 Gönüllülük Özet Belgesi İndir' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { jsPDF } from 'jspdf'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

export default {
  name: 'CertificateView',
  setup() {
    const authStore = useAuthStore()
    const certificates = ref([])
    const nextBadge = ref(null)
    const currentBadge = ref('none')
    const studentData = ref(null)
    const downloadingDoc = ref(false)

    const allBadges = [
      { level: 'bronze', emoji: '🥉', label: 'Bronz İnci', requiredHours: 25 },
      { level: 'silver', emoji: '🥈', label: 'Gümüş İnci', requiredHours: 50 },
      { level: 'gold', emoji: '🥇', label: 'Altın İnci', requiredHours: 100 },
      { level: 'platinum', emoji: '💎', label: 'Platin İnci Lideri', requiredHours: 200 }
    ]

    const isEarned = (level) => {
      const order = ['bronze', 'silver', 'gold', 'platinum']
      const currentIdx = order.indexOf(currentBadge.value)
      const checkIdx = order.indexOf(level)
      return checkIdx <= currentIdx
    }

    const getBadgeLabel = (level) => allBadges.find(b => b.level === level)?.label || level
    const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR')

    const generateCertificatePdf = (badgeLabel, totalHours, dateStr) => {
      const doc = new jsPDF()
      const name = authStore.user?.name || 'Öğrenci'
      doc.setFontSize(24)
      doc.text('LÖSEV İNCİ', 105, 30, { align: 'center' })
      doc.setFontSize(16)
      doc.text('Gönüllülük Sertifikası', 105, 42, { align: 'center' })
      doc.setFontSize(12)
      doc.text('Bu sertifika, aşağıda adı geçen kişinin LÖSEV İnci Gönüllülük Takip Sistemi', 105, 58, { align: 'center' })
      doc.text('kapsamında gönüllülük faaliyetlerini gerçekleştirdiğini belgeler.', 105, 66, { align: 'center' })
      doc.setFontSize(18)
      doc.text(name, 105, 90, { align: 'center' })
      doc.setFontSize(14)
      doc.text(badgeLabel, 105, 102, { align: 'center' })
      doc.text(`${totalHours} saat gönüllülük`, 105, 112, { align: 'center' })
      doc.setFontSize(10)
      doc.text(`Tarih: ${dateStr}`, 105, 130, { align: 'center' })
      doc.text('LÖSEV - Lösemili Çocuklar Sağlık ve Eğitim Vakfı', 105, 145, { align: 'center' })
      return doc
    }

    const downloadCertificatePdf = (cert) => {
      const doc = generateCertificatePdf(
        getBadgeLabel(cert.level),
        cert.totalHoursAtGrant,
        formatDate(cert.grantedAt)
      )
      doc.save(`LOSEV-Sertifika-${cert.level}-${formatDate(cert.grantedAt).replace(/\./g, '-')}.pdf`)
    }

    const downloadCurrentBadgePdf = () => {
      const totalHours = authStore.user?.totalHours || 0
      const doc = generateCertificatePdf(
        getBadgeLabel(currentBadge.value),
        totalHours,
        formatDate(new Date())
      )
      doc.save(`LOSEV-Sertifika-${currentBadge.value}.pdf`)
    }

    const typeLabels = { seminer: 'Seminer', stant: 'Stant', bagis: 'Bagis', kermes: 'Kermes', bilinclenme: 'Bilinclendirme', sosyal_medya: 'Sosyal Medya', farkindalik: 'Farkindalik', diger: 'Diger' }

    const downloadUniversityDocument = async () => {
      downloadingDoc.value = true
      try {
        const [hoursRes, activitiesRes] = await Promise.all([
          api.get('/reports/my-hours'),
          api.get('/activities', { params: { status: 'approved', limit: 100 } })
        ])
        const hours = hoursRes.data
        const activities = activitiesRes.data.activities || []

        const doc = new jsPDF()
        const name = authStore.user?.name || 'Ogrenci'
        const schoolName = authStore.user?.school?.name || '-'

        doc.setFontSize(20)
        doc.text('LOSEV INCI', 105, 25, { align: 'center' })
        doc.setFontSize(14)
        doc.text('Gonulluluk Ozet Belgesi', 105, 35, { align: 'center' })
        doc.text('Universite Basvurularinda Kullanilabilir', 105, 43, { align: 'center' })

        doc.setFontSize(11)
        doc.text(`Ad Soyad: ${name}`, 20, 58)
        doc.text(`Okul: ${schoolName}`, 20, 65)
        doc.text(`Toplam Gonulluluk Saati: ${hours.totalHours || 0}`, 20, 72)
        doc.text(`En Yuksek Rozet: ${getBadgeLabel(currentBadge.value)}`, 20, 79)

        doc.setFontSize(12)
        doc.text('Faaliyet Ozeti', 20, 95)
        doc.setFontSize(9)
        let y = 103
        activities.slice(0, 25).forEach((a, i) => {
          if (y > 270) return
          const typeStr = typeLabels[a.type] || a.type
          doc.text(`${i + 1}. ${formatDate(a.date)} - ${typeStr} - ${a.hours} saat`, 22, y)
          y += 6
        })
        if (activities.length > 25) {
          doc.text(`... ve ${activities.length - 25} faaliyet daha`, 22, y)
        }

        doc.setFontSize(8)
        doc.text(`Belge tarihi: ${formatDate(new Date())}`, 105, 285, { align: 'center' })
        doc.text('LOSEV - Losemili Cocuklar Saglik ve Egitim Vakfi', 105, 290, { align: 'center' })

        doc.save(`LOSEV-Gonulluluk-Ozet-Belgesi.pdf`)
      } catch (err) {
        console.error(err)
      } finally {
        downloadingDoc.value = false
      }
    }

    onMounted(async () => {
      try {
        const res = await api.get('/certificates')
        certificates.value = res.data.certificates || []
        nextBadge.value = res.data.nextBadge
        currentBadge.value = res.data.student?.badgeLevel || 'none'
        studentData.value = res.data.student
      } catch (err) { console.error(err) }
    })

    return { authStore, certificates, nextBadge, currentBadge, allBadges, isEarned, getBadgeLabel, formatDate, downloadCertificatePdf, downloadCurrentBadgePdf, downloadUniversityDocument, downloadingDoc }
  }
}
</script>

<style scoped>
.badges-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

.badge-card {
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  text-align: center;
  transition: var(--transition);
  opacity: 0.6;
}

.badge-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.15);
}

.badge-card.earned {
  opacity: 1;
  border-color: var(--success);
  background: linear-gradient(135deg, rgba(167, 243, 208, 0.4), rgba(110, 231, 183, 0.3));
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
}
.badge-card.active {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.25);
  background: linear-gradient(135deg, rgba(237, 233, 254, 0.6), rgba(252, 231, 243, 0.4));
}

.badge-emoji { font-size: 48px; margin-bottom: 8px; }
.badge-name { font-size: 16px; font-weight: 600; }
.badge-hours { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
.badge-earned-tag { font-size: 12px; color: var(--success); font-weight: 600; margin-top: 8px; }
.badge-progress { font-size: 12px; color: var(--primary); margin-top: 8px; }
.badge-locked { font-size: 20px; margin-top: 8px; }

.cert-desc { margin-bottom: 12px; color: var(--text-secondary); font-size: 14px; }
.btn-sm { padding: 6px 12px; font-size: 12px; }

@media (max-width: 768px) { .badges-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
