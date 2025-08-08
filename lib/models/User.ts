import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: string
  email: string
  phone: string
  passwordHash: string
  role: 'labourer' | 'contractor' | 'admin'
  verified: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  refreshTokens: string[]
  comparePassword(candidatePassword: string): Promise<boolean>
  generateRefreshToken(): string
  revokeRefreshToken(token: string): void
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: [/^\+91[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['labourer', 'contractor', 'admin'],
    default: 'labourer',
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  refreshTokens: [{
    type: String
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash
      delete ret.refreshTokens
      return ret
    }
  }
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

// Generate refresh token
UserSchema.methods.generateRefreshToken = function(): string {
  const token = require('crypto').randomBytes(32).toString('hex')
  this.refreshTokens.push(token)
  return token
}

// Revoke refresh token
UserSchema.methods.revokeRefreshToken = function(token: string): void {
  this.refreshTokens = this.refreshTokens.filter((t: string) => t !== token)
}

// Indexes
UserSchema.index({ email: 1 })
UserSchema.index({ phone: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ verified: 1 })
UserSchema.index({ createdAt: -1 })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User