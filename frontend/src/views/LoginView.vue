<template>
  <div class="login-container">
    <div class="glass-panel login-box">
      <div class="login-header">
        <div class="logo-icon-large"></div>
        <h2>StoreAdmin</h2>
        <p class="text-secondary">Inicia sesión en tu cuenta</p>
      </div>

      <form @submit.prevent="handleLogin" class="form-grid">
        <div class="form-group">
          <label>Usuario</label>
          <input v-model="username" type="text" required class="form-control" placeholder="Ej: admin" />
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="password" type="password" required class="form-control" placeholder="••••••••" />
        </div>

        <div v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </div>

        <button type="submit" class="btn-primary" style="margin-top: 1rem; width: 100%;" :disabled="isLoading">
          {{ isLoading ? 'Autenticando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const username = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  errorMsg.value = ''
  isLoading.value = true

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })

    const data = await res.json()

    if (res.ok) {
      authStore.setSession(data.token, data.user)
      router.push('/')
    } else {
      errorMsg.value = data.message || 'Credenciales inválidas'
    }
  } catch (error) {
    console.error('Error in login:', error)
    errorMsg.value = 'Error conectando con el servidor'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon-large {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  box-shadow: 0 4px 12px var(--accent-glow);
}

.login-header h2 {
  font-weight: 700;
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-control {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.75rem;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-glow);
  background: rgba(30, 41, 59, 0.8);
}

.error-msg {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
</style>