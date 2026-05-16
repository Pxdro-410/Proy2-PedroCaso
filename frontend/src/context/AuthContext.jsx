import { createContext, useContext, useState, useCallback } from 'react'

// Context 
const AuthContext = createContext(null)

// Provider 
export function AuthProvider({ children }) {
  // Inicializar desde localStorage para persistir la sesión al recargar
  const [token, setToken] = useState(() => localStorage.getItem('token') ?? null)
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    try { return stored ? JSON.parse(stored) : null } catch { return null }
  })

  /**
   * login guarda el token y el usuario en state y localStorage
   * @param {string} newToken  JWT devuelto por el backend
   * @param {object} newUser   { username, nombre, puesto }
   */
  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  /**
   * logout limpia state y localStorage
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  /**
   * isAuthenticated booleano conveniente
   */
  const isAuthenticated = Boolean(token)

  const value = { token, user, isAuthenticated, login, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook 
/**
 * useAuth consumir el AuthContext desde cualquier componente
 * Lanza error si se usa fuera del AuthProvider
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
