import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar.jsx'

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content fade-in">
        <Outlet />
      </main>
    </div>
  )
}
