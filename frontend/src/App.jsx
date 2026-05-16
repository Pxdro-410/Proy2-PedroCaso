import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layouts/MainLayout.jsx'
import LoginView from './views/LoginView.jsx'
import HomeView from './views/HomeView.jsx'
import ProductosView from './views/ProductosView.jsx'
import ClientesView from './views/ClientesView.jsx'
import VentasView from './views/VentasView.jsx'
import ReportesView from './views/ReportesView.jsx'

// Placeholder rutas protegidas
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginView />} />

      {/* Rutas protegidas dentro del layout principal */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<HomeView />} />
        <Route path="productos" element={<ProductosView />} />
        <Route path="clientes" element={<ClientesView />} />
        <Route path="ventas" element={<VentasView />} />
        <Route path="reportes" element={<ReportesView />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
