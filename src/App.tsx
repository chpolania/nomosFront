import { useEffect, useState } from 'react'
import AuthenticationPage from './pages/AuthenticationPage'
import CmykBar from './components/atoms/CmykBar'
import MainMenu, { type AppPage } from './components/organisms/MainMenu'
import AssignRolePage from './pages/AssignRolePage'
import CreateUserPage from './pages/CreateUserPage'
import HomePage from './pages/HomePage'
import RolesPage from './pages/RolesPage'
import { isAuthenticated, SESSION_CLEARED_EVENT } from './database/database'

function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated)
  const [page, setPage] = useState<AppPage>('home')

  useEffect(() => {
    const onCleared = () => {
      setAuthenticated(false)
      setPage('home')
    }
    window.addEventListener(SESSION_CLEARED_EVENT, onCleared)
    return () => window.removeEventListener(SESSION_CLEARED_EVENT, onCleared)
  }, [])

  if (!authenticated) {
    return <AuthenticationPage onAuthenticated={() => setAuthenticated(true)} />
  }
  return (
    <div className="home-page">
      <CmykBar />
      <MainMenu current={page} onNavigate={setPage} />
      {page === 'create-user' && <CreateUserPage />}
      {page === 'roles' && <RolesPage />}
      {page === 'assign-role' && <AssignRolePage />}
      {page === 'home' && <HomePage />}
    </div>
  )
}

export default App
