import type { DuffelErrorResponse } from '@/types/duffel'

export class DuffelApiError extends Error {
  status: number
  errors: DuffelErrorResponse['errors']

  constructor(message: string, status: number, errors: DuffelErrorResponse['errors']) {
    super(message)
    this.name = 'DuffelApiError'
    this.status = status
    this.errors = errors
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
  searchParams?: Record<string, string>
}

export async function duffelFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`/api/duffel/${path}`, window.location.origin)
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const errors = (payload as DuffelErrorResponse | null)?.errors ?? [
      { message: `Request failed with status ${response.status}` },
    ]
    throw new DuffelApiError(errors[0]?.message ?? 'Request failed', response.status, errors)
  }

  return payload as T
}
