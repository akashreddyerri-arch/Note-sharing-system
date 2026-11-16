import 'dotenv/config'
import app from './app.js'
import { connectDatabase } from './config/database.js'

const port = Number(process.env.PORT) || 5000

try {
  await connectDatabase(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notehaven')
  app.listen(port, '127.0.0.1', () => {
    console.log(`Notehaven API listening on http://127.0.0.1:${port}`)
  })
} catch (error) {
  console.error(`Unable to start the API: ${error.message}`)
  process.exitCode = 1
}
