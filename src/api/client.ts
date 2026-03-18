import axios, { type AxiosError, type AxiosResponse } from 'axios'
import type { ProblemDetails } from './types'

// ─── Typed Error Classes ──────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number
  instance: string | undefined

  constructor(status: number, message: string, instance?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.instance = instance
  }
}

export class ValidationError extends ApiError {
  errors: Record<string, string[]>

  constructor(errors: Record<string, string[]>, instance?: string) {
    super(400, 'Validation Failed', instance)
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export class ConcurrencyError extends ApiError {
  constructor(message: string, instance?: string) {
    super(409, message, instance)
    this.name = 'ConcurrencyError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string, instance?: string) {
    super(404, message, instance)
    this.name = 'NotFoundError'
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Network error — please check your connection')
    this.name = 'NetworkError'
  }
}

// ─── ETag Map ────────────────────────────────────────────────────────────────

const etagMap = new Map<string, string>()

export function clearEtag(url: string) {
  etagMap.delete(url)
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: { 'Content-Type': 'application/json' },
})

// Response interceptor: store ETags, normalise errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const etag = response.headers['etag'] as string | undefined
    if (etag && response.config.url) {
      etagMap.set(response.config.url, etag)
    }
    return response
  },
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(new NetworkError())
    }
    const { status, data, config } = error.response
    const problem = data as ProblemDetails
    const instance = problem?.instance ?? config?.url

    if (status === 400 && problem?.errors) {
      const errors = problem.errors as Record<string, string[]>
      return Promise.reject(new ValidationError(errors, instance))
    }
    if (status === 404) {
      return Promise.reject(new NotFoundError(problem?.title ?? 'Not found', instance))
    }
    if (status === 409) {
      return Promise.reject(new ConcurrencyError(problem?.title ?? 'Concurrency conflict', instance))
    }
    return Promise.reject(new ApiError(status, problem?.title ?? 'Unexpected error', instance))
  }
)

// Request interceptor: inject If-Match for mutating methods
apiClient.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase()
  if ((method === 'put' || method === 'patch' || method === 'delete') && config.url) {
    const etag = etagMap.get(config.url)
    if (etag) {
      config.headers['If-Match'] = etag
    }
  }
  return config
})

export default apiClient
