import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IApplication extends Document {
  jobId: string
  labourerId: string
  coverMessage: string
  proposedRate?: {
    amount: number
    type: 'hourly' | 'daily' | 'project'
  }
  availability: {
    startDate: Date
    endDate?: Date
    workingHours: {
      start: string
      end: string
      flexible: boolean
    }
  }
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  contractorResponse?: {
    message: string
    respondedAt: Date
  }
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema = new Schema<IApplication>({
  jobId: {
    type: String,
    required: true,
    ref: 'Job'
  },
  labourerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  coverMessage: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  proposedRate: {
    amount: {
      type: Number,
      min: 50
    },
    type: {
      type: String,
      enum: ['hourly', 'daily', 'project']
    }
  },
  availability: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    workingHours: {
      start: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
      },
      end: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
      },
      flexible: {
        type: Boolean,
        default: false
      }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  contractorResponse: {
    message: {
      type: String,
      maxlength: 500
    },
    respondedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
})

// Compound index to prevent duplicate applications
ApplicationSchema.index({ jobId: 1, labourerId: 1 }, { unique: true })
ApplicationSchema.index({ jobId: 1 })
ApplicationSchema.index({ labourerId: 1 })
ApplicationSchema.index({ status: 1 })
ApplicationSchema.index({ createdAt: -1 })

const Application: Model<IApplication> = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema)

export default Application