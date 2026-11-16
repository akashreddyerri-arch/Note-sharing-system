import { randomBytes } from 'node:crypto'

const developmentSecret = randomBytes(32).toString('hex')

export function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.')
  }
  return developmentSecret
}
