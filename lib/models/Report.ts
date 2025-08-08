import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReport extends Document {
  reporterId: string
  reportedUserId: string
  type: 'fraud' | 'inappropriate_behavior' | 'poor_work_quality' | 'payment_issue' | 'safety_concern' | 'other'
  description: string
  evidence: Array<{
    type: 'image' | 'document' | 'screenshot'
    url: string
    description?: string
  }>
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  adminNotes?: string
  resolution?: string
  resolvedBy?: string
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ReportSchema = new Schema<IReport>({
  reporterId: {
    type: String,
    required: true,
    ref: 'User'
  },
  reportedUserId: {
    type: String,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['fraud', 'inappropriate_behavior', 'poor_work_quality', 'payment_issue', 'safety_concern', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 1000
  },
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'document', 'screenshot'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    description: {
      type: String,
      maxlength: 200
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  resolution: {
    type: String,
    maxlength: 1000
  },
  resolvedBy: {
    type: String,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Indexes
ReportSchema.index({ reporterId: 1 })
ReportSchema.index({ reportedUserId: 1 })
ReportSchema.index({ status: 1 })
ReportSchema.index({ priority: 1 })
ReportSchema.index({ createdAt: -1 })
ReportSchema.index({ type: 1 })

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema)

export default Report