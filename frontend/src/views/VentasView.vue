<template>
  <div class="page-container">
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h1 class="page-title" style="margin-bottom: 0;">Registro de Ventas</h1>
      <button class="btn-primary" @click="openModal()">+ Nueva Venta</button>
    </div>
    
    <div class="glass-panel" style="overflow-x: auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha y Hora</th>
            <th>Cliente</th>
            <th>Vendedor</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venta in ventas" :key="venta.id_venta">
            <td>{{ venta.id_venta }}</td>
            <td>{{ new Date(venta.fecha_hora).toLocaleString() }}</td>
            <td>{{ venta.nombre_cliente }}</td>
            <td>{{ venta.nombre_empleado }}</td>
            <td style="font-weight: 600; color: var(--success)">
              ${{ Number(venta.total).toFixed(2) }}
            </td>
          </tr>
          <tr v-if="ventas.length === 0">
            <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary)">
              No hay ventas registradas o cargando...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Formulario de Venta -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content glass-panel modal-lg">
        <h2 style="margin-bottom: 1.5rem;">Registrar Nueva Venta</h2>
        
        <form @submit.prevent="saveVenta" class="form-grid">
          
          <div class="form-row">
            <div class="form-group" style="flex: 1;">
              <label>Cliente</label>
              <select v-model="form.id_cliente" required class="form-control">
                <option value="" disabled>Seleccione un cliente...</option>
                <option v-for="cli in clientes" :key="cli.id_cliente" :value="cli.id_cliente">
                  {{ cli.nombre_completo }}
                </option>
              </select>
            </div>
            
            <div class="form-group" style="flex: 1;">
              <label>Vendedor (Empleado)</label>
              <select v-model="form.id_empleado" required class="form-control">
                <option value="" disabled>Seleccione un vendedor...</option>
                <option v-for="emp in empleados" :key="emp.id_empleado" :value="emp.id_empleado">
                  {{ emp.nombre_completo }} - {{ emp.puesto }}
                </option>
              </select>
            </div>
          </div>

          <!-- Carrito de Compras -->
          <div class="cart-section">
            <h3 style="margin-bottom: 1rem; color: var(--accent-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Productos de la Venta</h3>
            
            <div class="add-product-row" style="display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 1rem;">
              <div class="form-group" style="flex: 2;">
                <label>Producto</label>
                <select v-model="selectedProduct" class="form-control">
                  <option value="" disabled>Seleccione un producto para agregar...</option>
                  <option v-for="prod in productos" :key="prod.id_producto" :value="prod" :disabled="prod.stock <= 0">
                    {{ prod.nombre_producto }} - ${{ Number(prod.precio_actual).toFixed(2) }} (Stock: {{ prod.stock }})
                  </option>
                </select>
              </div>
              <div class="form-group" style="flex: 1;">
                <label>Cantidad</label>
                <input v-model.number="selectedQty" type="number" min="1" class="form-control" />
              </div>
              <button type="button" class="btn-primary" style="height: 45px;" @click="addToCart" :disabled="!selectedProduct || selectedQty < 1">
                Agregar
              </button>
            </div>

            <!-- Tabla del carrito -->
            <table class="data-table small-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio Unit.</th>
                  <th>Cant.</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.items" :key="index">
                  <td>{{ item.nombre }}</td>
                  <td>${{ item.precio.toFixed(2) }}</td>
                  <td>
                    <input type="number" v-model.number="item.cantidad" min="1" :max="item.maxStock" @change="updateCart" style="width: 60px; background: #f8f5f0; color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 4px; padding: 2px 5px;" />
                  </td>
                  <td>${{ (item.precio * item.cantidad).toFixed(2) }}</td>
                  <td>
                    <button type="button" class="btn-text text-danger" @click="removeFromCart(index)">Eliminar</button>
                  </td>
                </tr>
                <tr v-if="form.items.length === 0">
                  <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 1rem;">
                    Agregue productos a la venta
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="form.items.length > 0">
                <tr>
                  <td colspan="3" style="text-align: right; font-weight: bold;">TOTAL ESTIMADO:</td>
                  <td colspan="2" style="font-weight: bold; color: var(--success); font-size: 1.1rem;">
                    ${{ cartTotal.toFixed(2) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="form.items.length === 0 || isLoading">
              {{ isLoading ? 'Procesando...' : 'Completar Venta' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const ventas = ref([])
const clientes = ref([])
const empleados = ref([])
const productos = ref([])

const showModal = ref(false)
const isLoading = ref(false)

const form = ref({
  id_cliente: '',
  id_empleado: '',
  items: []
})

// Variables para agregar al carrito
const selectedProduct = ref('')
const selectedQty = ref(1)

const cartTotal = computed(() => {
  return form.value.items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
})

const fetchVentas = async () => {
  try {
    const res = await fetch('/api/ventas')
    if (res.ok) ventas.value = await res.json()
  } catch (error) {
    console.error('Error fetching sales:', error)
  }
}

const fetchDependencies = async () => {
  try {
    const [resCli, resEmp, resProd] = await Promise.all([
      fetch('/api/clientes'),
      fetch('/api/empleados'),
      fetch('/api/productos')
    ])
    if (resCli.ok) clientes.value = await resCli.json()
    if (resEmp.ok) empleados.value = await resEmp.json()
    if (resProd.ok) productos.value = await resProd.json()
  } catch (error) {
    console.error('Error fetching dependencies:', error)
  }
}

const openModal = () => {
  form.value = { id_cliente: '', id_empleado: '', items: [] }
  selectedProduct.value = ''
  selectedQty.value = 1
  fetchDependencies() // Refresh stock before selling
  showModal.value = true
}

const closeModal = () => {
  if (isLoading.value) return
  showModal.value = false
}

const addToCart = () => {
  if (!selectedProduct.value || selectedQty.value < 1) return
  
  // Check stock
  if (selectedQty.value > selectedProduct.value.stock) {
    alert(`Solo hay ${selectedProduct.value.stock} unidades disponibles de ${selectedProduct.value.nombre_producto}.`)
    return
  }

  // Check if already in cart
  const existingItemIndex = form.value.items.findIndex(i => i.id_producto === selectedProduct.value.id_producto)
  
  if (existingItemIndex >= 0) {
    const newQty = form.value.items[existingItemIndex].cantidad + selectedQty.value
    if (newQty > selectedProduct.value.stock) {
       alert(`El stock máximo para ${selectedProduct.value.nombre_producto} es ${selectedProduct.value.stock}.`)
       return
    }
    form.value.items[existingItemIndex].cantidad = newQty
  } else {
    form.value.items.push({
      id_producto: selectedProduct.value.id_producto,
      nombre: selectedProduct.value.nombre_producto,
      precio: Number(selectedProduct.value.precio_actual),
      cantidad: selectedQty.value,
      maxStock: selectedProduct.value.stock
    })
  }
  
  // Reset fields
  selectedProduct.value = ''
  selectedQty.value = 1
}

const removeFromCart = (index) => {
  form.value.items.splice(index, 1)
}

const updateCart = () => {
  // Validate limits when manual typing
  form.value.items.forEach(item => {
    if (item.cantidad > item.maxStock) item.cantidad = item.maxStock
    if (item.cantidad < 1) item.cantidad = 1
  })
}

const saveVenta = async () => {
  if (form.value.items.length === 0) {
    alert('Debe agregar al menos un producto a la venta.')
    return
  }
  
  isLoading.value = true
  
  try {
    const payload = {
      id_cliente: form.value.id_cliente,
      id_empleado: form.value.id_empleado,
      items: form.value.items.map(i => ({
        id_producto: i.id_producto,
        cantidad: i.cantidad
      }))
    }
    
    const res = await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (res.ok) {
      alert('Venta procesada con éxito')
      await fetchVentas()
      closeModal()
    } else {
      const err = await res.json()
      alert('Error al registrar la venta: ' + err.message)
    }
  } catch (error) {
    console.error('Error saving sale:', error)
    alert('Error de conexión o servidor')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchVentas()
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

.small-table th, .small-table td {
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
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
  overflow-y: auto;
  padding: 2rem 0;
}
.modal-content {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  animation: modal-in 0.3s ease-out;
}
.modal-lg {
  max-width: 900px;
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
.cart-section {
  background: rgb(255, 255, 255);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 0.5rem;
}
</style>
