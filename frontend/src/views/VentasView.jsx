import { useState, useEffect, useCallback, useReducer } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

// carrito de la nueva venta con useReducer
const cartInitial = []

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(i => i.id_producto === action.producto.id_producto)
      if (existing) {
        // Si ya está, incrementar cantidad (respeta el stock máx)
        return state.map(i =>
          i.id_producto === action.producto.id_producto
            ? { ...i, cantidad: Math.min(i.cantidad + 1, action.producto.stock) }
            : i
        )
      }
      return [...state, { ...action.producto, cantidad: 1 }]
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.id_producto !== action.id_producto)

    case 'UPDATE_QTY':
      return state.map(i =>
        i.id_producto === action.id_producto
          ? { ...i, cantidad: Math.max(1, Math.min(Number(action.cantidad), i.stock)) }
          : i
      )
    case 'CLEAR':
      return cartInitial

    default:
      return state
  }
}

// Modal de detalle de venta (solo lectura)
function DetalleModal({ venta, onClose, authHeaders }) {
  const [detalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/ventas/${venta.id_venta}`, { headers: authHeaders() })
        const data = await res.json()
        setDetalle(data)
      } catch {
        setDetalle(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [venta.id_venta, authHeaders])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Detalle — Venta #{venta.id_venta}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : !detalle ? (
            <p className="alert alert-error">No se pudo cargar el detalle.</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <p className="form-label">Cliente</p>
                  <p style={{ fontWeight: 600 }}>{detalle.nombre_cliente}</p>
                </div>
                <div>
                  <p className="form-label">Empleado</p>
                  <p style={{ fontWeight: 600 }}>{detalle.nombre_empleado}</p>
                </div>
                <div>
                  <p className="form-label">Fecha</p>
                  <p>{new Date(detalle.fecha_hora).toLocaleString('es-GT')}</p>
                </div>
                <div>
                  <p className="form-label">Total</p>
                  <p style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>
                    Q{Number(detalle.total).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio unitario</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.detalle?.map(d => (
                      <tr key={d.id_detalle}>
                        <td>{d.nombre_producto}</td>
                        <td>{d.cantidad}</td>
                        <td>Q{Number(d.precio_unitario_venta).toFixed(2)}</td>
                        <td style={{ fontWeight: 600 }}>Q{Number(d.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

// Modal nueva venta con useReducer carrito
function NuevaVentaModal({ clientes, empleados, productos, onSave, onClose }) {
  const [idCliente, setIdCliente] = useState('')
  const [idEmpleado, setIdEmpleado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // El carrito vive en useReducer
  const [cart, dispatch] = useReducer(cartReducer, cartInitial)

  const total = cart.reduce((sum, i) => sum + Number(i.precio_actual) * i.cantidad, 0)

  const productosFiltrados = productos.filter(p =>
    p.stock > 0 &&
    p.nombre_producto?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!idCliente) errs.idCliente = 'Selecciona un cliente'
    if (!idEmpleado) errs.idEmpleado = 'Selecciona un empleado'
    if (cart.length === 0) errs.cart = 'Agrega al menos un producto al carrito'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    await onSave({
      id_cliente: Number(idCliente),
      id_empleado: Number(idEmpleado),
      items: cart.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad })),
    })
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '760px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nueva Venta</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* columna izquierda: cliente, empleado, carrito */}
            <div>
              <div className="form-group">
                <label className="form-label" htmlFor="vta-cliente">Cliente *</label>
                <select
                  id="vta-cliente"
                  className={`form-control ${errors.idCliente ? 'error' : ''}`}
                  value={idCliente}
                  onChange={e => { setIdCliente(e.target.value); setErrors(er => ({ ...er, idCliente: undefined })) }}
                >
                  <option value="">— Selecciona —</option>
                  {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_completo}</option>)}
                </select>
                {errors.idCliente && <span className="form-error">{errors.idCliente}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="vta-empleado">Empleado *</label>
                <select
                  id="vta-empleado"
                  className={`form-control ${errors.idEmpleado ? 'error' : ''}`}
                  value={idEmpleado}
                  onChange={e => { setIdEmpleado(e.target.value); setErrors(er => ({ ...er, idEmpleado: undefined })) }}
                >
                  <option value="">— Selecciona —</option>
                  {empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombre_completo} ({e.puesto})</option>)}
                </select>
                {errors.idEmpleado && <span className="form-error">{errors.idEmpleado}</span>}
              </div>

              {/* Carrito */}
              <div style={{ marginTop: '0.5rem' }}>
                <p className="form-label" style={{ marginBottom: '0.5rem' }}>Carrito</p>
                {errors.cart && <span className="form-error" style={{ display: 'block', marginBottom: '0.5rem' }}>{errors.cart}</span>}

                {cart.length === 0 ? (
                  <div className="empty-state" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)' }}>
                    <span>🛒</span>
                    <p style={{ fontSize: '0.85rem' }}>Sin productos. Agrégalos desde la lista.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {cart.map(item => (
                      <div key={item.id_producto} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem'
                      }}>
                        <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.nombre_producto}
                        </span>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.cantidad}
                          onChange={e => dispatch({ type: 'UPDATE_QTY', id_producto: item.id_producto, cantidad: e.target.value })}
                          style={{ width: '60px', textAlign: 'center' }}
                          className="form-control"
                        />
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', minWidth: '70px', textAlign: 'right' }}>
                          Q{(Number(item.precio_actual) * item.cantidad).toFixed(2)}
                        </span>
                        <button type="button" className="btn btn-danger btn-icon btn-sm"
                          onClick={() => dispatch({ type: 'REMOVE_ITEM', id_producto: item.id_producto })}>
                          ✕
                        </button>
                      </div>
                    ))}

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.75rem', borderTop: '2px solid var(--border)', marginTop: '0.25rem'
                    }}>
                      <span style={{ fontWeight: 600 }}>Total:</span>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>
                        Q{total.toFixed(2)}
                      </span>
                    </div>

                    <button type="button" className="btn btn-secondary btn-sm"
                      onClick={() => dispatch({ type: 'CLEAR' })}>
                      Limpiar carrito
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* columna derecha para catalogo de productos */}
            <div>
              <p className="form-label" style={{ marginBottom: '0.5rem' }}>Catálogo</p>
              <input
                type="search"
                className="form-control"
                placeholder="Buscar producto…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ marginBottom: '0.75rem' }}
              />
              <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {productosFiltrados.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                    Sin productos con stock disponible.
                  </p>
                ) : (
                  productosFiltrados.map(p => (
                    <button
                      key={p.id_producto}
                      type="button"
                      onClick={() => { dispatch({ type: 'ADD_ITEM', producto: p }); setErrors(er => ({ ...er, cart: undefined })) }}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.5rem 0.75rem', background: 'var(--bg-input)',
                        border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer', transition: 'all var(--transition)', textAlign: 'left',
                        fontFamily: 'inherit'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.nombre_producto}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Stock: {p.stock}</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.85rem' }}>
                          Q{Number(p.precio_actual).toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
            <button id="btn-vta-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Registrando…' : `Registrar venta — Q${total.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Vista principal
export default function VentasView() {
  const { token } = useAuth()

  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [showNueva, setShowNueva] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [anulando, setAnulando] = useState(null)

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token])

  const showAlert = useCallback((type, msg) => {
    setAlert({ type, msg })
    setTimeout(() => setAlert(null), 5000)
  }, [])

  const fetchVentas = useCallback(async () => {
    const res = await fetch('/api/ventas', { headers: authHeaders() })
    if (!res.ok) throw new Error('Error al cargar ventas')
    return res.json()
  }, [authHeaders])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const [vRes, cRes, eRes, pRes] = await Promise.all([
          fetch('/api/ventas', { headers: authHeaders() }),
          fetch('/api/clientes', { headers: authHeaders() }),
          fetch('/api/empleados', { headers: authHeaders() }),
          fetch('/api/productos', { headers: authHeaders() }),
        ])
        setVentas(await vRes.json())
        setClientes(await cRes.json())
        setEmpleados(await eRes.json())
        setProductos(await pRes.json())
      } catch {
        showAlert('error', 'Error cargando datos. Revisa tu conexión.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [authHeaders, showAlert])

  const handleNuevaVenta = useCallback(async (payload) => {
    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al registrar venta')
      showAlert('success', `Venta #${data.id_venta} registrada correctamente`)
      setShowNueva(false)
      // Recargar ventas y productos (para actualizar stock)
      const [vRes, pRes] = await Promise.all([
        fetch('/api/ventas', { headers: authHeaders() }),
        fetch('/api/productos', { headers: authHeaders() }),
      ])
      setVentas(await vRes.json())
      setProductos(await pRes.json())
    } catch (err) {
      showAlert('error', err.message)
    }
  }, [authHeaders, showAlert])

  const handleAnular = useCallback(async (id) => {
    if (!window.confirm('¿Anular esta venta? El stock de productos será restaurado.')) return
    setAnulando(id)
    try {
      const res = await fetch(`/api/ventas/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'No se pudo anular')
      showAlert('success', 'Venta anulada y stock restaurado')
      setVentas(prev => prev.filter(v => v.id_venta !== id))
    } catch (err) {
      showAlert('error', err.message)
    } finally {
      setAnulando(null)
    }
  }, [authHeaders, showAlert])

  return (
    <div>
      <h1 className="page-title">Ventas</h1>
      <p className="page-subtitle">Registro de ventas — {ventas.length} venta(s)</p>

      {alert && (
        <div className={`alert alert-${alert.type}`} role="alert">
          {alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}
        </div>
      )}

      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <button id="btn-vta-nueva" className="btn btn-primary" onClick={() => setShowNueva(true)}>
          + Nueva venta
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-state"><div className="spinner" /><span>Cargando ventas…</span></div>
        ) : ventas.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '2.5rem' }}>🛒</span>
            <p>No hay ventas registradas.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Empleado</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map(v => (
                  <tr key={v.id_venta}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{v.id_venta}</td>
                    <td style={{ fontSize: '0.88rem' }}>
                      {new Date(v.fecha_hora).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{v.nombre_cliente}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{v.nombre_empleado}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                      Q{Number(v.total).toFixed(2)}
                    </td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDetalle(v)}
                        >
                          Ver
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={anulando === v.id_venta}
                          onClick={() => handleAnular(v.id_venta)}
                        >
                          {anulando === v.id_venta ? '…' : 'Anular'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal nueva venta */}
      {showNueva && (
        <NuevaVentaModal
          clientes={clientes}
          empleados={empleados}
          productos={productos}
          onSave={handleNuevaVenta}
          onClose={() => setShowNueva(false)}
        />
      )}

      {/* Modal detalle */}
      {detalle && (
        <DetalleModal
          venta={detalle}
          authHeaders={authHeaders}
          onClose={() => setDetalle(null)}
        />
      )}
    </div>
  )
}
