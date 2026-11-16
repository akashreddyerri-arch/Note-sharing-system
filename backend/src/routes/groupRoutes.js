import { Router } from 'express'
import { createGroup, getGroup, joinGroup, listGroups } from '../controllers/groupController.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(listGroups))
router.post('/', asyncHandler(createGroup))
router.post('/join', asyncHandler(joinGroup))
router.get('/:id', asyncHandler(getGroup))

export default router
