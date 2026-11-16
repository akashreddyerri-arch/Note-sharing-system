async function request(path, options = {}) {
  let response
  try {
    response = await fetch(path, options)
  } catch {
    throw new Error('Can’t reach the notes service. Make sure the API and MongoDB are running.')
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.message || 'Something went wrong. Please try again.')
    error.status = response.status
    throw error
  }
  return payload.data
}

function sendCredentials(path, values) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
}

export async function getCurrentUser() {
  try {
    return (await request('/api/auth/me')).user
  } catch (error) {
    if (error.status === 401) return null
    throw error
  }
}

export async function login(values) {
  return (await sendCredentials('/api/auth/login', values)).user
}

export async function register(values) {
  return (await sendCredentials('/api/auth/register', values)).user
}

export function logout() {
  return request('/api/auth/logout', { method: 'POST' })
}
