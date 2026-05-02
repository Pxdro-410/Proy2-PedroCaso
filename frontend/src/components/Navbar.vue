<template>
  <nav class="navbar">
    <div class="nav-brand">
      <span class="brand-text">Gestion Tienda</span>
    </div>
    <div class="nav-links">
      <RouterLink to="/" class="nav-link" active-class="active">Dashboard</RouterLink>
      <RouterLink to="/productos" class="nav-link" active-class="active">Productos</RouterLink>
      <RouterLink to="/clientes" class="nav-link" active-class="active">Clientes</RouterLink>
      <RouterLink to="/ventas" class="nav-link" active-class="active">Ventas</RouterLink>
      <RouterLink to="/reportes" class="nav-link" active-class="active">Reportes</RouterLink>
    </div>
    <div class="nav-actions">
      <div v-if="authStore.user" class="user-info">
        <span class="user-name">{{ authStore.user.nombre }}</span>
        <button @click="handleLogout" class="btn-logout" title="Cerrar sesión">Salir</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  margin: 1rem;
  border-radius: 100px;
  position: sticky;
  top: 1rem;
  z-index: 100;
  background-color: #800000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.nav-brand {
  display: flex;
  align-items: center;
}
.brand-text {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.025em;
  color: #ffffff;
}
.nav-links {
  display: flex;
  gap: 0.5rem;
}
.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}
.nav-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
}
.nav-link.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.25);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
}
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #ffffff;
}
.btn-logout {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-logout:hover {
  background: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}
</style>
