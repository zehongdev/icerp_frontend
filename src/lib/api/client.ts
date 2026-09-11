import axios from 'axios'
import { clearAuthSession, readAuthSession } from '../../features/auth/session'

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:9001'

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const session = readAuthSession()
  const accessToken = session?.accessToken

  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = 'Bearer ' + accessToken
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession()

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
