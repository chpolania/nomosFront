import { useState, type FormEvent } from 'react'

function AuthForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(
      'La interfaz de acceso está lista. Conecta este formulario con el servicio de autenticación de Nomos.',
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <p className="auth-form__eyebrow">Portal Nomos</p>
      <h2>Bienvenido de nuevo</h2>
      <p className="auth-form__intro">
        Ingresa tus datos para continuar a tu espacio de trabajo.
      </p>

      <div className="form-field">
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@empresa.com"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="password">Contraseña</label>
        <div className="password-field">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
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

      <div className="auth-form__options">
        <label className="remember-option" htmlFor="remember">
          <input id="remember" name="remember" type="checkbox" />
          Recordarme
        </label>
        <button
          className="auth-form__link"
          type="button"
          onClick={() =>
            setNotice('Para recuperar tu contraseña, contacta al equipo de Nomos.')
          }
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button className="button button--ink" type="submit">
        Iniciar sesión
      </button>

      {notice && (
        <p className="auth-form__notice" role="status">
          {notice}
        </p>
      )}
      <p className="auth-form__legal">
        Acceso exclusivo para clientes y aliados de Nomos Impresores.
      </p>
    </form>
  )
}

export default AuthForm
