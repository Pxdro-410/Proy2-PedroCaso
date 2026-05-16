import { NavLink, useNavigate } from 'react-router-dom'
import styles from './Navbar.module.css'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/productos', label: 'Productos' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/reportes', label: 'Reportes' },
]

export default function Navbar() {
  const navigate = useNavigate()

  const userRaw = localStorage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : null

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <nav className={styles.navbar}>
      {/* Brand */}
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🏪</span>
        <span className={styles.brandText}>Gestión Tienda</span>
      </div>

      {/* Links */}
      <div className={styles.links}>
        {NAV_ITEMS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* User actions */}
      <div className={styles.actions}>
        {user && (
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user.nombre?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <span className={styles.userName}>{user.nombre}</span>
          </div>
        )}
        <button
          id="btn-logout"
          onClick={handleLogout}
          className={styles.logoutBtn}
          title="Cerrar sesión"
        >
          Salir
        </button>
      </div>
    </nav>
  )
}
