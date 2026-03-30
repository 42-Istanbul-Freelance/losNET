<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Öğrenci Kayıtları</h1>
      <p class="page-subtitle">Onay bekleyen ve onaylanan öğrenci kayıtları</p>
    </div>

    <div v-if="loading" class="loading">Veriler yükleniyor...</div>
    <div v-else>
      <!-- Onay Bekleyen Öğrenciler -->
      <div class="card">
        <div class="card-title">📋 Onay Bekleyen Öğrenciler</div>
        <div v-if="pendingStudents.length === 0" class="empty-state">
          <p>Onay bekleyen öğrenci yok</p>
        </div>
        <div v-else class="registrations-list">
          <div v-for="student in pendingStudents" :key="student._id" class="registration-item pending">
            <div class="student-info">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-details">
                <span class="email">{{ student.email }}</span>
                <span class="grade" v-if="student.grade">{{ student.grade }}</span>
              </div>
              <div class="student-meta">
                <span v-if="student.city">📍 {{ student.city }}</span>
                <span v-if="student.phone">📞 {{ student.phone }}</span>
              </div>
            </div>
            <div class="actions">
              <button
                class="btn btn-success"
                @click="approveStudent(student._id)"
                :disabled="approvingId === student._id"
              >
                {{ approvingId === student._id ? 'Onaylanıyor...' : '✅ Onayla' }}
              </button>
              <button
                class="btn btn-danger"
                @click="rejectStudent(student._id)"
                :disabled="rejectingId === student._id"
              >
                {{ rejectingId === student._id ? 'Reddediliyor...' : '❌ Reddet' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Onaylanan Öğrenciler -->
      <div class="card" style="margin-top: 2rem;">
        <div class="card-title">✅ Onaylanan Öğrenciler</div>
        <div v-if="approvedStudents.length === 0" class="empty-state">
          <p>Henüz onaylanan öğrenci yok</p>
        </div>
        <div v-else class="registrations-list">
          <div v-for="student in approvedStudents" :key="student._id" class="registration-item approved">
            <div class="student-info">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-details">
                <span class="email">{{ student.email }}</span>
                <span class="grade" v-if="student.grade">{{ student.grade }}</span>
              </div>
              <div class="student-meta">
                <span v-if="student.city">📍 {{ student.city }}</span>
                <span v-if="student.phone">📞 {{ student.phone }}</span>
                <span v-if="student.approvedAt" class="approved-date">
                  Onaylayan: {{ formatDate(student.approvedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reddedilen Öğrenciler -->
      <div class="card" style="margin-top: 2rem;" v-if="rejectedStudents.length > 0">
        <div class="card-title">❌ Reddedilen Öğrenciler</div>
        <div class="registrations-list">
          <div v-for="student in rejectedStudents" :key="student._id" class="registration-item rejected">
            <div class="student-info">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-details">
                <span class="email">{{ student.email }}</span>
                <span class="grade" v-if="student.grade">{{ student.grade }}</span>
              </div>
              <div class="student-meta">
                <span v-if="student.rejectionReason" class="rejection-reason">
                  Neden: {{ student.rejectionReason }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

export default {
  name: 'StudentRegistrations',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      loading: true,
      error: null,
      students: [],
      approvingId: null,
      rejectingId: null
    }
  },
  computed: {
    pendingStudents() {
      return this.students.filter(s => s.registrationStatus === 'pending')
    },
    approvedStudents() {
      return this.students.filter(s => s.registrationStatus === 'approved')
    },
    rejectedStudents() {
      return this.students.filter(s => s.registrationStatus === 'rejected')
    }
  },
  methods: {
    async fetchRegistrations() {
      try {
        this.loading = true
        this.error = null
        const response = await api.get('/auth/pending-registrations')
        this.students = response.data
      } catch (err) {
        this.error = 'Kayıtlar alınırken hata oluştu: ' + (err.response?.data?.message || err.message)
        console.error('Kayıt alımı hatası:', err)
      } finally {
        this.loading = false
      }
    },
    async approveStudent(studentId) {
      try {
        this.approvingId = studentId
        await api.put(`/auth/approve-student/${studentId}`)
        this.fetchRegistrations()
      } catch (err) {
        this.error = 'Öğrenci onaylanırken hata oluştu: ' + (err.response?.data?.message || err.message)
        console.error('Onay hatası:', err)
      } finally {
        this.approvingId = null
      }
    },
    async rejectStudent(studentId) {
      const reason = prompt('Reddetme sebebini girin (isteğe bağlı):')
      if (reason === null) return // Kullanıcı iptal etti

      try {
        this.rejectingId = studentId
        await api.put(`/auth/reject-student/${studentId}`, {
          rejectionReason: reason
        })
        this.fetchRegistrations()
      } catch (err) {
        this.error = 'Öğrenci reddedilirken hata oluştu: ' + (err.response?.data?.message || err.message)
        console.error('Reddetme hatası:', err)
      } finally {
        this.rejectingId = null
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('tr-TR')
    }
  },
  mounted() {
    this.fetchRegistrations()
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: #2c3e50;
}

.page-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.registrations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.registration-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #ccc;
  background-color: #f9f9f9;
}

.registration-item.pending {
  border-left-color: #ffc107;
  background-color: #fffbf0;
}

.registration-item.approved {
  border-left-color: #28a745;
  background-color: #f0f8f4;
}

.registration-item.rejected {
  border-left-color: #dc3545;
  background-color: #f8f0f0;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.student-details {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.email {
  color: #3498db;
}

.grade {
  background: #ecf0f1;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  color: #555;
}

.student-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #888;
  flex-wrap: wrap;
}

.approved-date,
.rejection-reason {
  font-style: italic;
  color: #666;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-message {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
}

@media (max-width: 768px) {
  .registration-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    margin-left: 0;
    margin-top: 1rem;
    width: 100%;
  }

  .btn {
    flex: 1;
  }
}
</style>
