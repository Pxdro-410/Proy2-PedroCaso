import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'

// Paleta de colores para las gráficas
const COLORS = ['#800000', '#b30000', '#cc4400', '#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777']

// Formateador largo de quetzales (tooltip y tablas)
const fmtQ = (v) => `Q${Number(v).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Formateador adaptativo para ejes que se ajusta a la magnitud real de los datos
const fmtAxis = (v) => {
  if (Math.abs(v) >= 1_000_000) return `Q${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `Q${(v / 1_000).toFixed(0)}k`
  if (Math.abs(v) >= 1) return `Q${v.toFixed(0)}`
  return `Q${v.toFixed(2)}`
}

// Calcula el ancho necesario para el Y Axis según el valor máximo
const yAxisWidth = (maxVal) => {
  const label = fmtAxis(maxVal)
  return Math.max(55, label.length * 8)
}

// Tooltip personalizado para barras
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
      boxShadow: 'var(--shadow-md)', minWidth: '180px'
    }}>
      <p style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '0.88rem' }}>
          {p.name}: <strong>{typeof p.value === 'number' && p.name.includes('Q') ? fmtQ(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

// Sección colapsable
function ReportSection({ id, title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card" style={{ marginBottom: '1.25rem', padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.1rem 1.5rem', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{title}</span>
          {badge && <span className="badge badge-neutral">{badge}</span>}
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>
      {open && (
        <div id={id} style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function ReportesView() {
  const { token } = useAuth()

  const [ventasCat, setVentasCat] = useState([])
  const [topClientes, setTopClientes] = useState([])
  const [stockBajo, setStockBajo] = useState({ promedio_stock: 0, productos: [] })
  const [clientesSin, setClientesSin] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const [vcRes, tcRes, sbRes, csRes] = await Promise.all([
          fetch('/api/reportes/ventas-por-categoria', { headers: authHeaders() }),
          fetch('/api/reportes/top-clientes', { headers: authHeaders() }),
          fetch('/api/reportes/stock-bajo', { headers: authHeaders() }),
          fetch('/api/reportes/clientes-sin-compra', { headers: authHeaders() }),
        ])
        setVentasCat(await vcRes.json())
        setTopClientes(await tcRes.json())
        setStockBajo(await sbRes.json())
        setClientesSin(await csRes.json())
      } catch {
        setAlert('Error al cargar los reportes. Revisa tu conexión.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [authHeaders])

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Reportes</h1>
        <div className="loading-state"><div className="spinner" /><span>Cargando reportes…</span></div>
      </div>
    )
  }

  // Datos procesados para la gráfica de pastel (top 5 categorías)
  const pieData = ventasCat.slice(0, 6).map((r, i) => ({
    name: r.categoria,
    value: Number(r.ingresos_totales),
    color: COLORS[i % COLORS.length],
  }))

  return (
    <div>
      <h1 className="page-title">Reportes</h1>
      <p className="page-subtitle">Análisis del negocio con datos reales de la base de datos.</p>

      {alert && (
        <div className="alert alert-error" role="alert">⚠️ {alert}</div>
      )}

      {/* KPIs rápidos */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="stat-card">
          <div className="stat-label">Categorías con ventas</div>
          <div className="stat-value">{ventasCat.length}</div>
          <div className="stat-icon">📂</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top clientes</div>
          <div className="stat-value">{topClientes.length}</div>
          <div className="stat-icon">🏆</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Productos stock bajo</div>
          <div className="stat-value" style={{ color: stockBajo.productos.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {stockBajo.productos.length}
          </div>
          <div className="stat-icon">⚠️</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Clientes sin compras</div>
          <div className="stat-value">{clientesSin.length}</div>
          <div className="stat-icon">👤</div>
        </div>
      </div>

      {/* Reporte 1: Ventas por categoría (barras + pastel) */}
      <ReportSection
        id="reporte-ventas-categoria"
        title="Ingresos por categoría"
        badge={`${ventasCat.length} categorías`}
        defaultOpen={true}
      >
        {ventasCat.length === 0 ? (
          <div className="empty-state"><span>📊</span><p>Sin datos de ventas aún.</p></div>
        ) : (
          <>
            {/* Gráfica de barras, ingresos */}
            <div style={{ marginTop: '1.25rem', marginBottom: '1.75rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Ingresos totales por categoría (Q)
              </p>
              {(() => {
                // Convertir a Number explícitamente 
                const datos = ventasCat.map(r => ({
                  ...r,
                  ingresos_totales: Number(r.ingresos_totales),
                }))
                const maxVal = Math.max(...datos.map(r => r.ingresos_totales), 1)
                // Redondear el techo
                const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)))
                const ceiling = Math.ceil(maxVal / magnitude) * magnitude
                const w = yAxisWidth(ceiling)
                return (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datos} margin={{ top: 5, right: 20, left: w - 40, bottom: 65 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="categoria"
                        tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        width={w}
                        tickFormatter={fmtAxis}
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                        domain={[0, ceiling]}
                        allowDataOverflow={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="ingresos_totales" name="Ingresos (Q)" radius={[4, 4, 0, 0]}>
                        {datos.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
              })()}

            </div>

            {/* Gráfica de pastel, distribución */}
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Distribución de ingresos (top 6)
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmtQ(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla detallada */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Ventas</th>
                    <th>Unidades</th>
                    <th>Precio prom.</th>
                    <th>Ingresos totales</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasCat.map((r, i) => (
                    <tr key={r.categoria}>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                          {r.categoria}
                        </span>
                      </td>
                      <td>{r.total_ventas}</td>
                      <td>{r.unidades_vendidas}</td>
                      <td>{fmtQ(r.precio_promedio)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmtQ(r.ingresos_totales)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ReportSection>

      {/* Reporte 2: Top clientes */}
      <ReportSection
        id="reporte-top-clientes"
        title="Top 10 clientes por compras"
        badge={`${topClientes.length} clientes`}
      >
        {topClientes.length === 0 ? (
          <div className="empty-state"><span>🏆</span><p>Sin datos de ventas aún.</p></div>
        ) : (
          <>
            {/* Barras horizontales */}
            <div style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Monto total comprado (Q)
              </p>
              {(() => {
                const maxVal = Math.max(...topClientes.map(c => Number(c.monto_total)), 1)
                return (
                  <ResponsiveContainer width="100%" height={Math.max(220, topClientes.length * 38)}>
                    <BarChart
                      data={topClientes}
                      layout="vertical"
                      margin={{ top: 0, right: 90, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={fmtAxis}
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                        domain={[0, maxVal * 1.1]}
                      />
                      <YAxis
                        type="category"
                        dataKey="nombre_completo"
                        width={140}
                        tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="monto_total" name="Total (Q)" radius={[0, 4, 4, 0]}>
                        {topClientes.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
              })()}
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Correo</th>
                    <th>Compras</th>
                    <th>Última compra</th>
                    <th>Monto total</th>
                  </tr>
                </thead>
                <tbody>
                  {topClientes.map(c => (
                    <tr key={c.nombre_completo}>
                      <td>
                        <span className={`badge ${Number(c.posicion) <= 3 ? 'badge-warning' : 'badge-neutral'}`}>
                          #{c.posicion}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.nombre_completo}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.correo}</td>
                      <td>{c.cantidad_compras}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(c.ultima_compra).toLocaleDateString('es-GT')}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmtQ(c.monto_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ReportSection>

      {/* Reporte 3: Stock bajo */}
      <ReportSection
        id="reporte-stock-bajo"
        title="Productos con stock bajo"
        badge={`Promedio: ${stockBajo.promedio_stock} unidades`}
      >
        {stockBajo.productos.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>✅</span>
            <p>Todos los productos tienen stock saludable.</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ marginTop: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock actual</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {stockBajo.productos.map(p => (
                  <tr key={p.id_producto}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{p.id_producto}</td>
                    <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                    <td><span className="badge badge-neutral">{p.categoria}</span></td>
                    <td>{fmtQ(p.precio_actual)}</td>
                    <td>
                      <span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {p.stock} uds.
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: p.stock === 0 ? 'var(--danger)' : 'var(--warning)' }}>
                      {p.stock === 0 ? '🔴 Sin stock' : '🟡 Stock bajo'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>

      {/* Reporte 4: Clientes sin compras */}
      <ReportSection
        id="reporte-clientes-sin-compra"
        title="Clientes sin compras registradas"
        badge={`${clientesSin.length} clientes`}
      >
        {clientesSin.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🎉</span>
            <p>¡Todos los clientes han realizado al menos una compra!</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ marginTop: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {clientesSin.map(c => (
                  <tr key={c.id_cliente}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{c.id_cliente}</td>
                    <td style={{ fontWeight: 600 }}>{c.nombre_completo}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.correo}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.telefono ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>
    </div>
  )
}
