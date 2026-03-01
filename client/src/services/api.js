import axios from 'axios'
import { auth } from './firebase'

const runtimeBaseUrl = `${window.location.protocol}//${window.location.hostname}:5000/api`
let isRedirectingToLogin = false

const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL || runtimeBaseUrl,
    timeout: 15000,
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
        const status = error?.response?.status
        const requestUrl = error?.config?.url || ''
        const path = window.location.pathname

        if (status === 401) {
            const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/forgot-password')
            const isPublicPage = path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password') || path.startsWith('/consent')

            // Sadece korumalı sayfalarda ve auth endpoint'leri dışında login'e yönlendir
            if (!isAuthRequest && !isPublicPage && !isRedirectingToLogin) {
                isRedirectingToLogin = true
                window.location.assign('/login')
            }
        }

        return Promise.reject(error)
    }
)

export default api
