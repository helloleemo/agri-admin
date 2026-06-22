import BASE_URL from '../base/apiBaseUrl'
import { API_ENDPOINT } from '../base/apiEndpoint'
import { GET, POST } from '../base/apiMethods'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationEmailRequest,
  TokenResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '../types/auth'

export const authService = {
  login: async (payload: LoginRequest) => {
    return POST<LoginResponse>(BASE_URL, API_ENDPOINT.LOGIN, payload)
  },
  register: async (payload: RegisterRequest) => {
    return POST<RegisterResponse>(BASE_URL, API_ENDPOINT.REGISTER, payload)
  },
  verifyEmail: async (payload: VerifyEmailRequest) => {
    return POST<VerifyEmailResponse>(BASE_URL, API_ENDPOINT.VERIFY_EMAIL, payload)
  },
  resendVerificationEmail: async (payload: ResendVerificationEmailRequest) => {
    return POST<RegisterResponse | null>(BASE_URL, API_ENDPOINT.RESEND_VERIFICATION_EMAIL, payload)
  },
  me: async () => {
    return GET<LoginResponse['user']>(BASE_URL, API_ENDPOINT.GET_USER_INFO)
  },
  token: async (username: string, password: string) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)

    const res = await fetch(`${BASE_URL}${API_ENDPOINT.TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    return (await res.json()) as TokenResponse
  },
}
