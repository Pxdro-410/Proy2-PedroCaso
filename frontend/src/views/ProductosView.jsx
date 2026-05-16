import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

// helpers 
const EMPTY_FORM = {
  nombre: '',
  precio_actual: '',
  stock: '',
  id_categoria: '',
  id_proveedor: '',
}

function validate(form) {
  const errors = {}
  if (!form.nombre.trim()) errors.nombre = 'El nombre es requerido'
  if (form.precio_actual === '') errors.precio_actual = 'El precio es requerido'
  else if (Number(form.precio_actual) < 0) errors.precio_actual = 'El precio no puede ser negativo'
  if (form.stock === '') errors.stock = 'El stock es requerido'
  else if (Number(form.stock) < 0) errors.stock = 'El stock no puede ser negativo'
  if (!form.id_categoria) errors.id_categoria = 'Selecciona una categoría'
  if (!form.id_proveedor) errors.id_proveedor = 'Selecciona un proveedor'
  return errors
}

// componente modal de formulario 
function ProductoModal({ item, categorias, proveedores, onSave, onClose }) {
  const isEdit = Boolean(item?.id_producto)
  const [form, setForm] = useState(
    isEdit
      ? {
        nombre: item.nombre ?? '',
        precio_actual: String(item.precio_actual),
        stock: String(item.stock),
        id_categoria: String(item.id_categoria),
        id_proveedor: String(item.id_proveedor),
      }
      : EMPTY_FORM
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Nombre */}
            <div className="form-group">
              <label className="form-label" htmlFor="prod-nombre">Nombre *</label>
              <input
                id="prod-nombre"
                name="nombre"
                className={`form-control ${errors.nombre ? 'error' : ''}`}
                placeholder="Ej: Laptop Dell XPS"
                value={form.nombre}
                onChange={handleChange}
                autoFocus
              />
              {errors.nombre && <span className="form-error">{errors.nombre}</span>}
            </div>

            <div className="form-row">
              {/* Precio */}
              <div className="form-group">
                <label className="form-label" htmlFor="prod-precio">Precio *</label>
                <input
                  id="prod-precio"
                  name="precio_actual"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`form-control ${errors.precio_actual ? 'error' : ''}`}
                  placeholder="0.00"
                  value={form.precio_actual}
                  onChange={handleChange}
                />
                {errors.precio_actual && <span className="form-error">{errors.precio_actual}</span>}
              </div>

              {/* Stock */}
              <div className="form-group">
                <label className="form-label" htmlFor="prod-stock">Stock *</label>
                <input
                  id="prod-stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  className={`form-control ${errors.stock ? 'error' : ''}`}
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange}
                />
                {errors.stock && <span className="form-error">{errors.stock}</span>}
              </div>
            </div>

            {/* Categoría */}
            <div className="form-group">
              <label className="form-label" htmlFor="prod-cat">Categoría *</label>
              <select
                id="prod-cat"
                name="id_categoria"
                className={`form-control ${errors.id_categoria ? 'error' : ''}`}
                value={form.id_categoria}
                onChange={handleChange}
              >
                <option value="">— Selecciona —</option>
                {categorias.map(c => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                ))}
              </select>
              {errors.id_categoria && <span className="form-error">{errors.id_categoria}</span>}
            </div>

            {/* Proveedor */}
            <div className="form-group">
              <label className="form-label" htmlFor="prod-prov">Proveedor *</label>
              <select
                id="prod-prov"
                name="id_proveedor"
                className={`form-control ${errors.id_proveedor ? 'error' : ''}`}
                value={form.id_proveedor}
                onChange={handleChange}
              >
                <option value="">— Selecciona —</option>
                {proveedores.map(p => (
                  <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre_empresa}</option>
                ))}
              </select>
              {errors.id_proveedor && <span className="form-error">{errors.id_proveedor}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button id="btn-prod-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// componente principal
export default function ProductosView() {
  const { token } = useAuth()

  // Estado principal
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)   // { type, msg }
  const [search, setSearch] = useState('')
  const [modalItem, setModalItem] = useState(undefined) // undefined=cerrado, null=nuevo, obj=editar
  const [deleting, setDeleting] = useState(null)   // id en proceso de eliminar

  // fetch helpers (useCallback = referencia estable) 
  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token])

  const showAlert = useCallback((type, msg) => {
    setAlert({ type, msg })
    setTimeout(() => setAlert(null), 4000)
  }, [])

  const fetchProductos = useCallback(async () => {
    try {
      const res = await fetch('/api/productos', { headers: authHeaders() })
      if (!res.ok) throw new Error('Error al cargar productos')
      setProductos(await res.json())
    } catch (err) {
      showAlert('error', err.message)
    }
  }, [authHeaders, showAlert])

  // Cargar datos iniciales al montar
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const [pRes, cRes, prRes] = await Promise.all([
          fetch('/api/productos', { headers: authHeaders() }),
          fetch('/api/categorias', { headers: authHeaders() }),
          fetch('/api/proveedores', { headers: authHeaders() }),
        ])
        setProductos(await pRes.json())
        setCategorias(await cRes.json())
        setProveedores(await prRes.json())
      } catch {
        showAlert('error', 'Error cargando datos. Revisa tu conexión.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [authHeaders, showAlert])

  // useMemo para filtrar lista sin re-renderizar innecesariamente 
  const productosFiltrados = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return productos
    return productos.filter(p =>
      p.nombre_producto?.toLowerCase().includes(q) ||
      p.nombre_categoria?.toLowerCase().includes(q) ||
      p.nombre_proveedor?.toLowerCase().includes(q)
    )
  }, [productos, search])

  // CRUD handlers
  const handleSave = useCallback(async (form) => {
    const isEdit = Boolean(modalItem?.id_producto)
    const url = isEdit ? `/api/productos/${modalItem.id_producto}` : '/api/productos'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          precio_actual: Number(form.precio_actual),
          stock: Number(form.stock),
          id_categoria: Number(form.id_categoria),
          id_proveedor: Number(form.id_proveedor),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al guardar')

      showAlert('success', isEdit ? 'Producto actualizado correctamente' : 'Producto creado correctamente')
      setModalItem(undefined)
      await fetchProductos()
    } catch (err) {
      showAlert('error', err.message)
    }
  }, [modalItem, authHeaders, showAlert, fetchProductos])

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'No se pudo eliminar')

      showAlert('success', 'Producto eliminado correctamente')
      setProductos(prev => prev.filter(p => p.id_producto !== id))
    } catch (err) {
      showAlert('error', err.message)
    } finally {
      setDeleting(null)
    }
  }, [authHeaders, showAlert])

  // render
  return (
    <div>
      <h1 className="page-title">Productos</h1>
      <p className="page-subtitle">Gestión de inventario — {productosFiltrados.length} producto(s)</p>

      {/* Alert global */}
      {alert && (
        <div className={`alert alert-${alert.type}`} role="alert">
          {alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="prod-search"
            type="search"
            className="search-input"
            placeholder="Buscar por nombre, categoría o proveedor…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          id="btn-prod-nuevo"
          className="btn btn-primary"
          onClick={() => setModalItem(null)}
        >
          + Nuevo producto
        </button>
      </div>

      {/* Tabla */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>Cargando productos…</span>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '2.5rem' }}>📦</span>
            <p>{search ? 'Sin resultados para tu búsqueda.' : 'No hay productos registrados.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p) => (
                  <tr key={p.id_producto}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{p.id_producto}</td>
                    <td style={{ fontWeight: 600 }}>{p.nombre_producto}</td>
                    <td>
                      <span className="badge badge-neutral">{p.nombre_categoria}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.nombre_proveedor}</td>
                    <td style={{ fontWeight: 600 }}>
                      Q{Number(p.precio_actual).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${p.stock > 10 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Editar"
                          onClick={() => setModalItem(p)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Eliminar"
                          disabled={deleting === p.id_producto}
                          onClick={() => handleDelete(p.id_producto)}
                        >
                          {deleting === p.id_producto ? '…' : '🗑️'}
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

      {/* Modal crear / editar */}
      {modalItem !== undefined && (
        <ProductoModal
          item={modalItem}
          categorias={categorias}
          proveedores={proveedores}
          onSave={handleSave}
          onClose={() => setModalItem(undefined)}
        />
      )}
    </div>
  )
}
