import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'

// Componente helper para exponer el contexto
function AuthConsumer() {
  const { isAuthenticated, user, token } = useAuth()
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'autenticado' : 'no-autenticado'}</span>
      <span data-testid="user-name">{user?.nombre ?? 'ninguno'}</span>
      <span data-testid="token">{token ?? 'sin-token'}</span>
    </div>
  )
}

function AuthMutator() {
  const { login, logout } = useAuth()
  return (
    <>
      <button onClick={() => login('tok123', { nombre: 'Pedro', puesto: 'Admin' })}>
        login
      </button>
      <button onClick={logout}>logout</button>
    </>
  )
}

function TestApp() {
  return (
    <AuthProvider>
      <AuthConsumer />
      <AuthMutator />
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  it('inicia con estado no autenticado si localStorage está vacío', () => {
    localStorage.clear()
    render(<TestApp />)
    expect(screen.getByTestId('auth-status')).toHaveTextContent('no-autenticado')
    expect(screen.getByTestId('user-name')).toHaveTextContent('ninguno')
    expect(screen.getByTestId('token')).toHaveTextContent('sin-token')
  })

  it('login actualiza isAuthenticated, user y token', async () => {
    localStorage.clear()
    render(<TestApp />)

    await act(async () => {
      screen.getByRole('button', { name: 'login' }).click()
    })

    expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado')
    expect(screen.getByTestId('user-name')).toHaveTextContent('Pedro')
    expect(screen.getByTestId('token')).toHaveTextContent('tok123')
  })

  it('login persiste el token en localStorage', async () => {
    localStorage.clear()
    render(<TestApp />)

    await act(async () => {
      screen.getByRole('button', { name: 'login' }).click()
    })

    expect(localStorage.getItem('token')).toBe('tok123')
    expect(JSON.parse(localStorage.getItem('user'))).toMatchObject({ nombre: 'Pedro' })
  })

  it('logout limpia el estado y localStorage', async () => {
    localStorage.clear()
    render(<TestApp />)

    // Primero hacemos login
    await act(async () => {
      screen.getByRole('button', { name: 'login' }).click()
    })
    expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado')

    // Luego logout
    await act(async () => {
      screen.getByRole('button', { name: 'logout' }).click()
    })

    expect(screen.getByTestId('auth-status')).toHaveTextContent('no-autenticado')
    expect(screen.getByTestId('token')).toHaveTextContent('sin-token')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('inicializa desde localStorage si ya existe una sesión', () => {
    localStorage.setItem('token', 'tok-existente')
    localStorage.setItem('user', JSON.stringify({ nombre: 'Maria', puesto: 'Cajera' }))

    render(<TestApp />)

    expect(screen.getByTestId('auth-status')).toHaveTextContent('autenticado')
    expect(screen.getByTestId('user-name')).toHaveTextContent('Maria')
    expect(screen.getByTestId('token')).toHaveTextContent('tok-existente')

    localStorage.clear()
  })
})
