import mongoose from 'mongoose'
import path from 'node:path'
import Group from '../models/Group.js'
import Note from '../models/Note.js'
import { uploadDirectory } from '../middleware/uploadMiddleware.js'
import { HttpError } from '../utils/HttpError.js'
import { removeStoredFile } from '../utils/files.js'

function validateId(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid note ID.')
}

async function resolveGroupId(groupId, userId) {
  if (!groupId || groupId === 'community') return null
  const normalizedId = String(groupId)
  validateId(normalizedId)
  const group = await Group.exists({ _id: normalizedId, members: userId })
  if (!group) throw new HttpError(403, 'You must join this study group before sharing notes there.')
  return normalizedId
}

async function ensureGroupAccess(note, userId) {
  if (note.groupId) {
    const membership = await Group.exists({ _id: note.groupId, members: userId })
    if (!membership) throw new HttpError(404, 'Note not found.')
  }
  if (note.status !== 'active' && note.owner?.toString() !== userId) {
    throw new HttpError(404, 'Note not found.')
  }
}

function validateFields(body, currentStatus = 'active') {
  const title = String(body.title || '').trim()
  const subject = String(body.subject || '').trim()
  const description = String(body.description || '').trim()
  const status = body.status || currentStatus

  if (title.length < 2 || title.length > 120) {
    throw new HttpError(400, 'Title must be between 2 and 120 characters.')
  }
  if (subject.length < 2 || subject.length > 60) {
    throw new HttpError(400, 'Subject must be between 2 and 60 characters.')
  }
  if (description.length > 1000) {
    throw new HttpError(400, 'Description must be 1,000 characters or fewer.')
  }
  if (!['active', 'inactive'].includes(status)) {
    throw new HttpError(400, 'Status must be active or inactive.')
  }
  return { title, subject, description, status }
}

function fileDetails(file) {
  return {
    fileName: file.originalname,
    storageName: file.filename,
    fileSize: file.size,
    mimeType: file.mimetype,
  }
}

export async function listNotes(request, response) {
  const groupId = await resolveGroupId(request.query.groupId || 'community', request.user.id)
  const notes = await Note.find({
    groupId,
    $or: [{ status: 'active' }, { status: 'inactive', owner: request.user.id }],
  }).sort({ uploadedAt: -1 }).limit(200).lean()
  response.json({ data: { notes } })
}

export async function getNote(request, response) {
  validateId(request.params.id)
  const note = await Note.findById(request.params.id).lean()
  if (!note) throw new HttpError(404, 'Note not found.')
  await ensureGroupAccess(note, request.user.id)
  response.json({ data: note })
}

export async function createNote(request, response) {
  if (!request.file) throw new HttpError(400, 'Choose a file to upload.')
  try {
    const fields = validateFields(request.body)
    const groupId = await resolveGroupId(request.body.groupId, request.user.id)
    const note = new Note({ ...fields, ...fileDetails(request.file), owner: request.user.id, groupId })
    note.fileUrl = `/api/notes/${note.id}/download`
    await note.save()
    response.status(201).json({ data: note })
  } catch (error) {
    await removeStoredFile(request.file.filename)
    throw error
  }
}

export async function updateNote(request, response) {
  const incomingStorageName = request.file?.filename
  let previousStorageName
  let note
  try {
    validateId(request.params.id)
    note = await Note.findById(request.params.id).select('+storageName')
    if (!note) throw new HttpError(404, 'Note not found.')
    if (note.owner.toString() !== request.user.id) throw new HttpError(403, 'You can only edit notes you shared.')
    const fields = validateFields(request.body, note.status)
    const groupId = await resolveGroupId(request.body.groupId ?? note.groupId, request.user.id)
    previousStorageName = note.storageName
    Object.assign(note, fields, { groupId })
    if (request.file) Object.assign(note, fileDetails(request.file))
    await note.save()
  } catch (error) {
    if (incomingStorageName) await removeStoredFile(incomingStorageName)
    throw error
  }

  if (incomingStorageName) await removeStoredFile(previousStorageName)
  response.json({ data: note })
}

export async function updateNoteStatus(request, response) {
  validateId(request.params.id)
  const { status } = request.body
  if (!['active', 'inactive'].includes(status)) {
    throw new HttpError(400, 'Status must be active or inactive.')
  }
  const note = await Note.findOneAndUpdate(
    { _id: request.params.id, owner: request.user.id },
    { status },
    { new: true, runValidators: true },
  )
  if (!note) throw new HttpError(404, 'Note not found.')
  response.json({ data: note })
}

export async function deleteNote(request, response) {
  validateId(request.params.id)
  const note = await Note.findOneAndDelete({ _id: request.params.id, owner: request.user.id }).select('+storageName')
  if (!note) throw new HttpError(404, 'Note not found.')
  await removeStoredFile(note.storageName)
  response.json({ data: { id: note.id } })
}

export async function downloadNoteFile(request, response, next) {
  validateId(request.params.id)
  const note = await Note.findById(request.params.id).select('+storageName').lean()
  if (!note) throw new HttpError(404, 'Note not found.')
  await ensureGroupAccess(note, request.user.id)
  response.download(
    path.join(uploadDirectory, path.basename(note.storageName)),
    note.fileName,
    (error) => { if (error) next(error) },
  )
}
