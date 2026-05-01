import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/productos',
    name: 'Productos',
    component: () => import('../views/ProductosView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('../views/ClientesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ventas',
    name: 'Ventas',
    component: () => import('../views/VentasView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('../views/ReportesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { layout: 'blank' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// se encarga de redirigir al usuario si no esta autenticado
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router