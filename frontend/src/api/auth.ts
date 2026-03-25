import api from './axios'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  role: string
  user_id: string
}

export interface RegisterRequest {
  email: string
  password: string
  role: string
  first_name: string
  last_name: string
}

export const login = (data: LoginRequest) =>
  api.post<LoginResponse>('/auth/login', data).then((r) => r.data)

export const register = (data: RegisterRequest) =>
  api.post('/auth/register', data).then((r) => r.data)
