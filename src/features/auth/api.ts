import axios from 'axios'
import apiClient from '../../lib/api/client'
import { clearAuthSession, loginWithCredentials, saveAuthSession, type AuthSession } from './session'
import type {
  AuthLoginApiResponse,
  AuthMeApiResponse,
  AuthUserDto,
  LoginRequest,
} from './types'

export type { AuthApiUser, AuthMeResponse, BackendLoginResponse, LoginPayload } from './types'

// 登录
export async function loginUser(payload: LoginRequest): Promise<AuthSession> {

  try {
    const { data } = await apiClient.post<AuthLoginApiResponse>('/auth/login', payload)

    const token = data?.data?.token ?? data?.data?.accessToken

    if (!data?.success || !token || !data.data?.user) {
      throw new Error(data?.message ?? '登录失败，请稍后重试。')
    }

    const session: AuthSession = {
      email: data.data.user.email ?? '',
      username: data.data.user.username ?? data.data.user.email ?? '',
      role: data.data.user.role ?? '',
      accessToken: token,
      refreshToken: data.data.refreshToken ?? '',
      loggedInAt: new Date().toISOString(),
      rememberMe: Boolean(payload.rememberMe),
    }

    saveAuthSession(session)
    return session
  } catch (error) {

    if (axios.isAxiosError(error) && error.response) {
      const responseData = error.response.data as AuthLoginApiResponse | undefined
      const errorMessage = responseData?.message ?? '登录失败，请稍后重试。'
      throw new Error(errorMessage)
    }

    try {
      return loginWithCredentials(payload.email, payload.password, payload.rememberMe ?? true)
    } catch (fallbackError) {
      throw new Error((fallbackError as Error).message ?? '登录失败，请稍后重试。')
    }
  }
}

// 获取当前登录用户信息
export async function getCurrentUser(): Promise<AuthUserDto> {
  const { data } = await apiClient.get<AuthMeApiResponse>('/auth/me')

  if (!data?.success || !data.data) {
    throw new Error(data?.message ?? '获取用户信息失败')
  }

  return data.data
}

// 刷新Token
export async function refreshAccessToken(): Promise<string> {
  const session = JSON.parse(window.localStorage.getItem('icerp-auth-session') ?? 'null') as AuthSession | null

  if (!session?.refreshToken) {
    throw new Error('Refresh token is missing')
  }

  const { data } = await apiClient.post<AuthLoginApiResponse>('/auth/refresh', {
    refreshToken: session.refreshToken,
  })

  const responseData = data?.data
  const nextToken = responseData?.token ?? responseData?.accessToken

  if (!data?.success || !responseData || !nextToken) {
    throw new Error(data?.message ?? 'Token refresh failed')
  }

  const nextSession: AuthSession = {
    ...session,
    accessToken: nextToken,
    refreshToken: responseData.refreshToken ?? session.refreshToken,
    loggedInAt: new Date().toISOString(),
  }

  saveAuthSession(nextSession)
  return nextSession.accessToken
}

// 登出
export async function logoutUser(): Promise<void> {
  const session = JSON.parse(window.localStorage.getItem('icerp-auth-session') ?? 'null') as AuthSession | null

  try {
    await apiClient.post('/auth/logout', {
      refreshToken: session?.refreshToken,
    })
  } catch {
    // Ignore API logout failures; local storage should still be cleared.
  }

  clearAuthSession()
}
