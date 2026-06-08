interface API_RESPONSE<T> {
  success: boolean
  message: string
  statusCode?: string
  status_code?: string
  data?: T
}

export class ApiError extends Error {
  public statusCode: string
  public message: string
  public status?: number

  constructor(statusCode: string, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.message = message
    this.status = status
  }
}

type ApiErrorHolder = (error: ApiError) => void
type RequestParams = Record<string, unknown>
export type { ApiErrorHolder, API_RESPONSE, RequestParams }
