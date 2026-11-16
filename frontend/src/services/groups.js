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

function sendJson(path, values) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
}

export async function getGroups() {
  return (await request('/api/groups')).groups
}

export async function createGroup(values) {
  return (await sendJson('/api/groups', values)).group
}

export async function joinGroup(inviteCode) {
  return (await sendJson('/api/groups/join', { inviteCode })).group
}
