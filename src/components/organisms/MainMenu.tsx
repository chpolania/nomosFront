import { useEffect, useState, type ReactNode } from 'react'
import BrandLogo from '../atoms/BrandLogo'
import { getSessionUser, logout } from '../../database/database'

export type AppPage = 'home' | 'create-user' | 'roles' | 'assign-role'

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const userShape = (
  <>
    <circle cx="9" cy="8" r="4" />
    <path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" />
  </>
)

const items: { page: AppPage; label: string; icon: ReactNode }[] = [
  {
    page: 'home',
    label: 'Inicio',
    icon: <path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
  },
  {
    page: 'create-user',
    label: 'Crear usuario',
    icon: (
      <>
        {userShape}
        <path d="M19 8v6M16 11h6" />
      </>
    ),
  },
  {
    page: 'roles',
    label: 'Roles',
    icon: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  },
  {
    page: 'assign-role',
    label: 'Asignar rol',
    icon: (
      <>
        {userShape}
        <path d="M16 11l2 2 4-4" />
      </>
    ),
  },
]

type MainMenuProps = {
  current: AppPage
  onNavigate: (page: AppPage) => void
}

function MainMenu({ current, onNavigate }: MainMenuProps) {
  const user = getSessionUser()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  function go(page: AppPage) {
    onNavigate(page)
    setOpen(false)
  }

  return (
    <>
      <header className="auth-topbar">
        <BrandLogo />
        <div className="home-topbar__session">
          {user && <span className="home-topbar__user">{user.username}</span>}
          <button
            className="menu-toggle"
            type="button"
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="main-menu"
            onClick={() => setOpen(!open)}
          >
            <span className="menu-toggle__bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <div
        className={`main-menu__backdrop${open ? ' main-menu__backdrop--open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <nav
        id="main-menu"
        className={`main-menu${open ? ' main-menu--open' : ''}`}
        aria-label="Menú principal"
        inert={!open}
      >
        <div className="main-menu__head">
          <p className="main-menu__title">Menú</p>
          <button
            className="main-menu__close"
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          >
            <Icon>
              <path d="M6 6l12 12M18 6L6 18" />
            </Icon>
          </button>
        </div>
        {items.map((item) => (
          <button
            key={item.page}
            type="button"
            className={`main-menu__item${current === item.page ? ' main-menu__item--active' : ''}`}
            aria-current={current === item.page ? 'page' : undefined}
            onClick={() => go(item.page)}
          >
            <Icon>{item.icon}</Icon>
            {item.label}
          </button>
        ))}
        <button
          className="main-menu__item main-menu__item--logout"
          type="button"
          onClick={() => {
            setOpen(false)
            void logout()
          }}
        >
          <Icon>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </Icon>
          Cerrar sesión
        </button>
      </nav>
    </>
  )
}

export default MainMenu
