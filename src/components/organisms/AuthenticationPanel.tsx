import Kicker from '../atoms/Kicker'
import AuthForm from '../molecules/AuthForm'

function AuthenticationPanel() {
  return (
    <main className="auth-layout">
      <section className="auth-story" aria-label="Nomos Impresores">
        <img
          className="auth-story__image"
          src="/assets/Preprensa-Nomos-Impreseros-5.jpeg"
          alt=""
          aria-hidden="true"
        />
        <div className="auth-story__content">
          <Kicker light>Una alianza que imprime futuro</Kicker>
          <h1>Ideas que toman forma. Historias que perduran.</h1>
          <p>
            Más de 30 años acompañando a nuestros aliados en cada proyecto editorial.
          </p>
        </div>
      </section>
      <section className="auth-panel" aria-label="Acceso a tu cuenta">
        <AuthForm />
      </section>
    </main>
  )
}

export default AuthenticationPanel
