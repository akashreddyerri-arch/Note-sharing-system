import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { getCurrentUser, login, logout, register } from '../controllers/authController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({ message: 'Too many sign-in attempts. Please try again in 15 minutes.' })
  },
})

router.post('/register', loginLimiter, asyncHandler(register))
router.post('/login', loginLimiter, asyncHandler(login))
router.get('/me', (request, response, next) => {
  if (!request.cookies?.notehaven_session) {
    response.json({ data: { user: null } })
    return
  }
  requireAuth(request, response, () => getCurrentUser(request, response, next))
})
router.post('/logout', requireAuth, logout)

export default router
