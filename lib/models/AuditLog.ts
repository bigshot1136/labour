import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAuditLog extends Document {
  userId: string
  action: string
  resource: string
  resourceId?: string
  details: any
  ipAddress: string
  userAgent: string
  timestamp: Date
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'register', 'profile_update', 'job_create', 'job_update', 'job_delete',
      'application_create', 'application_update', 'contract_create', 'contract_sign',
      'payment_create', 'payment_update', 'report_create', 'user_verify', 'user_suspend'
    ]
  },
  resource: {
    type: String,
    required: true,
    enum: ['user', 'profile', 'job', 'application', 'contract', 'payment', 'report']
  },
  resourceId: {
    type: String
  },
  details: {
    type: Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
})

// Indexes
AuditLogSchema.index({ userId: 1 })
AuditLogSchema.index({ action: 1 })
AuditLogSchema.index({ resource: 1 })
AuditLogSchema.index({ timestamp: -1 })
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 }) // 1 year TTL

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)

export default AuditLog