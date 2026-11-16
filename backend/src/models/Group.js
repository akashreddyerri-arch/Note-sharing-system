import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 60,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 240,
    default: '',
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true })

groupSchema.index({ members: 1, updatedAt: -1 })

export default mongoose.model('Group', groupSchema)
