import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import mongoose from 'mongoose'
import authRoutes from './routes/authRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import { requireAuth } from './middleware/requireAuth.js'
import noteRoutes from './routes/noteRoutes.js'

const app = express()

app.disable('x-powered-by')
app.use(cors({ origin: process.env.CLIENT_URL || 'http://127.0.0.1:5173', credentials: true }))
app.use(cookieParser())
app.use(express.json({ limit: '1mb' }))
app.get('/api/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1
  response.status(connected ? 200 : 503).json({
    data: { status: connected ? 'ok' : 'unavailable', database: connected ? 'connected' : 'disconnected' },
  })
})
app.use('/api/auth', authRoutes)
app.use('/api/groups', requireAuth, groupRoutes)
app.use('/api/notes', requireAuth, noteRoutes)

app.use((request, response) => {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.path}` })
})

app.use((error, _request, response, _next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    response.status(413).json({ message: 'File is larger than the 20 MB limit.' })
    return
  }
  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({ message: Object.values(error.errors).map((item) => item.message).join(' ') })
    return
  }
  if (error.name === 'MulterError') {
    response.status(400).json({ message: error.message })
    return
  }
  if (error.code === 11000) {
    response.status(409).json({ message: 'An account with that email already exists.' })
    return
  }
  const status = Number.isInteger(error.status) ? error.status : 500
  if (status >= 500) console.error(error)
  response.status(status).json({
    message: status >= 500 ? 'The server could not complete the request.' : error.message,
  })
})

export default app
