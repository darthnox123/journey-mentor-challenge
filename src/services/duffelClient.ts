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

// User-facing copy — deliberately doesn't surface `error.message`, which is Duffel's
// raw API error text and not written for end users.
export function friendlyErrorMessage(error: unknown): string {
  if (error instanceof DuffelApiError) {
    if (error.status === 400 || error.status === 422) {
      return 'Check your search details and try again.'
    }
    if (error.status === 429) {
      return 'Too many requests — please wait a moment and try again.'
    }
    if (error.status >= 500) {
      return 'The flight search service is temporarily unavailable. Please try again shortly.'
    }
    return 'The flight search service is temporarily unavailable. Please try again later.'
  }
  return 'Something went wrong. Please try again.'
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
