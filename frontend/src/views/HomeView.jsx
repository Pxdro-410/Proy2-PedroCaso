import { useAuth } from '../context/AuthContext.jsx'

export default function HomeView() {
  const { user } = useAuth()

  const cards = [
    { label: 'Gestión', title: 'Productos', emoji: '📦', color: 'var(--accent)' },
    { label: 'Directorio', title: 'Clientes', emoji: '👥', color: 'var(--info)' },
    { label: 'Registros', title: 'Ventas', emoji: '🛒', color: 'var(--success)' },
    { label: 'Análisis', title: 'Reportes', emoji: '📊', color: 'var(--warning)' },
  ]

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        Bienvenido{user?.nombre ? `, ${user.nombre}` : ''}. Gestiona inventario, clientes y ventas desde aquí.
      </p>

      {/* Quick-access cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {cards.map(({ label, title, emoji, color }) => (
          <div key={title} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ fontSize: '1.25rem', color }}>
              {emoji} {title}
            </div>
          </div>
        ))}
      </div>

      {/* Info card */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h2 className="card-title">Sistema de Inventario y Ventas</h2>
          {user?.puesto && (
            <span className="badge badge-neutral">{user.puesto}</span>
          )}
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Utiliza el menú de navegación para gestionar tus productos, categorías, realizar ventas
          y consultar reportes. Todos los datos se persisten en tiempo real en la base de datos. Hecho por Pedro Caso.
        </p>
      </div>
    </div>
  )
}
