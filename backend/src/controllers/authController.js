import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { HttpError } from '../utils/HttpError.js'
import { getJwtSecret } from '../utils/jwtSecret.js'

const sessionCookie = 'notehaven_session'
const sessionDurationMs = 8 * 60 * 60 * 1000

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

function setSessionCookie(response, user) {
  const token = jwt.sign(
    { name: user.name, email: user.email, role: user.role },
    getJwtSecret(),
    { subject: user.id, expiresIn: '8h' },
  )
  response.cookie(sessionCookie, token, {
    httpOnly: true,
    maxAge: sessionDurationMs,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

export async function register(request, response) {
  const name = String(request.body.name || '').trim()
  const email = normalizeEmail(request.body.email)
  const password = String(request.body.password || '')

  if (name.length < 2 || name.length > 80) {
    throw new HttpError(400, 'Name must be between 2 and 80 characters.')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new HttpError(400, 'Enter a valid email address.')
  }
  if (password.length < 10 || password.length > 128) {
    throw new HttpError(400, 'Password must be between 10 and 128 characters.')
  }

  try {
    const user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
    })
    setSessionCookie(response, user)
    response.status(201).json({ data: { user: publicUser(user) } })
  } catch (error) {
    if (error.code === 11000) throw new HttpError(409, 'An account with that email already exists.')
    throw error
  }
}

export async function login(request, response) {
  const email = normalizeEmail(request.body.email)
  const password = String(request.body.password || '')
  const user = await User.findOne({ email }).select('+passwordHash')
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false
  if (!passwordMatches) throw new HttpError(401, 'Email or password is incorrect.')

  setSessionCookie(response, user)
  response.json({ data: { user: publicUser(user) } })
}

export function getCurrentUser(request, response) {
  response.json({ data: { user: request.user } })
}

export function logout(_request, response) {
  response.clearCookie(sessionCookie, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  response.json({ data: { loggedOut: true } })
}
