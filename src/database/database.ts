import axios, { type InternalAxiosRequestConfig } from 'axios'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_TYPE_KEY = 'token_type'
export const SESSION_CLEARED_EVENT = 'auth:session-cleared'

const BASE_URL: string = import.meta.env.BASE ?? 'http://localhost:9080/v1/product'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  token_type: string
  access_token: string
  expires_in: number
  refresh_token: string
}

export const tokenStorage = {
  getAccessToken: () => sessionStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => sessionStorage.getItem(REFRESH_TOKEN_KEY),
  getTokenType: () => sessionStorage.getItem(TOKEN_TYPE_KEY) ?? 'Bearer',
  save(tokens: AuthTokens) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
    sessionStorage.setItem(TOKEN_TYPE_KEY, tokens.token_type)
  },
  clear() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_TYPE_KEY)
    window.dispatchEvent(new Event(SESSION_CLEARED_EVENT))
  },
}

export function isAuthenticated(): boolean {
  return Boolean(tokenStorage.getRefreshToken() ?? tokenStorage.getAccessToken())
}

export function getSessionUser(): { username: string; roles: string[] } | null {
  const token = tokenStorage.getAccessToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return { username: payload.username ?? '', roles: payload.roles ?? [] }
  } catch {
    return null
  }
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export async function login(credentials: LoginCredentials): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>('/auth/login', credentials)
  tokenStorage.save(data)
  return data
}

export interface NewUser {
  username: string
  email: string
  password: string
}

export async function createUser(user: NewUser): Promise<unknown> {
  const { data } = await api.post('/users', user)
  return data
}

export interface Role {
  id: number
  name: string
}

export async function getRoles(filter?: string): Promise<Role[]> {
  const { data } = await api.get<Role[]>('/roles', {
    params: filter?.trim() ? { filter: filter.trim() } : undefined,
  })
  return data
}

export async function createRole(name: string): Promise<unknown> {
  const { data } = await api.post('/roles', { name })
  return data
}

export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

export async function getUsers(username?: string): Promise<User[]> {
  const { data } = await api.get<User[]>('/users', {
    params: username?.trim() ? { username: username.trim() } : undefined,
  })
  return data
}

export async function assignRoleToUser(userId: number, roleId: number): Promise<unknown> {
  const { data } = await api.post(`/users/${userId}/roles`, { role_id: roleId })
  return data
}

export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

export async function logout(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken()
  try {
    if (refreshToken) {
      await api.post('/auth/logout', { refresh_token: refreshToken })
    }
  } catch {
    // La sesión local se cierra igual aunque el servidor no responda.
  } finally {
    tokenStorage.clear()
  }
}

// Un solo refresh en vuelo para que peticiones concurrentes compartan el resultado.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) {
    throw new Error('No hay refresh token disponible')
  }

  // Se usa axios directo para no pasar por los interceptores de `api`.
  const { data } = await axios.post<AuthTokens>(`${BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  })
  tokenStorage.save({
    ...data,
    refresh_token: data.refresh_token ?? refreshToken,
  })
  return data.access_token
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `${tokenStorage.getTokenType()} ${token}`
  }
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: RetriableConfig | undefined = error.config
    const isAuthCall = original?.url?.startsWith('/auth/')

    if (error.response?.status !== 401 || !original || original._retry || isAuthCall) {
      throw error
    }
    original._retry = true

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const token = await refreshPromise
      original.headers.Authorization = `${tokenStorage.getTokenType()} ${token}`
      return api(original)
    } catch (refreshError) {
      tokenStorage.clear()
      throw refreshError
    }
  },
)
