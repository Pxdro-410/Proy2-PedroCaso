import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import LoginView from '../views/LoginView.jsx'

// Wrapper con los providers necesarios
function Wrapper({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginView', () => {
  it('renderiza el formulario con los campos de usuario y contraseña', () => {
    render(<LoginView />, { wrapper: Wrapper })

    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })

  it('el botón de envío está deshabilitado cuando los campos están vacíos', () => {
    render(<LoginView />, { wrapper: Wrapper })

    const btn = screen.getByRole('button', { name: /entrar/i })
    expect(btn).toBeDisabled()
  })

  it('el botón se habilita cuando se llenan usuario y contraseña', async () => {
    render(<LoginView />, { wrapper: Wrapper })

    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '1234' } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /entrar/i })).not.toBeDisabled()
    })
  })

  it('muestra error cuando el servidor responde con credenciales inválidas', async () => {
    // Mock global fetch para simular respuesta 401
    global.fetch = async () => ({
      ok: false,
      json: async () => ({ message: 'Credenciales inválidas' }),
    })

    render(<LoginView />, { wrapper: Wrapper })

    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas')
    })
  })

  it('muestra error de red cuando fetch falla', async () => {
    global.fetch = async () => { throw new Error('Network error') }

    render(<LoginView />, { wrapper: Wrapper })

    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error conectando')
    })
  })
})
