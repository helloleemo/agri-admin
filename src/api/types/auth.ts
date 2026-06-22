import type { RoleCode } from './shared'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  user_name: string
  password: string
  role_code: RoleCode
}

export interface RegisterResponse {
  email: string
  verification_expires_in: number
}

export interface VerifyEmailRequest {
  token: string
}

export interface VerifyEmailResponse {
  email: string
  verified: boolean
}

export interface ResendVerificationEmailRequest {
  email: string
}

export interface AuthUser {
  id: string
  email: string
  user_name: string
  role_id: string
  role_code: RoleCode
}

export interface LoginResponse {
  access_token: string
  token_type: 'bearer'
  expires_in: number
  user: AuthUser
}

export interface TokenResponse {
  access_token: string
  token_type: 'bearer'
}
