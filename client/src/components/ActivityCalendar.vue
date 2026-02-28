<template>
  <div class="activity-calendar">
    <div class="calendar-header">
      <button class="cal-nav" @click="changeYear(-1)">←</button>
      <span class="cal-year">{{ year }}</span>
      <button class="cal-nav" @click="changeYear(1)">→</button>
    </div>
    <div class="months-grid">
      <div v-for="(month, mi) in months" :key="mi" class="month-block">
        <div class="month-label">{{ month }}</div>
        <div class="days-grid">
          <div
            v-for="day in getDaysInMonth(mi)"
            :key="day"
            class="day-cell"
            :class="getCellClass(mi, day)"
            :title="getCellTitle(mi, day)"
          ></div>
        </div>
      </div>
    </div>
    <div class="calendar-legend">
      <span>Az</span>
      <div class="legend-cell level-0"></div>
      <div class="legend-cell level-1"></div>
      <div class="legend-cell level-2"></div>
      <div class="legend-cell level-3"></div>
      <span>Çok</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import api from '../services/api'

export default {
  name: 'ActivityCalendar',
  setup() {
    const year = ref(new Date().getFullYear())
    const calendarData = ref({})
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

    const fetchCalendar = async () => {
      try {
        const res = await api.get('/reports/calendar', { params: { year: year.value } })
        const map = {}
        ;(res.data.calendar || []).forEach(d => {
          const key = `${d._id.month}-${d._id.day}`
          map[key] = { hours: d.hours, count: d.count }
        })
        calendarData.value = map
      } catch (err) { console.error(err) }
    }

    const getDaysInMonth = (monthIndex) => {
      return new Date(year.value, monthIndex + 1, 0).getDate()
    }

    const getCellClass = (month, day) => {
      const key = `${month + 1}-${day}`
      const data = calendarData.value[key]
      if (!data) return 'level-0'
      if (data.hours >= 4) return 'level-3'
      if (data.hours >= 2) return 'level-2'
      return 'level-1'
    }

    const getCellTitle = (month, day) => {
      const key = `${month + 1}-${day}`
      const data = calendarData.value[key]
      const dateStr = `${day} ${months[month]} ${year.value}`
      if (!data) return `${dateStr}: Faaliyet yok`
      return `${dateStr}: ${data.hours} saat, ${data.count} faaliyet`
    }

    const changeYear = (dir) => {
      year.value += dir
    }

    watch(year, fetchCalendar)
    onMounted(fetchCalendar)

    return { year, months, calendarData, getDaysInMonth, getCellClass, getCellTitle, changeYear }
  }
}
</script>

<style scoped>
.activity-calendar {
  padding: 4px 0;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.cal-nav {
  background: none;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
}

.cal-nav:hover {
  background: var(--primary-light, rgba(77,182,172,0.1));
}

.cal-year {
  font-weight: 700;
  font-size: 16px;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.month-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.month-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
  text-align: center;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-cell {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 2px;
  min-width: 6px;
  min-height: 6px;
}

.level-0 { background: var(--border, #e5e7eb); opacity: 0.4; }
.level-1 { background: #80cbc4; }
.level-2 { background: #4db6ac; }
.level-3 { background: #00897b; }

.calendar-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-secondary, #6b7280);
}

.legend-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .months-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}
</style>
