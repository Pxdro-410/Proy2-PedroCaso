<template>
  <div class="page-container">
    <div class="header-actions" style="margin-bottom: 2rem;">
      <h1 class="page-title" style="margin-bottom: 0;">Reportes Avanzados</h1>
      <p class="text-secondary" style="margin-top: 0.5rem;">
        Consultas complejas con agrupaciones, subconsultas y CTEs.
      </p>
    </div>
    
    <div class="glass-panel" style="padding: 1rem; margin-bottom: 2rem;">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="selectTab(tab.id)"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <div class="glass-panel p-6" style="overflow-x: auto; min-height: 300px;">
      
      <!-- Cargando -->
      <div v-if="isLoading" style="text-align: center; padding: 3rem 0; color: var(--text-secondary)">
        Cargando reporte...
      </div>

      <!-- Reporte 1: Ventas por Categoría -->
      <div v-else-if="activeTab === 'ventas_categoria'">
        <h3 style="margin-bottom: 1rem; color: var(--accent-primary)">Ingresos y ventas por categoría</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Ventas (Transacciones)</th>
              <th>Unidades Vendidas</th>
              <th>Ingresos Totales</th>
              <th>Precio Promedio</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reportData.ventas_categoria" :key="item.categoria">
              <td>{{ item.categoria }}</td>
              <td>{{ item.total_ventas }}</td>
              <td>{{ item.unidades_vendidas }}</td>
              <td style="color: var(--success); font-weight: bold;">${{ Number(item.ingresos_totales).toFixed(2) }}</td>
              <td>${{ Number(item.precio_promedio).toFixed(2) }}</td>
            </tr>
            <tr v-if="reportData.ventas_categoria.length === 0">
              <td colspan="5" style="text-align: center; padding: 1rem;">No hay datos para mostrar.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Reporte 2: Stock Bajo -->
      <div v-else-if="activeTab === 'stock_bajo'">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="color: var(--accent-primary)">Productos con stock por debajo del promedio</h3>
          <span class="badge-warning" v-if="reportData.stock_bajo_promedio">
            Promedio global: {{ reportData.stock_bajo_promedio }}
          </span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock Actual</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reportData.stock_bajo" :key="item.id_producto">
              <td>{{ item.id_producto }}</td>
              <td>{{ item.nombre }}</td>
              <td>{{ item.categoria }}</td>
              <td>${{ Number(item.precio_actual).toFixed(2) }}</td>
              <td style="color: var(--danger); font-weight: bold;">{{ item.stock }}</td>
            </tr>
            <tr v-if="reportData.stock_bajo.length === 0">
              <td colspan="5" style="text-align: center; padding: 1rem;">Todos los productos están sobre el promedio.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Reporte 3: Top Clientes -->
      <div v-else-if="activeTab === 'top_clientes'">
        <h3 style="margin-bottom: 1rem; color: var(--accent-primary)">Ranking de Mejores Clientes</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Cliente</th>
              <th>Correo</th>
              <th>Cant. Compras</th>
              <th>Última Compra</th>
              <th>Monto Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reportData.top_clientes" :key="item.posicion">
              <td><span class="rank-badge">{{ item.posicion }}</span></td>
              <td>{{ item.nombre_completo }}</td>
              <td>{{ item.correo }}</td>
              <td>{{ item.cantidad_compras }}</td>
              <td>{{ new Date(item.ultima_compra).toLocaleDateString() }}</td>
              <td style="color: var(--success); font-weight: bold;">${{ Number(item.monto_total).toFixed(2) }}</td>
            </tr>
            <tr v-if="reportData.top_clientes.length === 0">
              <td colspan="6" style="text-align: center; padding: 1rem;">No hay clientes con compras.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Reporte 4: Clientes sin compras -->
      <div v-else-if="activeTab === 'clientes_sin_compra'">
        <h3 style="margin-bottom: 1rem; color: var(--accent-primary)">Clientes que nunca han comprado</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Correo Electrónico</th>
              <th>Teléfono</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reportData.clientes_sin_compra" :key="item.id_cliente">
              <td>{{ item.id_cliente }}</td>
              <td>{{ item.nombre_completo }}</td>
              <td>{{ item.correo }}</td>
              <td>{{ item.telefono || 'N/A' }}</td>
            </tr>
            <tr v-if="reportData.clientes_sin_compra.length === 0">
              <td colspan="4" style="text-align: center; padding: 1rem;">Todos los clientes han comprado al menos una vez.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const tabs = [
  { id: 'ventas_categoria', name: 'Ventas por Categoría' },
  { id: 'stock_bajo', name: 'Stock Bajo Promedio' },
  { id: 'top_clientes', name: 'Ranking Clientes' },
  { id: 'clientes_sin_compra', name: 'Clientes Sin Compras' }
]

const activeTab = ref('ventas_categoria')
const isLoading = ref(false)

const reportData = ref({
  ventas_categoria: [],
  stock_bajo: [],
  stock_bajo_promedio: null,
  top_clientes: [],
  clientes_sin_compra: []
})

const fetchReport = async (tabId) => {
  isLoading.value = true
  try {
    if (tabId === 'ventas_categoria') {
      const res = await fetch('/api/reportes/ventas-por-categoria')
      reportData.value.ventas_categoria = await res.json()
    } 
    else if (tabId === 'stock_bajo') {
      const res = await fetch('/api/reportes/stock-bajo')
      const data = await res.json()
      reportData.value.stock_bajo = data.productos || []
      reportData.value.stock_bajo_promedio = data.promedio_stock
    }
    else if (tabId === 'top_clientes') {
      const res = await fetch('/api/reportes/top-clientes')
      reportData.value.top_clientes = await res.json()
    }
    else if (tabId === 'clientes_sin_compra') {
      const res = await fetch('/api/reportes/clientes-sin-compra')
      reportData.value.clientes_sin_compra = await res.json()
    }
  } catch (err) {
    console.error('Error fetching report:', err)
  } finally {
    isLoading.value = false
  }
}

const selectTab = (tabId) => {
  activeTab.value = tabId
  fetchReport(tabId)
}

onMounted(() => {
  fetchReport(activeTab.value)
})
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
.tab-btn {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}
.tab-btn.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
  box-shadow: 0 4px 12px var(--accent-glow);
}

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

.badge-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #a47e00;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.rank-badge {
  background: linear-gradient(135deg, #fbbf24, #d97706);
  color: #fff;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}
</style>
