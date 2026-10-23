import { useEffect, useState, type FormEvent } from 'react'
import Kicker from '../components/atoms/Kicker'
import { createRole, getErrorStatus, getRoles, type Role } from '../database/database'

type Status = { kind: 'success' | 'error'; message: string } | null

function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [filter, setFilter] = useState('')
  const [appliedFilter, setAppliedFilter] = useState('')
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    getRoles(appliedFilter)
      .then((result) => {
        if (cancelled) return
        setRoles(result)
        setListError('')
      })
      .catch(() => {
        if (!cancelled) setListError('No se pudieron cargar los roles.')
      })
      .finally(() => {
        if (!cancelled) setListLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [appliedFilter, reload])

  function refresh() {
    setListLoading(true)
    setReload((value) => value + 1)
  }

  function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = filter.trim()
    if (next === appliedFilter) {
      refresh()
      return
    }
    setListLoading(true)
    setAppliedFilter(next)
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const name = String(new FormData(form).get('name') ?? '').trim()

    setSaving(true)
    setStatus(null)
    try {
      await createRole(name)
      form.reset()
      setStatus({ kind: 'success', message: `Rol "${name}" creado correctamente.` })
      refresh()
    } catch (error) {
      const code = getErrorStatus(error)
      const message =
        code === 409
          ? `Ya existe un rol llamado "${name}".`
          : code === 403
            ? 'No tienes permiso para crear roles.'
            : 'No se pudo crear el rol. Intenta de nuevo.'
      setStatus({ kind: 'error', message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="home-main">
      <div className="roles-layout">
        <section className="user-card roles-list" aria-labelledby="roles-title">
          <Kicker>Administración</Kicker>
          <h2 id="roles-title">Roles</h2>

          <form className="roles-filter" onSubmit={handleFilter} role="search">
            <div className="form-field">
              <label htmlFor="roles-filter">Filtrar por nombre</label>
              <input
                id="roles-filter"
                type="search"
                value={filter}
                placeholder="Ej. dm"
                onChange={(event) => setFilter(event.target.value)}
              />
            </div>
            <button className="button button--outline-ink" type="submit">
              Buscar
            </button>
          </form>

          {listLoading && <p className="roles-empty">Cargando roles…</p>}
          {listError && (
            <p className="auth-form__notice auth-form__notice--error" role="alert">
              {listError}
            </p>
          )}
          {!listLoading && !listError && roles.length === 0 && (
            <p className="roles-empty">No hay roles para mostrar.</p>
          )}
          {!listLoading && roles.length > 0 && (
            <ul className="roles-items">
              {roles.map((role) => (
                <li key={role.id}>{role.name}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="user-card" aria-labelledby="new-role-title">
          <form className="auth-form" onSubmit={handleCreate}>
            <Kicker>Nuevo</Kicker>
            <h2 id="new-role-title">Crear rol</h2>
            <p className="auth-form__intro">Define un nuevo rol para asignar a los usuarios.</p>

            <div className="form-field">
              <label htmlFor="role-name">Nombre del rol</label>
              <input
                id="role-name"
                name="name"
                type="text"
                autoComplete="off"
                placeholder="Editor"
                required
              />
            </div>

            <button className="button button--ink" type="submit" disabled={saving}>
              {saving ? 'Creando…' : 'Crear rol'}
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
      </div>
    </main>
  )
}

export default RolesPage
