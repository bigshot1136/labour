import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPayment extends Document {
  contractId: string
  payerId: string
  payeeId: string
  amount: number
  currency: string
  type: 'advance' | 'milestone' | 'completion' | 'bonus'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  paymentMethod: 'upi' | 'bank_transfer' | 'cash' | 'wallet'
  transactionId?: string
  gatewayResponse?: any
  milestoneId?: string
  description: string
  dueDate?: Date
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>({
  contractId: {
    type: String,
    required: true,
    ref: 'Contract'
  },
  payerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  payeeId: {
    type: String,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    default: 'INR'
  },
  type: {
    type: String,
    enum: ['advance', 'milestone', 'completion', 'bonus'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'bank_transfer', 'cash', 'wallet'],
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  gatewayResponse: {
    type: Schema.Types.Mixed
  },
  milestoneId: {
    type: String
  },
  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  dueDate: {
    type: Date
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Indexes
PaymentSchema.index({ contractId: 1 })
PaymentSchema.index({ payerId: 1 })
PaymentSchema.index({ payeeId: 1 })
PaymentSchema.index({ status: 1 })
PaymentSchema.index({ createdAt: -1 })
PaymentSchema.index({ transactionId: 1 })

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)

export default Payment