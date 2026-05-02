<template>
  <div class="page-container">
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h1 class="page-title" style="margin-bottom: 0;">Gestión de Clientes</h1>
      <button class="btn-primary" @click="openModal()">+ Nuevo Cliente</button>
    </div>
    
    <div class="glass-panel" style="overflow-x: auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Completo</th>
            <th>Correo Electrónico</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientes" :key="cliente.id_cliente">
            <td>{{ cliente.id_cliente }}</td>
            <td>{{ cliente.nombre_completo }}</td>
            <td>{{ cliente.correo }}</td>
            <td>{{ cliente.telefono || 'N/A' }}</td>
            <td>
              <button class="btn-text" title="Editar" @click="editCliente(cliente.id_cliente)">Editar</button>
              <button class="btn-text text-danger" title="Eliminar" @click="deleteCliente(cliente.id_cliente)">Eliminar</button>
            </td>
          </tr>
          <tr v-if="clientes.length === 0">
            <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary)">
              No hay clientes registrados o cargando...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Formulario -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content glass-panel">
        <h2 style="margin-bottom: 1.5rem;">{{ isEditing ? 'Editar' : 'Nuevo' }} Cliente</h2>
        
        <form @submit.prevent="saveCliente" class="form-grid">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input v-model="form.nombre_completo" type="text" required class="form-control" placeholder="Ej: Juan Pérez" />
          </div>
          
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input v-model="form.correo" type="email" required class="form-control" placeholder="Ej: juan@ejemplo.com" />
          </div>
          
          <div class="form-group">
            <label>Teléfono (Opcional)</label>
            <input v-model="form.telefono" type="text" class="form-control" placeholder="Ej: +123456789" />
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const clientes = ref([])

const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref(null)

const form = ref({
  nombre_completo: '',
  correo: '',
  telefono: ''
})

const fetchClientes = async () => {
  try {
    const res = await fetch('/api/clientes')
    if (res.ok) {
      clientes.value = await res.json()
    }
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

const openModal = () => {
  isEditing.value = false
  currentId.value = null
  form.value = { nombre_completo: '', correo: '', telefono: '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const editCliente = async (id) => {
  try {
    const res = await fetch(`/api/clientes/${id}`)
    if (res.ok) {
      const data = await res.json()
      isEditing.value = true
      currentId.value = data.id_cliente
      form.value = {
        nombre_completo: data.nombre_completo,
        correo: data.correo,
        telefono: data.telefono || ''
      }
      showModal.value = true
    } else {
      const err = await res.json()
      alert('Error: ' + err.message)
    }
  } catch (error) {
    console.error('Error fetching client details:', error)
  }
}

const saveCliente = async () => {
  try {
    const url = isEditing.value ? `/api/clientes/${currentId.value}` : '/api/clientes'
    const method = isEditing.value ? 'PUT' : 'POST'
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    
    if (res.ok) {
      await fetchClientes()
      closeModal()
    } else {
      const err = await res.json()
      alert('Error: ' + err.message)
    }
  } catch (error) {
    console.error('Error saving client:', error)
  }
}

const deleteCliente = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este cliente?')) return
  try {
    const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      await fetchClientes()
    } else {
      const err = await res.json()
      alert('Error: ' + err.message)
    }
  } catch (error) {
    console.error('Error deleting client:', error)
  }
}

onMounted(() => {
  fetchClientes()
})
</script>

<style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}
.data-table th {
  font-weight: 600;
  color: var(--text-secondary);
  background: rgba(0,0,0,0.2);
}
.data-table tbody tr:hover {
  background: rgba(255,255,255,0.05);
}
.btn-text {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-primary);
  margin-right: 0.75rem;
  opacity: 0.8;
  transition: all 0.2s;
}
.btn-text:hover {
  opacity: 1;
  text-decoration: underline;
}
.btn-text.text-danger {
  color: var(--danger);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  animation: modal-in 0.3s ease-out;
}
@keyframes modal-in {
  from { opacity: 0; transform: translateY(-20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
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
  background: #f8f5f0;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.75rem;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
}
.form-control:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-glow);
  background: #fff;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
.btn-secondary {
  background: #f0ebe3;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-secondary:hover {
  background: #e0d8cd;
}

</style>
