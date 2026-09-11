export type AuthSession = {
  email: string
  username: string
  phone?: string
  role: string
  accessToken: string
  refreshToken?: string
  loggedInAt: string
  rememberMe: boolean
}

// Demo login is intentionally disabled. Use the real backend auth flow instead.
// export const demoAccount = {
//   email: 'admin@icerp.io',
//   password: 'admin123',
//   username: 'Jane Doe',
//   role: 'Admin',
// }

const AUTH_STORAGE_KEY = 'icerp-auth-session'
const AUTH_SESSION_CHANGED_EVENT = 'icerp-auth-session-changed'

export const notifyAuthSessionChanged = () => {
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT))
}

export const readAuthSession = (): AuthSession | null => {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthSession) : null
  } catch {
    return null
  }
}

export const saveAuthSession = (session: AuthSession) => {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  notifyAuthSessionChanged()
}

export const clearAuthSession = () => {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  notifyAuthSessionChanged()
}

export const isAuthenticated = () => Boolean(readAuthSession())

export const loginWithCredentials = (_email: string, _password: string, _rememberMe = true): AuthSession => {
  throw new Error('演示账号已关闭，请使用真实后端账号登录。')
}

export const logout = () => {
  clearAuthSession()
}
