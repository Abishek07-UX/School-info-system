const BASE_URL = 'http://localhost:8080/api'

// React development mode may start the same read twice. Share only requests that
// are currently in flight; completed reads are never cached here.
const pendingReads = new Map()

export async function request(endpoint, options = {}, getToken) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  let token = null
  if (getToken) {
    try {
      token = await getToken()
      if (token) headers.Authorization = `Bearer ${token}`
    } catch (error) {
      console.warn('Could not retrieve auth token:', error)
    }
  }

  const perform = async () => {
    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = json?.error?.message || json?.message || `Request failed (${response.status})`
      const error = new Error(message)
      error.status = response.status
      throw error
    }
    return json.data !== undefined ? json.data : json
  }

  if ((options.method || 'GET').toUpperCase() !== 'GET') return perform()

  const key = `${token || ''}:${endpoint}`
  if (pendingReads.has(key)) return pendingReads.get(key)
  const pending = perform().finally(() => pendingReads.delete(key))
  pendingReads.set(key, pending)
  return pending
}
