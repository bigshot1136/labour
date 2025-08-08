import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IJob extends Document {
  contractorId: string
  title: string
  description: string
  skills: string[]
  location: {
    type: 'Point'
    coordinates: [number, number]
    address: string
    city: string
    state: string
    pincode: string
  }
  startDate: Date
  endDate?: Date
  duration: {
    value: number
    unit: 'hours' | 'days' | 'weeks' | 'months'
  }
  pay: {
    amount: number
    type: 'hourly' | 'daily' | 'project'
    currency: string
  }
  materialsRequired: string[]
  requirements: string[]
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'
  applicants: string[] // Application IDs
  selectedLabourer?: string
  contractId?: string
  urgency: 'low' | 'medium' | 'high'
  workingHours: {
    start: string
    end: string
    flexible: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const JobSchema = new Schema<IJob>({
  contractorId: {
    type: String,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 2000
  },
  skills: [{
    type: String,
    required: true,
    enum: [
      'Carpenter', 'Plumber', 'Electrician', 'Painter', 'Mason',
      'Cleaner', 'Gardner', 'Driver', 'Cook', 'Security Guard',
      'Handyman', 'Welder', 'Mechanic', 'Tailor', 'Barber'
    ]
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords: number[]) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90
        },
        message: 'Invalid coordinates'
      }
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    }
  },
  startDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(date: Date) {
        return date >= new Date()
      },
      message: 'Start date must be in the future'
    }
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(this: IJob, date: Date) {
        return !date || date > this.startDate
      },
      message: 'End date must be after start date'
    }
  },
  duration: {
    value: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      required: true
    }
  },
  pay: {
    amount: {
      type: Number,
      required: true,
      min: 100
    },
    type: {
      type: String,
      enum: ['hourly', 'daily', 'project'],
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  materialsRequired: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  applicants: [{
    type: String,
    ref: 'Application'
  }],
  selectedLabourer: {
    type: String,
    ref: 'User'
  },
  contractId: {
    type: String,
    ref: 'Contract'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
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
}, {
  timestamps: true
})

// Indexes
JobSchema.index({ contractorId: 1 })
JobSchema.index({ location: '2dsphere' })
JobSchema.index({ status: 1 })
JobSchema.index({ createdAt: -1 })
JobSchema.index({ startDate: 1 })
JobSchema.index({ skills: 1 })
JobSchema.index({ urgency: 1 })
JobSchema.index({ 'pay.amount': 1 })

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema)

export default Job