import { defineStore } from 'pinia'
import api from '../services/api'
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from '../services/firebase'

const useFirebase = !!process.env.VUE_APP_FIREBASE_API_KEY

export const useAuthStore = defineStore('auth', {
    state: () => ({
        firebaseUser: null,
        user: null,
        role: null,
        isAuthenticated: false,
        loading: true,
        error: null
    }),

    getters: {
        isStudent: (state) => state.role === 'student',
        isTeacher: (state) => state.role === 'teacher',
        isAdmin: (state) => state.role === 'admin',
        userName: (state) => state.user?.name || '',
        userSchool: (state) => state.user?.school?.name || ''
    },

    actions: {
        initAuth() {
            return new Promise((resolve) => {
                if (useFirebase && auth?.onAuthStateChanged) {
                    onAuthStateChanged(auth, async (fbUser) => {
                        if (fbUser) {
                            this.firebaseUser = { uid: fbUser.uid, email: fbUser.email }
                            this.isAuthenticated = true
                            try {
                                await this.fetchProfile()
                            } catch (err) {
                                this.logout()
                                console.warn('Profil alınamadı:', err)
                            }
                        } else {
                            const token = localStorage.getItem('demo_token')
                            if (token) {
                                this.firebaseUser = { uid: token, email: `${token}@demo.local` }
                                this.isAuthenticated = true
                                try {
                                    await this.fetchProfile()
                                } catch (err) {
                                    this.logout()
                                }
                            }
                        }
                        this.loading = false
                        resolve()
                    })
                } else {
                    const token = localStorage.getItem('demo_token')
                    if (token) {
                        this.firebaseUser = { uid: token, email: `${token}@demo.local` }
                        this.isAuthenticated = true
                        this.fetchProfile().catch(() => this.logout())
                    }
                    this.loading = false
                    resolve()
                }
            })
        },

        async login(email, password) {
            this.error = null
            try {
                if (useFirebase && signInWithEmailAndPassword && auth) {
                    const cred = await signInWithEmailAndPassword(auth, email, password)
                    this.firebaseUser = { uid: cred.user.uid, email: cred.user.email }
                    this.isAuthenticated = true
                    await this.fetchProfile()
                    return { user: this.firebaseUser }
                }
                const token = email.split('@')[0]
                localStorage.setItem('demo_token', token)
                this.firebaseUser = { uid: token, email }
                this.isAuthenticated = true
                await this.fetchProfile()
                return { user: this.firebaseUser }
            } catch (error) {
                this.error = this.getErrorMessage(error?.code || 'auth/invalid-credential')
                throw error
            }
        },

        async register(email, password, userData) {
            this.error = null
            try {
                if (useFirebase && createUserWithEmailAndPassword && auth) {
                    const cred = await createUserWithEmailAndPassword(auth, email, password)
                    this.firebaseUser = { uid: cred.user.uid, email: cred.user.email }
                    this.isAuthenticated = true
                    const response = await api.post('/auth/register', { ...userData, email })
                    this.user = response.data
                    this.role = response.data.role
                    return { user: this.firebaseUser }
                }
                const token = email.split('@')[0]
                localStorage.setItem('demo_token', token)
                this.firebaseUser = { uid: token, email }
                this.isAuthenticated = true
                const response = await api.post('/auth/register', { ...userData, email })
                this.user = response.data
                this.role = response.data.role
                return { user: this.firebaseUser }
            } catch (error) {
                this.error = this.getErrorMessage(error?.code || 'auth/invalid-email')
                throw error
            }
        },

        async sendPasswordReset(email) {
            this.error = null
            try {
                if (useFirebase && sendPasswordResetEmail && auth) {
                    await sendPasswordResetEmail(auth, email)
                    return { success: true }
                }
                return { demoMode: true }
            } catch (error) {
                this.error = this.getErrorMessage(error?.code || 'auth/unknown')
                throw error
            }
        },

        async logout() {
            try {
                if (useFirebase && auth?.signOut) {
                    await auth.signOut()
                }
                localStorage.removeItem('demo_token')
                this.firebaseUser = null
                this.user = null
                this.role = null
                this.isAuthenticated = false
            } catch (error) {
                console.error('Çıkış hatası:', error)
            }
        },

        // Backend'den profil bilgilerini al
        async fetchProfile() {
            try {
                const response = await api.get('/auth/me');
                this.user = response.data;
                this.role = response.data.role;
                return response.data;
            } catch (error) {
                if (error.response?.data?.needsRegistration) {
                    this.user = null;
                    this.role = null;
                }
                throw error;
            }
        },

        // Profil güncelle
        async updateProfile(data) {
            const response = await api.put('/auth/profile', data);
            this.user = response.data;
            return response.data;
        },

        // Hata mesajlarını Türkçeleştir
        getErrorMessage(code) {
            const messages = {
                'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanılıyor',
                'auth/invalid-email': 'Geçersiz e-posta adresi',
                'auth/operation-not-allowed': 'Bu işlem şu anda kullanılamıyor',
                'auth/weak-password': 'Şifre en az 6 karakter olmalıdır',
                'auth/user-disabled': 'Bu hesap devre dışı bırakılmış',
                'auth/user-not-found': 'Kullanıcı bulunamadı',
                'auth/wrong-password': 'Hatalı şifre',
                'auth/invalid-credential': 'Geçersiz giriş bilgileri'
            }
            return messages[code] || 'Bir hata oluştu'
        }
    }
})
