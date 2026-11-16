import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import Group from '../models/Group.js'
import { HttpError } from '../utils/HttpError.js'

function presentGroup(group) {
  return {
    id: group.id || group._id.toString(),
    name: group.name,
    description: group.description,
    inviteCode: group.inviteCode,
    createdBy: group.createdBy.toString(),
    memberCount: group.members.length,
  }
}

function validateGroupName(value) {
  const name = String(value || '').trim()
  if (name.length < 2 || name.length > 60) {
    throw new HttpError(400, 'Group name must be between 2 and 60 characters.')
  }
  return name
}

export async function listGroups(request, response) {
  const groups = await Group.find({ members: request.user.id }).sort({ name: 1 })
  response.json({ data: { groups: groups.map(presentGroup) } })
}

export async function createGroup(request, response) {
  const name = validateGroupName(request.body.name)
  const description = String(request.body.description || '').trim()
  if (description.length > 240) throw new HttpError(400, 'Group description must be 240 characters or fewer.')

  const group = await Group.create({
    name,
    description,
    inviteCode: randomBytes(8).toString('hex').toUpperCase(),
    createdBy: request.user.id,
    members: [request.user.id],
  })
  response.status(201).json({ data: { group: presentGroup(group) } })
}

export async function joinGroup(request, response) {
  const inviteCode = String(request.body.inviteCode || '').trim().toUpperCase()
  if (!/^[A-F0-9]{16}$/.test(inviteCode)) {
    throw new HttpError(400, 'Enter a valid 16-character invite code.')
  }

  const group = await Group.findOneAndUpdate(
    { inviteCode },
    { $addToSet: { members: request.user.id } },
    { new: true },
  )
  if (!group) throw new HttpError(404, 'No study group matches that invite code.')
  response.json({ data: { group: presentGroup(group) } })
}

export async function getGroup(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) throw new HttpError(400, 'Invalid group ID.')
  const group = await Group.findOne({ _id: request.params.id, members: request.user.id })
  if (!group) throw new HttpError(404, 'Study group not found.')
  response.json({ data: { group: presentGroup(group) } })
}
