import BrandLogo from '../atoms/BrandLogo'
import { getSessionUser, logout } from '../../database/database'

export type AppPage = 'home' | 'create-user' | 'roles' | 'assign-role'

const items: { page: AppPage; label: string }[] = [
  { page: 'home', label: 'Inicio' },
  { page: 'create-user', label: 'Crear usuario' },
  { page: 'roles', label: 'Roles' },
  { page: 'assign-role', label: 'Asignar rol' },
]

type MainMenuProps = {
  current: AppPage
  onNavigate: (page: AppPage) => void
}

function MainMenu({ current, onNavigate }: MainMenuProps) {
  const user = getSessionUser()

  return (
    <header className="auth-topbar">
      <BrandLogo />
      <nav className="main-menu" aria-label="Menú principal">
        {items.map((item) => (
          <button
            key={item.page}
            type="button"
            className={`main-menu__item${current === item.page ? ' main-menu__item--active' : ''}`}
            aria-current={current === item.page ? 'page' : undefined}
            onClick={() => onNavigate(item.page)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="home-topbar__session">
        {user && <span className="home-topbar__user">{user.username}</span>}
        <button className="button button--outline-ink" type="button" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

export default MainMenu
