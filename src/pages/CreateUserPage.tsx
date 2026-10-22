import { useState, type FormEvent } from 'react'
import Kicker from '../components/atoms/Kicker'
import { createUser } from '../database/database'

type Status = { kind: 'success' | 'error'; message: string } | null

function CreateUserPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const username = String(data.get('username') ?? '').trim()

    setLoading(true)
    setStatus(null)
    try {
      await createUser({
        username,
        email: String(data.get('email') ?? '').trim(),
        password: String(data.get('password') ?? ''),
      })
      form.reset()
      setShowPassword(false)
      setStatus({ kind: 'success', message: `Usuario "${username}" creado correctamente.` })
    } catch {
      setStatus({
        kind: 'error',
        message: 'No se pudo crear el usuario. Verifica los datos o tus permisos.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="home-main">
      <section className="user-card" aria-labelledby="create-user-title">
        <form className="auth-form" onSubmit={handleSubmit}>
          <Kicker>Administración</Kicker>
          <h2 id="create-user-title">Crear usuario</h2>
          <p className="auth-form__intro">
            Registra un nuevo usuario para que acceda al portal de Nomos.
          </p>

          <div className="form-field">
            <label htmlFor="new-username">Usuario</label>
            <input
              id="new-username"
              name="username"
              type="text"
              autoComplete="off"
              placeholder="juan"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="new-email">Correo electrónico</label>
            <input
              id="new-email"
              name="email"
              type="email"
              autoComplete="off"
              placeholder="nombre@nomos.co"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="new-password">Contraseña</label>
            <div className="password-field">
              <input
                id="new-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Define una contraseña"
                required
              />
              <button
                className="password-field__toggle"
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <button className="button button--ink" type="submit" disabled={loading}>
            {loading ? 'Creando…' : 'Crear usuario'}
          </button>

          {status && (
            <p
              className={`auth-form__notice${status.kind === 'error' ? ' auth-form__notice--error' : ''}`}
              role="status"
            >
              {status.message}
            </p>
          )}
        </form>
      </section>
    </main>
  )
}

export default CreateUserPage
