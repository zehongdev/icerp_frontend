// 登录请求
export type LoginRequest = {
  email: string
  password: string
  rememberMe?: boolean
}

export type LoginPayload = LoginRequest

export type AuthUserDto = {
  id?: string
  email?: string
  username?: string
  role?: string
  status?: string
}

export type AuthApiUser = AuthUserDto

// 登录响应
export type AuthLoginApiResponse = {
  success: boolean
  data?: {
    token?: string
    accessToken?: string
    refreshToken?: string
    user?: AuthUserDto
  }
  message?: string
}

export type BackendLoginResponse = AuthLoginApiResponse

// 获取当前登录用户信息响应
export type AuthMeApiResponse = {
  success: boolean
  data?: AuthUserDto
  message?: string
}

export type AuthMeResponse = AuthMeApiResponse
