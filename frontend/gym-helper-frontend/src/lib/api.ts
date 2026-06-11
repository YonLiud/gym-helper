const BASE = '/api'

function httpMessage(status: number): string {
  if (status === 400) return 'Bad request'
  if (status === 403) return 'Access denied'
  if (status === 404) return 'Not found'
  if (status === 409) return 'Conflict — item may already exist'
  if (status === 422) return 'Invalid data'
  if (status === 429) return 'Too many requests — slow down'
  if (status >= 500) return 'Server error — try again in a moment'
  return 'Something went wrong'
}

function extractDetail(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined
  const b = body as Record<string, unknown>
  const raw = b.detail ?? b.message ?? b.error
  if (typeof raw === 'string') return raw
  // FastAPI 422 detail is an array of validation errors
  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0] as Record<string, unknown>
    return typeof first?.msg === 'string' ? first.msg : undefined
  }
  return undefined
}

async function request<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new Error('No connection — check your network')
  }

  if (res.status === 401) {
    const parsed = await res.json().catch(() => null)
    if (window.location.pathname !== '/login') {
      localStorage.removeItem('gym_user')
      window.location.href = '/login'
    }
    throw new Error(extractDetail(parsed) ?? 'Unauthorized')
  }

  if (!res.ok) {
    const parsed = await res.json().catch(() => null)
    throw new Error(extractDetail(parsed) ?? httpMessage(res.status))
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, undefined, signal),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
