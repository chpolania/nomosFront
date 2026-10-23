import BrandLogo from '../components/atoms/BrandLogo'
import CmykBar from '../components/atoms/CmykBar'
import AuthenticationPanel from '../components/organisms/AuthenticationPanel'

type AuthenticationPageProps = {
  onAuthenticated?: () => void
}

function AuthenticationPage({ onAuthenticated }: AuthenticationPageProps) {
  return (
    <div className="auth-page">
      <CmykBar />
      <header className="auth-topbar">
        <BrandLogo />
        <a className="auth-topbar__back" href="https://nomos.co/">
          ← Volver al sitio
        </a>
      </header>
      <AuthenticationPanel onAuthenticated={onAuthenticated} />
    </div>
  )
}

export default AuthenticationPage
