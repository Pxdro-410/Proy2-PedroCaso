<template>
  <div class="page-container">
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h1 class="page-title" style="margin-bottom: 0;">Gestión de Productos</h1>
      <button class="btn-primary" @click="openModal()">+ Nuevo Producto</button>
    </div>
    
    <div class="glass-panel" style="overflow-x: auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Proveedor</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in productos" :key="prod.id_producto">
            <td>{{ prod.id_producto }}</td>
            <td>{{ prod.nombre_producto }}</td>
            <td>${{ Number(prod.precio_actual).toFixed(2) }}</td>
            <td>
              <span :class="{'badge-danger': prod.stock < 10, 'badge-success': prod.stock >= 10}">
                {{ prod.stock }}
              </span>
            </td>
            <td>{{ prod.nombre_categoria }}</td>
            <td>{{ prod.nombre_proveedor }}</td>
            <td>
              <button class="btn-text" title="Editar" @click="editProduct(prod.id_producto)">Editar</button>
              <button class="btn-text text-danger" title="Eliminar" @click="deleteProduct(prod.id_producto)">Eliminar</button>
            </td>
          </tr>
          <tr v-if="productos.length === 0">
            <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary)">
              No hay productos registrados o cargando...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Formulario -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content glass-panel">
        <h2 style="margin-bottom: 1.5rem;">{{ isEditing ? 'Editar' : 'Nuevo' }} Producto</h2>
        
        <form @submit.prevent="saveProduct" class="form-grid">
          <div class="form-group">
            <label>Nombre del Producto</label>
            <input v-model="form.nombre" type="text" required class="form-control" placeholder="Ej: Laptop Dell XPS 15" />
          </div>
          
          <div class="form-row">
            <div class="form-group" style="flex: 1;">
              <label>Precio Actual ($)</label>
              <input v-model.number="form.precio_actual" type="number" step="0.01" min="0" required class="form-control" />
            </div>
            
            <div class="form-group" style="flex: 1;">
              <label>Stock Disponible</label>
              <input v-model.number="form.stock" type="number" min="0" required class="form-control" />
            </div>
          </div>
          
          <div class="form-group">
            <label>Categoría</label>
            <select v-model="form.id_categoria" required class="form-control">
              <option value="" disabled>Seleccione una categoría...</option>
              <option v-for="cat in categorias" :key="cat.id_categoria" :value="cat.id_categoria">
                {{ cat.nombre }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Proveedor</label>
            <select v-model="form.id_proveedor" required class="form-control">
              <option value="" disabled>Seleccione un proveedor...</option>
              <option v-for="prov in proveedores" :key="prov.id_proveedor" :value="prov.id_proveedor">
                {{ prov.nombre_empresa }}
              </option>
            </select>
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

const productos = ref([])
const categorias = ref([])
const proveedores = ref([])

const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref(null)

const form = ref({
  nombre: '',
  precio_actual: 0,
  stock: 0,
  id_categoria: '',
  id_proveedor: ''
})

const fetchProductos = async () => {
  try {
    const res = await fetch('/api/productos')
    if (res.ok) {
      productos.value = await res.json()
    }
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

const fetchCategorias = async () => {
  try {
    const res = await fetch('/api/categorias')
    if (res.ok) {
      categorias.value = await res.json()
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const fetchProveedores = async () => {
  try {
    const res = await fetch('/api/proveedores')
    if (res.ok) {
      proveedores.value = await res.json()
    }
  } catch (error) {
    console.error('Error fetching suppliers:', error)
  }
}

const openModal = () => {
  isEditing.value = false
  currentId.value = null
  form.value = { nombre: '', precio_actual: 0, stock: 0, id_categoria: '', id_proveedor: '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const editProduct = async (id) => {
  try {
    const res = await fetch(`/api/productos/${id}`)
    if (res.ok) {
      const data = await res.json()
      isEditing.value = true
      currentId.value = data.id_producto
      form.value = {
        nombre: data.nombre,
        precio_actual: data.precio_actual,
        stock: data.stock,
        id_categoria: data.id_categoria,
        id_proveedor: data.id_proveedor
      }
      showModal.value = true
    } else {
      const err = await res.json()
      alert('Error: ' + err.message)
    }
  } catch (error) {
    console.error('Error fetching product details:', error)
  }
}

const saveProduct = async () => {
  try {
    const url = isEditing.value ? `/api/productos/${currentId.value}` : '/api/productos'
    const method = isEditing.value ? 'PUT' : 'POST'
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    
    if (res.ok) {
      await fetchProductos()
      closeModal()
    } else {
      const err = await res.json()
      alert('Error: ' + err.message)
    }
  } catch (error) {
    console.error('Error saving product:', error)
  }
}

const deleteProduct = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este producto?')) return
  try {
    const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      await fetchProductos()
    } else {
      const err = await res.json()
      alert('Error: ' + err.message)
    }
  } catch (error) {
    console.error('Error deleting product:', error)
  }
}

onMounted(() => {
  fetchProductos()
  fetchCategorias()
  fetchProveedores()
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

.badge-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #3b0101;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}
.badge-success {
  background: rgba(16, 185, 129, 0.2);
  color: #004e2f;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
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
  max-width: 650px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
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
.form-row {
  display: flex;
  gap: 1rem;
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
.form-control option {
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
