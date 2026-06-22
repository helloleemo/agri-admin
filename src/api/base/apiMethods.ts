import { ApiError, type API_RESPONSE, type ApiErrorHolder, type RequestParams } from '../types/api'
import { getAccessToken } from '../utils'

let globalApiErrorHandler: ApiErrorHolder | undefined

const setApiErrorHandler = (handler?: ApiErrorHolder) => {
  globalApiErrorHandler = handler
}

const createHeader = () => {
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const bearer = getAccessToken()
  if (bearer) {
    header['Authorization'] = `Bearer ${bearer}`
  }
  return header
}

// response
export async function handleResponse<T>(res: Response): Promise<T> {
  // 204 - no content
  if (res.status === 204) {
    return undefined as T
  }

  // response - pasre json or text
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  let payload: unknown
  if (isJson) {
    try {
      payload = await res.json()
    } catch {
      payload = null
    }
  } else {
    try {
      payload = await res.text()
    } catch {
      payload = null
    }
  }

  const json = payload as Partial<API_RESPONSE<T>> | null

  if (!res.ok) {
    const messageFromPayload =
      typeof json?.message === 'string'
        ? json.message
        : typeof payload === 'string' && payload.trim()
          ? payload
          : `HTTP ${res.status}: ${res.statusText}`

    const statusCode =
      typeof json?.statusCode === 'string'
        ? json.statusCode
        : typeof json?.status_code === 'string'
          ? json.status_code
          : ''
    const error = new ApiError(statusCode, messageFromPayload, res.status)

    globalApiErrorHandler?.(error)

    throw error
  }

  // 200 + false
  if (json && typeof json.success === 'boolean' && !json.success) {
    const statusCode =
      typeof json.statusCode === 'string'
        ? json.statusCode
        : typeof json.status_code === 'string'
          ? json.status_code
          : 'E000000'
    const message = typeof json.message === 'string' ? json.message : 'Unknown API error'
    const error = new ApiError(statusCode, message, res.status)

    globalApiErrorHandler?.(error)

    throw error
  }

  // 200
  if (json && 'data' in json) {
    return json.data as T
  }

  return payload as T
}
//
const buildQueryString = (params?: RequestParams) => {
  if (!params) return ''
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, String(v)))
      } else {
        query.append(key, String(value))
      }
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const request = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  baseUrl: string,
  endpoint: string,
  options?: {
    params?: RequestParams
    body?: unknown
  },
): Promise<T> => {
  const queryString = buildQueryString(options?.params)
  const url = `${baseUrl}${endpoint}${queryString}`

  const headers = createHeader()
  const hasBody = options?.body !== undefined && options?.body !== null

  const res = await fetch(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(options?.body) : undefined,
  })

  return handleResponse<T>(res)
}

// GET
const GET = async <T>(baseUrl: string, endpoint: string, params?: RequestParams): Promise<T> => {
  return request<T>('GET', baseUrl, endpoint, { params })
}

// POST
const POST = async <T>(
  baseUrl: string,
  endpoint: string,
  body?: unknown,
  params?: RequestParams,
): Promise<T> => {
  return request<T>('POST', baseUrl, endpoint, { params, body })
}

// PUT
const PUT = async <T>(
  baseUrl: string,
  endpoint: string,
  body?: unknown,
  params?: RequestParams,
): Promise<T> => {
  return request<T>('PUT', baseUrl, endpoint, { params, body })
}

// PATCH
const PATCH = async <T>(
  baseUrl: string,
  endpoint: string,
  body?: unknown,
  params?: RequestParams,
): Promise<T> => {
  return request<T>('PATCH', baseUrl, endpoint, { params, body })
}

// DELETE
const DELETE = async <T>(
  baseUrl: string,
  endpoint: string,
  body?: unknown,
  params?: RequestParams,
): Promise<T> => {
  return request<T>('DELETE', baseUrl, endpoint, { params, body })
}

export { createHeader, setApiErrorHandler, GET, POST, PUT, PATCH, DELETE }
