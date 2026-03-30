import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Auth Views
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import ForgotPasswordView from '../views/auth/ForgotPasswordView.vue'
import ConsentView from '../views/ConsentView.vue'
import AboutView from '../views/AboutView.vue'
import NotFoundView from '../views/NotFoundView.vue'

// Lazy load diğer view'lar
const StudentDashboard = () => import('../views/student/StudentDashboard.vue')
const ActivityList = () => import('../views/student/ActivityList.vue')
const StudentProfile = () => import('../views/student/StudentProfile.vue')
const CertificateView = () => import('../views/student/CertificateView.vue')

const TeacherDashboard = () => import('../views/teacher/TeacherDashboard.vue')
const TeacherActivityForm = () => import('../views/teacher/TeacherActivityForm.vue')
const PendingActivities = () => import('../views/teacher/PendingActivities.vue')
const StudentRegistrations = () => import('../views/teacher/StudentRegistrations.vue')
const SchoolReport = () => import('../views/teacher/SchoolReport.vue')

const AdminDashboard = () => import('../views/admin/AdminDashboard.vue')
const AdminActivityForm = () => import('../views/admin/AdminActivityForm.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { guest: true, authLayout: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { guest: true, authLayout: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { guest: true, authLayout: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView,
    meta: { guest: true, authLayout: true }
  },
  {
    path: '/consent/:token',
    name: 'Consent',
    component: ConsentView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  },
  // Öğrenci rotaları
  {
    path: '/student/dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/activities',
    name: 'ActivityList',
    component: ActivityList,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/profile',
    name: 'StudentProfile',
    component: StudentProfile,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/certificates',
    name: 'CertificateView',
    component: CertificateView,
    meta: { requiresAuth: true, role: 'student' }
  },
  // Öğretmen rotaları
  {
    path: '/teacher/dashboard',
    name: 'TeacherDashboard',
    component: TeacherDashboard,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/activities/new',
    name: 'TeacherActivityForm',
    component: TeacherActivityForm,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/activities/:id/edit',
    name: 'TeacherActivityEdit',
    component: TeacherActivityForm,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/pending',
    name: 'PendingActivities',
    component: PendingActivities,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/registrations',
    name: 'StudentRegistrations',
    component: StudentRegistrations,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/school-report',
    name: 'SchoolReport',
    component: SchoolReport,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  // Admin rotaları
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/activities/new',
    name: 'AdminActivityForm',
    component: AdminActivityForm,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/activities/:id/edit',
    name: 'AdminActivityEdit',
    component: AdminActivityForm,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Auth state yüklenmesini bekle
  if (authStore.loading) {
    await authStore.initAuth()
  }

  // Auth var ama profil/rol henüz yüklenmemişse önce tamamla.
  // Aksi halde guest/role redirect'leri /login üzerinde sonsuz döngüye girebiliyor.
  if (authStore.isAuthenticated && !authStore.role) {
    try {
      await authStore.fetchProfile()
    } catch {
      await authStore.logout()
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guest && authStore.isAuthenticated) {
    // Giriş yapmış kullanıcıyı rolüne göre yönlendir
    const dashboardMap = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard'
    }
    next(dashboardMap[authStore.role] || '/login')
  } else if (to.meta.role && authStore.role !== to.meta.role) {
    // Yanlış role sahip kullanıcıyı kendi dashboard'una yönlendir
    const dashboardMap = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard'
    }
    next(dashboardMap[authStore.role] || '/login')
  } else if (authStore.isAuthenticated && authStore.role === 'student' && authStore.registrationStatus !== 'approved') {
    // Onaylanmamış öğrenciler sadece dashboard ve profile sayfalarına erişebilir
    const approvedPages = [
      'StudentDashboard',
      'StudentProfile',
      'CertificateView',
      'ActivityList',
      'Home',
      'Consent'
    ]
    if (!approvedPages.includes(to.name)) {
      next('/student/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
