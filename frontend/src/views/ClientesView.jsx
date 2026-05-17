import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Search, Users, CheckCircle, AlertTriangle } from 'lucide-react'

// helpers
const EMPTY_FORM = { nombre_completo: '', correo: '', telefono: '' }

function validate(form) {
  const errors = {}
  if (!form.nombre_completo.trim()) errors.nombre_completo = 'El nombre es requerido'
  if (!form.correo.trim()) errors.correo = 'El correo es requerido'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
    errors.correo = 'Formato de correo inválido'
  return errors
}

// Modal formulario
function ClienteModal({ item, onSave, onClose }) {
  const isEdit = Boolean(item?.id_cliente)
  const [form, setForm] = useState(
    isEdit
      ? { nombre_completo: item.nombre_completo, correo: item.correo, telefono: item.telefono ?? '' }
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

  // Render del modal
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="cli-nombre">Nombre completo *</label>
              <input
                id="cli-nombre"
                name="nombre_completo"
                autoFocus
                className={`form-control ${errors.nombre_completo ? 'error' : ''}`}
                placeholder="Ej: Juan Pérez García"
                value={form.nombre_completo}
                onChange={handleChange}
              />
              {errors.nombre_completo && <span className="form-error">{errors.nombre_completo}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cli-correo">Correo *</label>
              <input
                id="cli-correo"
                name="correo"
                type="email"
                className={`form-control ${errors.correo ? 'error' : ''}`}
                placeholder="correo@ejemplo.com"
                value={form.correo}
                onChange={handleChange}
              />
              {errors.correo && <span className="form-error">{errors.correo}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cli-tel">Teléfono</label>
              <input
                id="cli-tel"
                name="telefono"
                type="tel"
                className="form-control"
                placeholder="Ej: 5555-1234"
                value={form.telefono}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button id="btn-cli-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Vista principal
export default function ClientesView() {
  const { token } = useAuth()

  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [search, setSearch] = useState('')
  const [modalItem, setModalItem] = useState(undefined)
  const [deleting, setDeleting] = useState(null)

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token])

  const showAlert = useCallback((type, msg) => {
    setAlert({ type, msg })
    setTimeout(() => setAlert(null), 4000)
  }, [])

  const fetchClientes = useCallback(async () => {
    try {
      const res = await fetch('/api/clientes', { headers: authHeaders() })
      if (!res.ok) throw new Error('Error al cargar clientes')
      setClientes(await res.json())
    } catch (err) {
      showAlert('error', err.message)
    }
  }, [authHeaders, showAlert])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchClientes()
      setLoading(false)
    }
    init()
  }, [fetchClientes])

  const clientesFiltrados = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return clientes
    return clientes.filter(c =>
      c.nombre_completo?.toLowerCase().includes(q) ||
      c.correo?.toLowerCase().includes(q) ||
      c.telefono?.toLowerCase().includes(q)
    )
  }, [clientes, search])

  const handleSave = useCallback(async (form) => {
    const isEdit = Boolean(modalItem?.id_cliente)
    const url = isEdit ? `/api/clientes/${modalItem.id_cliente}` : '/api/clientes'
    const method = isEdit ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({
          nombre_completo: form.nombre_completo.trim(),
          correo: form.correo.trim(),
          telefono: form.telefono?.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al guardar')
      showAlert('success', isEdit ? 'Cliente actualizado' : 'Cliente creado correctamente')
      setModalItem(undefined)
      await fetchClientes()
    } catch (err) {
      showAlert('error', err.message)
    }
  }, [modalItem, authHeaders, showAlert, fetchClientes])

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'No se pudo eliminar')
      showAlert('success', 'Cliente eliminado correctamente')
      setClientes(prev => prev.filter(c => c.id_cliente !== id))
    } catch (err) {
      showAlert('error', err.message)
    } finally {
      setDeleting(null)
    }
  }, [authHeaders, showAlert])

  return (
    <div>
      <h1 className="page-title">Clientes</h1>
      <p className="page-subtitle">Directorio de clientes — {clientesFiltrados.length} registro(s)</p>

      {alert && (
        <div className={`alert alert-${alert.type}`} role="alert">
          {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />} {alert.msg}
        </div>
      )}

      <div className="toolbar">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            id="cli-search"
            type="search"
            className="search-input"
            placeholder="Buscar por nombre, correo o teléfono…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button id="btn-cli-nuevo" className="btn btn-primary" onClick={() => setModalItem(null)}>
          + Nuevo cliente
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-state"><div className="spinner" /><span>Cargando clientes…</span></div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="empty-state">
            <Users size={48} strokeWidth={1.2} />
            <p>{search ? 'Sin resultados.' : 'No hay clientes registrados.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map(c => (
                  <tr key={c.id_cliente}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{c.id_cliente}</td>
                    <td style={{ fontWeight: 600 }}>{c.nombre_completo}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.correo}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.telefono ?? '—'}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => setModalItem(c)}>
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={deleting === c.id_cliente}
                          onClick={() => handleDelete(c.id_cliente)}
                        >
                          {deleting === c.id_cliente ? '…' : '🗑️'}
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

      {modalItem !== undefined && (
        <ClienteModal
          item={modalItem}
          onSave={handleSave}
          onClose={() => setModalItem(undefined)}
        />
      )}
    </div>
  )
}
