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

function toFormData(values) {
  const formData = new FormData()
  formData.append('title', values.title.trim())
  formData.append('subject', values.subject.trim())
  formData.append('description', values.description.trim())
  formData.append('status', values.status)
  formData.append('groupId', values.groupId || 'community')
  if (values.file) formData.append('file', values.file)
  return formData
}

export async function getNotes(groupId) {
  const scope = groupId || 'community'
  return (await request(`/api/notes?groupId=${encodeURIComponent(scope)}`)).notes
}

export async function createNote(values) {
  return request('/api/notes', { method: 'POST', body: toFormData(values) })
}

export async function updateNote(id, values) {
  return request(`/api/notes/${id}`, { method: 'PUT', body: toFormData(values) })
}

export async function updateNoteStatus(id, status) {
  return request(`/api/notes/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export async function deleteNote(id) {
  return request(`/api/notes/${id}`, { method: 'DELETE' })
}
