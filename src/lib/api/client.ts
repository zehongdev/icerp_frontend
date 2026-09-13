import axios from 'axios'
import { clearAuthSession, readAuthSession } from '../../features/auth/session'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL must be set.')
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
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
    }

    return Promise.reject(error)
  },
)

export default apiClient
