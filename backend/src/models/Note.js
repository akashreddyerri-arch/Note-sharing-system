import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 120,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 60,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  storageName: {
    type: String,
    required: true,
    select: false,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, { timestamps: { createdAt: 'uploadedAt', updatedAt: true } })

noteSchema.index({ status: 1, uploadedAt: -1 })
noteSchema.index({ subject: 1 })
noteSchema.index({ owner: 1, uploadedAt: -1 })
noteSchema.index({ groupId: 1, status: 1, uploadedAt: -1 })
noteSchema.set('toJSON', {
  transform(_document, value) {
    delete value.storageName
    delete value.__v
    return value
  },
})

export default mongoose.model('Note', noteSchema)
