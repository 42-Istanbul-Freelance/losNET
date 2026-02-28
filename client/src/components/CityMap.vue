<template>
  <div class="map-container" ref="mapRef"></div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cityCoordinates } from '../data/trCities'

export default {
  name: 'CityMap',
  props: {
    cityData: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const mapRef = ref(null)
    let map = null
    let markersLayer = null

    const initMap = () => {
      if (!mapRef.value || map) return
      map = L.map(mapRef.value).setView([39, 35], 6)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map)
      markersLayer = L.layerGroup().addTo(map)
    }

    const updateMarkers = () => {
      if (!markersLayer || !props.cityData?.length) return
      markersLayer.clearLayers()
      const maxHours = Math.max(...props.cityData.map(c => c.totalHours || 0), 1)
      props.cityData.forEach(city => {
        const name = city._id || ''
        const coords = cityCoordinates[name] || cityCoordinates[name.replace('İ', 'I')] || cityCoordinates[name.replace('I', 'İ')]
        if (!coords) return
        const radius = 5 + Math.sqrt((city.totalHours || 0) / maxHours) * 15
        const circle = L.circleMarker(coords, {
          radius,
          fillColor: '#b388ff',
          color: '#6b5b95',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.6
        })
        circle.bindPopup(`<strong>${city._id}</strong><br>Okul: ${city.schoolCount || 0}<br>Toplam saat: ${city.totalHours || 0}`)
        markersLayer.addLayer(circle)
      })
    }

    onMounted(() => {
      initMap()
      updateMarkers()
    })

    watch(() => props.cityData, () => updateMarkers(), { deep: true })

    return { mapRef }
  }
}
</script>

<style scoped>
.map-container {
  height: 400px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}
</style>
