import axios from 'axios'
import { auth } from './firebase'

const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.request.use(async (config) => {
    try {
        if (auth?.currentUser?.getIdToken) {
            const token = await auth.currentUser.getIdToken()
            config.headers.Authorization = `Bearer ${token}`
        } else {
            const token = localStorage.getItem('demo_token')
            if (token) config.headers.Authorization = `Bearer ${token}`
        }
    } catch (error) {
        console.error('Token ayarlanamadı:', error)
    }
    return config
}, (error) => Promise.reject(error))

// Response interceptor: hata yönetimi
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // Oturum süresi dolmuş
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api
