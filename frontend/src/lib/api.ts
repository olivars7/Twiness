const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string)                  => request<T>('GET', path),
  post:   <T>(path: string, body: unknown)   => request<T>('POST', path, body),
  put:    <T>(path: string, body: unknown)   => request<T>('PUT', path, body),
  delete: <T>(path: string)                  => request<T>('DELETE', path),
}
