import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'
import AuthenticationPage from './AuthenticationPage'

describe('AuthenticationPage', () => {
  it('starts with authentication at the root URL', () => {
    window.history.replaceState({}, '', '/')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
  })

  it('provides a validated login form with a password visibility toggle', () => {
    render(<AuthenticationPage />)

    expect(screen.getByRole('link', { name: /Volver al sitio/ })).toHaveAttribute(
      'href',
      'https://nomos.co/',
    )

    const email = screen.getByLabelText('Correo electrónico')
    const password = screen.getByLabelText('Contraseña')
    expect(email).toBeRequired()
    expect(password).toBeRequired()
    expect(password).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(password).toHaveAttribute('type', 'text')
  })

  it('clearly reports that authentication still needs a service connection', () => {
    render(<AuthenticationPage />)

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'aliado@empresa.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'contraseña' },
    })

    const form = screen.getByRole('button', { name: 'Iniciar sesión' }).closest('form')
    if (!form) {
      throw new Error('Login form was not rendered')
    }
    fireEvent.submit(form)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Conecta este formulario con el servicio de autenticación de Nomos.',
    )
  })
})
