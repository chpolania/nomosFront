import { useEffect, useState, type FormEvent } from 'react'
import Kicker from '../components/atoms/Kicker'
import {
  assignRoleToUser,
  getErrorStatus,
  getRoles,
  getUsers,
  type Role,
  type User,
} from '../database/database'

type Status = { kind: 'success' | 'error'; message: string } | null

function AssignRolePage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesError, setRolesError] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [usersError, setUsersError] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  useEffect(() => {
    let cancelled = false
    getRoles()
      .then((result) => {
        if (!cancelled) setRoles(result)
      })
      .catch(() => {
        if (!cancelled) setRolesError('No se pudieron cargar los roles.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      getUsers(userFilter)
        .then((result) => {
          if (cancelled) return
          setUsers(result)
          setUsersError('')
        })
        .catch(() => {
          if (!cancelled) setUsersError('No se pudieron cargar los usuarios.')
        })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [userFilter])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const userId = Number(data.get('userId'))
    const roleId = Number(data.get('roleId'))
    const username = users.find((user) => user.id === userId)?.username ?? String(userId)
    const roleName = roles.find((role) => role.id === roleId)?.name ?? ''

    setSaving(true)
    setStatus(null)
    try {
      await assignRoleToUser(userId, roleId)
      form.reset()
      setStatus({
        kind: 'success',
        message: `Rol "${roleName}" asignado al usuario ${username}.`,
      })
    } catch (error) {
      const code = getErrorStatus(error)
      const message =
        code === 404
          ? `No se encontró el usuario ${username} o el rol seleccionado.`
          : code === 403
            ? 'No tienes permiso para asignar roles.'
            : 'No se pudo asignar el rol. Intenta de nuevo.'
      setStatus({ kind: 'error', message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="home-main">
      <section className="user-card" aria-labelledby="assign-role-title">
        <form className="auth-form" onSubmit={handleSubmit}>
          <Kicker>Administración</Kicker>
          <h2 id="assign-role-title">Asignar rol a usuario</h2>
          <p className="auth-form__intro">
            Busca al usuario por nombre y elige el rol que quieres asignarle.
          </p>

          <div className="form-field">
            <label htmlFor="assign-user-filter">Buscar usuario</label>
            <input
              id="assign-user-filter"
              type="search"
              autoComplete="off"
              placeholder="Ej. ang"
              value={userFilter}
              onChange={(event) => setUserFilter(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="assign-user-id">Usuario</label>
            <select id="assign-user-id" name="userId" defaultValue="" required>
              <option value="" disabled>
                {users.length === 0 ? 'Sin resultados' : 'Selecciona un usuario'}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {usersError && (
            <p className="auth-form__notice auth-form__notice--error" role="alert">
              {usersError}
            </p>
          )}

          <div className="form-field">
            <label htmlFor="assign-role-id">Rol</label>
            <select id="assign-role-id" name="roleId" defaultValue="" required>
              <option value="" disabled>
                Selecciona un rol
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {rolesError && (
            <p className="auth-form__notice auth-form__notice--error" role="alert">
              {rolesError}
            </p>
          )}

          <button className="button button--ink" type="submit" disabled={saving}>
            {saving ? 'Asignando…' : 'Asignar rol'}
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

export default AssignRolePage
