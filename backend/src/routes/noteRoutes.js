import { Router } from 'express'
import {
  createNote,
  downloadNoteFile,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
  updateNoteStatus,
} from '../controllers/noteController.js'
import { uploadNoteFile } from '../middleware/uploadMiddleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(listNotes))
router.post('/', uploadNoteFile, asyncHandler(createNote))
router.get('/:id/download', asyncHandler(downloadNoteFile))
router.get('/:id', asyncHandler(getNote))
router.put('/:id', uploadNoteFile, asyncHandler(updateNote))
router.patch('/:id/status', asyncHandler(updateNoteStatus))
router.delete('/:id', asyncHandler(deleteNote))

export default router
