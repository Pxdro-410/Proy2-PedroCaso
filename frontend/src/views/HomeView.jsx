export default function HomeView() {
  const userRaw = localStorage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : null

  const cards = [
    { label: 'Gestión', title: 'Productos', to: '/productos', emoji: '📦', color: 'var(--accent)' },
    { label: 'Directorio', title: 'Clientes', to: '/clientes', emoji: '👥', color: 'var(--info)' },
    { label: 'Registros', title: 'Ventas', to: '/ventas', emoji: '🛒', color: 'var(--success)' },
    { label: 'Análisis', title: 'Reportes', to: '/reportes', emoji: '📊', color: 'var(--warning)' },
  ]

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        Bienvenido{user?.nombre ? `, ${user.nombre}` : ''}. Gestiona inventario, clientes y ventas desde aquí.
      </p>

      {/* Tarjetas de acceso rápido */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {cards.map(({ label, title, emoji, color }) => (
          <div key={title} className="stat-card" style={{ cursor: 'default' }}>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ fontSize: '1.25rem', color }}>{emoji} {title}</div>
          </div>
        ))}
      </div>

      {/* Tarjeta bienvenida */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h2 className="card-title">Sistema de Inventario y Ventas</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Utiliza el menú de navegación para gestionar tus productos, categorías, realizar ventas
          y consultar reportes. Todos los datos se persisten en tiempo real en la base de datos. Hecho por Pedro Caso.
        </p>
      </div>
    </div>
  )
}
