import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import AuthenticationPage from './AuthenticationPage'
import { assignRoleToUser, createRole, createUser, getRoles, getUsers, login } from '../database/database'

vi.mock('../database/database', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../database/database')>()),
  login: vi.fn().mockResolvedValue({}),
  createUser: vi.fn().mockResolvedValue({}),
  getRoles: vi.fn().mockResolvedValue([{ id: 1, name: 'Admin' }]),
  createRole: vi.fn().mockResolvedValue({}),
  getUsers: vi.fn().mockResolvedValue([
    { id: 2, username: 'christian', email: 'c@nomos.co', created_at: '' },
  ]),
  assignRoleToUser: vi.fn().mockResolvedValue({}),
  getErrorStatus: vi.fn(() => 409),
  logout: vi.fn(async () => {
    sessionStorage.clear()
    window.dispatchEvent(new Event('auth:session-cleared'))
  }),
}))

describe('AuthenticationPage', () => {
  beforeEach(() => sessionStorage.clear())

  it('starts with authentication at the root URL', () => {
    window.history.replaceState({}, '', '/')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument()
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument()
  })

  it('provides a validated login form with a password visibility toggle', () => {
    render(<AuthenticationPage />)

    expect(screen.getByRole('link', { name: /Volver al sitio/ })).toHaveAttribute(
      'href',
      'https://nomos.co/',
    )

    const email = screen.getByLabelText('Usuario')
    const password = screen.getByLabelText('Contraseña')
    expect(email).toBeRequired()
    expect(password).toBeRequired()
    expect(password).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(password).toHaveAttribute('type', 'text')
  })

  it('logs in through the database module', async () => {
    render(<AuthenticationPage />)

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({ username: 'admin', password: 'secret' }),
    )
    expect(await screen.findByRole('status')).toHaveTextContent('Sesión iniciada')
  })

  it('shows the home page when a session exists and returns to login on logout', async () => {
    sessionStorage.setItem('refresh_token', 'refresh')
    render(<App />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bienvenido a tu espacio')
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument()
    expect(sessionStorage.getItem('refresh_token')).toBeNull()
  })

  it('opens the home page after a successful login', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret' } })
    sessionStorage.setItem('refresh_token', 'refresh')
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })

  it('creates a user from the menu', async () => {
    sessionStorage.setItem('refresh_token', 'refresh')
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }))
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'juan' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'juan@nomos.co' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Secreta123' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Crear usuario' })[1])

    await waitFor(() =>
      expect(createUser).toHaveBeenCalledWith({
        username: 'juan',
        email: 'juan@nomos.co',
        password: 'Secreta123',
      }),
    )
    expect(await screen.findByRole('status')).toHaveTextContent('creado correctamente')
  })

  it('lists, filters and creates roles', async () => {
    sessionStorage.setItem('refresh_token', 'refresh')
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Roles' }))
    expect(await screen.findByText('Admin')).toBeInTheDocument()
    expect(getRoles).toHaveBeenLastCalledWith('')

    fireEvent.change(screen.getByLabelText('Filtrar por nombre'), { target: { value: 'dm' } })
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    await waitFor(() => expect(getRoles).toHaveBeenLastCalledWith('dm'))

    fireEvent.change(screen.getByLabelText('Nombre del rol'), { target: { value: 'Editor' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear rol' }))
    await waitFor(() => expect(createRole).toHaveBeenCalledWith('Editor'))
    expect(await screen.findByRole('status')).toHaveTextContent('Rol "Editor" creado')
  })

  it('explains when a role already exists', async () => {
    sessionStorage.setItem('refresh_token', 'refresh')
    vi.mocked(createRole).mockRejectedValueOnce(new Error('conflict'))
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Roles' }))
    fireEvent.change(screen.getByLabelText('Nombre del rol'), { target: { value: 'Editor' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear rol' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Ya existe un rol llamado "Editor"')
  })

  it('assigns a role to a user', async () => {
    sessionStorage.setItem('refresh_token', 'refresh')
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Asignar rol' }))
    await screen.findByRole('option', { name: 'Admin' })
    await screen.findByRole('option', { name: /christian/ })
    fireEvent.change(screen.getByLabelText('Buscar usuario'), { target: { value: 'chr' } })
    await waitFor(() => expect(getUsers).toHaveBeenLastCalledWith('chr'))
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Rol'), { target: { value: '1' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Asignar rol' })[1])

    await waitFor(() => expect(assignRoleToUser).toHaveBeenCalledWith(2, 1))
    expect(await screen.findByRole('status')).toHaveTextContent('Rol "Admin" asignado al usuario christian')
  })
})
