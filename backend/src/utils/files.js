import { unlink } from 'node:fs/promises'
import path from 'node:path'
import { uploadDirectory } from '../middleware/uploadMiddleware.js'

export async function removeStoredFile(storageName) {
  if (!storageName) return
  const filePath = path.join(uploadDirectory, path.basename(storageName))
  try {
    await unlink(filePath)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}
