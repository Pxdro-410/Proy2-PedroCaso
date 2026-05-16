import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LoginView.module.css'

export default function LoginView() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (res.ok) {
        // Temporal — en PASO 2 esto irá al AuthContext
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/', { replace: true })
      } else {
        setErrorMsg(data.message || 'Credenciales inválidas')
      }
    } catch {
      setErrorMsg('Error conectando con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Gestión Tienda</h1>
          <p className={styles.subtitle}>Inicia sesión en tu cuenta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className="form-group">
            <label htmlFor="login-username" className="form-label">Usuario</label>
            <input
              id="login-username"
              type="text"
              required
              autoComplete="username"
              autoFocus
              className="form-control"
              placeholder="Ej: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Contraseña</label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div className="alert alert-error" role="alert">
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            id="btn-login-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
            disabled={isLoading || !username || !password}
          >
            {isLoading ? (
              <>
                <span className={styles.btnSpinner} />
                Autenticando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <p className={styles.hint}>
          Usuario de prueba: <strong>admin</strong>
        </p>
      </div>
    </div>
  )
}
