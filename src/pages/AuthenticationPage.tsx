import BrandLogo from '../components/atoms/BrandLogo'
import CmykBar from '../components/atoms/CmykBar'
import AuthenticationPanel from '../components/organisms/AuthenticationPanel'

function AuthenticationPage() {
  return (
    <div className="auth-page">
      <CmykBar />
      <header className="auth-topbar">
        <BrandLogo />
        <a className="auth-topbar__back" href="https://nomos.co/">
          ← Volver al sitio
        </a>
      </header>
      <AuthenticationPanel />
    </div>
  )
}

export default AuthenticationPage
