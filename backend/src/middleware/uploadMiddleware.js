import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import multer from 'multer'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
export const uploadDirectory = path.resolve(currentDirectory, '../../uploads')
mkdirSync(uploadDirectory, { recursive: true })

const allowedTypes = new Map([
  ['.pdf', new Set(['application/pdf'])],
  ['.doc', new Set(['application/msword', 'application/octet-stream'])],
  ['.docx', new Set(['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'])],
  ['.ppt', new Set(['application/vnd.ms-powerpoint', 'application/octet-stream'])],
  ['.pptx', new Set(['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/octet-stream'])],
  ['.jpg', new Set(['image/jpeg'])],
  ['.jpeg', new Set(['image/jpeg'])],
  ['.png', new Set(['image/png'])],
  ['.webp', new Set(['image/webp'])],
])

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, uploadDirectory),
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    callback(null, `${randomUUID()}${extension}`)
  },
})

function filterFile(_request, file, callback) {
  const extension = path.extname(file.originalname).toLowerCase()
  const acceptedMimeTypes = allowedTypes.get(extension)
  if (!acceptedMimeTypes || !acceptedMimeTypes.has(file.mimetype)) {
    const error = new Error('Unsupported file type. Upload a PDF, Word, PowerPoint or PNG/JPG/WebP file.')
    error.status = 400
    callback(error)
    return
  }
  callback(null, true)
}

export const uploadNoteFile = multer({
  storage,
  fileFilter: filterFile,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
}).single('file')
