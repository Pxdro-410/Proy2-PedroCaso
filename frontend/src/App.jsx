import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import MainLayout from './components/layouts/MainLayout.jsx'
import LoginView from './views/LoginView.jsx'
import HomeView from './views/HomeView.jsx'
import ProductosView from './views/ProductosView.jsx'
import ClientesView from './views/ClientesView.jsx'
import VentasView from './views/VentasView.jsx'
import ReportesView from './views/ReportesView.jsx'
import DotBackground from './components/DotBackground.jsx'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
      <DotBackground />
      <Routes>
        <Route path="/login" element={<LoginView />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
