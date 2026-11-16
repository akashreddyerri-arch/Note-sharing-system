import jwt from 'jsonwebtoken'
import { getJwtSecret } from '../utils/jwtSecret.js'

export function requireAuth(request, response, next) {
  const token = request.cookies?.notehaven_session
  if (!token) {
    response.status(401).json({ message: 'Please sign in to continue.' })
    return
  }

  try {
    const payload = jwt.verify(token, getJwtSecret())
    request.user = { id: payload.sub, name: payload.name, email: payload.email, role: payload.role }
    next()
  } catch {
    response.status(401).json({ message: 'Your session expired. Please sign in again.' })
  }
}
