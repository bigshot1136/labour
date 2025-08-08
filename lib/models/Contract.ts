import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IContract extends Document {
  jobId: string
  contractorId: string
  labourerId: string
  terms: {
    startDate: Date
    endDate?: Date
    workingHours: {
      start: string
      end: string
    }
    payRate: {
      amount: number
      type: 'hourly' | 'daily' | 'project'
    }
    totalAmount: number
    paymentSchedule: 'advance' | 'completion' | 'milestone'
    milestones?: Array<{
      description: string
      amount: number
      dueDate: Date
      completed: boolean
      completedAt?: Date
    }>
  }
  responsibilities: {
    contractor: string[]
    labourer: string[]
  }
  materialsProvided: {
    byContractor: string[]
    byLabourer: string[]
  }
  status: 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'terminated'
  signatures: {
    contractor: {
      signed: boolean
      signedAt?: Date
      ipAddress?: string
    }
    labourer: {
      signed: boolean
      signedAt?: Date
      ipAddress?: string
    }
  }
  pdfUrl?: string
  createdAt: Date
  updatedAt: Date
}

const ContractSchema = new Schema<IContract>({
  jobId: {
    type: String,
    required: true,
    ref: 'Job'
  },
  contractorId: {
    type: String,
    required: true,
    ref: 'User'
  },
  labourerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  terms: {
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
      }
    },
    payRate: {
      amount: {
        type: Number,
        required: true,
        min: 50
      },
      type: {
        type: String,
        enum: ['hourly', 'daily', 'project'],
        required: true
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 100
    },
    paymentSchedule: {
      type: String,
      enum: ['advance', 'completion', 'milestone'],
      required: true
    },
    milestones: [{
      description: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      dueDate: {
        type: Date,
        required: true
      },
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: {
        type: Date
      }
    }]
  },
  responsibilities: {
    contractor: [{
      type: String,
      required: true
    }],
    labourer: [{
      type: String,
      required: true
    }]
  },
  materialsProvided: {
    byContractor: [{
      type: String
    }],
    byLabourer: [{
      type: String
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'signed', 'active', 'completed', 'terminated'],
    default: 'draft'
  },
  signatures: {
    contractor: {
      signed: {
        type: Boolean,
        default: false
      },
      signedAt: {
        type: Date
      },
      ipAddress: {
        type: String
      }
    },
    labourer: {
      signed: {
        type: Boolean,
        default: false
      },
      signedAt: {
        type: Date
      },
      ipAddress: {
        type: String
      }
    }
  },
  pdfUrl: {
    type: String
  }
}, {
  timestamps: true
})

// Indexes
ContractSchema.index({ jobId: 1 })
ContractSchema.index({ contractorId: 1 })
ContractSchema.index({ labourerId: 1 })
ContractSchema.index({ status: 1 })
ContractSchema.index({ createdAt: -1 })

const Contract: Model<IContract> = mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema)

export default Contract