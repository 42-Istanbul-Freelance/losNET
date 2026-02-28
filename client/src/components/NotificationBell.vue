<template>
  <div class="notification-bell" ref="bellRef">
    <button class="bell-btn" @click="toggleDropdown" :class="{ 'has-unread': unreadCount > 0 }">
      🔔
      <span v-if="unreadCount > 0" class="badge-count">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <div v-if="showDropdown" class="notification-dropdown">
      <div class="dropdown-header">
        <span class="dropdown-title">Bildirimler</span>
        <button v-if="unreadCount > 0" class="mark-all-btn" @click="markAllAsRead">Tümünü Okundu Yap</button>
      </div>

      <div v-if="loading" class="dropdown-loading">Yükleniyor...</div>
      <div v-else-if="notifications.length === 0" class="dropdown-empty">
        <span>🔕</span>
        <p>Bildirim bulunmuyor</p>
      </div>
      <div v-else class="notification-list">
        <div
          v-for="n in notifications"
          :key="n._id"
          class="notification-item"
          :class="{ unread: !n.read }"
          @click="markAsRead(n)"
        >
          <div class="notification-icon">{{ getIcon(n.type) }}</div>
          <div class="notification-content">
            <div class="notification-title">{{ n.title }}</div>
            <div class="notification-message">{{ n.message }}</div>
            <div class="notification-time">{{ timeAgo(n.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import api from '../services/api'

export default {
  name: 'NotificationBell',
  setup() {
    const showDropdown = ref(false)
    const notifications = ref([])
    const unreadCount = ref(0)
    const loading = ref(false)
    const bellRef = ref(null)
    let pollInterval = null

    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count')
        unreadCount.value = res.data.count
      } catch (err) { /* silent */ }
    }

    const fetchNotifications = async () => {
      loading.value = true
      try {
        const res = await api.get('/notifications', { params: { limit: 15 } })
        notifications.value = res.data.notifications
        unreadCount.value = res.data.unreadCount
      } catch (err) { console.error(err) }
      finally { loading.value = false }
    }

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value
      if (showDropdown.value) fetchNotifications()
    }

    const markAsRead = async (n) => {
      if (!n.read) {
        try {
          await api.put(`/notifications/${n._id}/read`)
          n.read = true
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        } catch (err) { /* silent */ }
      }
    }

    const markAllAsRead = async () => {
      try {
        await api.put('/notifications/read-all')
        notifications.value.forEach(n => { n.read = true })
        unreadCount.value = 0
      } catch (err) { console.error(err) }
    }

    const getIcon = (type) => {
      const icons = {
        activity_approved: '✅',
        activity_rejected: '❌',
        activity_revision: '✏️',
        badge_earned: '🏅',
        certificate_granted: '📜',
        streak_milestone: '🔥'
      }
      return icons[type] || '📢'
    }

    const timeAgo = (dateStr) => {
      const diff = Date.now() - new Date(dateStr).getTime()
      const minutes = Math.floor(diff / 60000)
      if (minutes < 1) return 'Az önce'
      if (minutes < 60) return `${minutes} dk önce`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours} saat önce`
      const days = Math.floor(hours / 24)
      if (days < 7) return `${days} gün önce`
      return new Date(dateStr).toLocaleDateString('tr-TR')
    }

    // Click outside to close
    const handleClickOutside = (e) => {
      if (bellRef.value && !bellRef.value.contains(e.target)) {
        showDropdown.value = false
      }
    }

    onMounted(() => {
      fetchUnreadCount()
      pollInterval = setInterval(fetchUnreadCount, 30000) // 30 sn'de bir kontrol
      document.addEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
      if (pollInterval) clearInterval(pollInterval)
      document.removeEventListener('click', handleClickOutside)
    })

    return { showDropdown, notifications, unreadCount, loading, bellRef, toggleDropdown, markAsRead, markAllAsRead, getIcon, timeAgo, fetchNotifications }
  }
}
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  position: relative;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.2s;
}

.bell-btn:hover {
  background: rgba(77, 182, 172, 0.1);
}

.bell-btn.has-unread {
  animation: bellShake 0.5s ease-in-out;
}

@keyframes bellShake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
}

.badge-count {
  position: absolute;
  top: 0;
  right: 0;
  background: #ff4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 340px;
  max-height: 420px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border, #e5e7eb);
}

.dropdown-title {
  font-weight: 600;
  font-size: 14px;
}

.mark-all-btn {
  background: none;
  border: none;
  color: var(--primary, #4db6ac);
  font-size: 12px;
  cursor: pointer;
  font-weight: 500;
}

.mark-all-btn:hover {
  text-decoration: underline;
}

.notification-list {
  overflow-y: auto;
  max-height: 360px;
}

.notification-item {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border, #f0f0f0);
}

.notification-item:hover {
  background: rgba(77, 182, 172, 0.05);
}

.notification-item.unread {
  background: rgba(77, 182, 172, 0.08);
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 2px;
}

.notification-message {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-size: 11px;
  color: var(--text-secondary, #9ca3af);
  margin-top: 4px;
}

.dropdown-loading, .dropdown-empty {
  padding: 32px;
  text-align: center;
  color: var(--text-secondary, #6b7280);
  font-size: 14px;
}

.dropdown-empty span {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}
</style>
