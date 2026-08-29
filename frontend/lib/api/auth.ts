import apiClient from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  role: string
  phone?: string
}

export interface User {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
  phone: string | null
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const { data } = await apiClient.post('/api/v1/auth/login', { email, password })
  return data
}

export async function register(req: RegisterRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post('/api/v1/auth/register', req)
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get('/api/v1/auth/me')
  return data
}
