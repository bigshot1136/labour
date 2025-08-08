import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProfile extends Document {
  userId: string
  name: string
  photoUrl?: string
  contactPhone: string
  skills: string[]
  experienceYears: number
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
    address?: string
    city?: string
    state?: string
    pincode?: string
  }
  rate: {
    hourly: number
    daily: number
    project?: number
    currency: string
  }
  availability: {
    monday: { available: boolean; slots: string[] }
    tuesday: { available: boolean; slots: string[] }
    wednesday: { available: boolean; slots: string[] }
    thursday: { available: boolean; slots: string[] }
    friday: { available: boolean; slots: string[] }
    saturday: { available: boolean; slots: string[] }
    sunday: { available: boolean; slots: string[] }
  }
  documents: Array<{
    type: 'id' | 'certificate' | 'license' | 'other'
    name: string
    url: string
    verified: boolean
    uploadedAt: Date
  }>
  rating: {
    avg: number
    count: number
    reviews: string[] // Review IDs
  }
  jobHistory: string[] // Job IDs
  bio?: string
  languages: string[]
  isAvailable: boolean
  liveLocationEnabled: boolean
  currentLocation?: {
    type: 'Point'
    coordinates: [number, number]
    updatedAt: Date
  }
  createdAt: Date
  updatedAt: Date
}

const ProfileSchema = new Schema<IProfile>({
  userId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  photoUrl: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  contactPhone: {
    type: String,
    required: true,
    match: [/^\+91[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
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
  experienceYears: {
    type: Number,
    required: true,
    min: 0,
    max: 50
  },
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
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90      // latitude
        },
        message: 'Invalid coordinates'
      }
    },
    address: String,
    city: String,
    state: String,
    pincode: {
      type: String,
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    }
  },
  rate: {
    hourly: {
      type: Number,
      required: true,
      min: 50,
      max: 2000
    },
    daily: {
      type: Number,
      required: true,
      min: 400,
      max: 5000
    },
    project: {
      type: Number,
      min: 1000
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  availability: {
    monday: {
      available: { type: Boolean, default: true },
      slots: [{ type: String, enum: ['morning', 'afternoon', 'evening', 'night'] }]
    },
    tuesday: {
      available: { type: Boolean, default: true },
      slots: [{ type: String, enum: ['morning', 'afternoon', 'evening', 'night'] }]
    },
    wednesday: {
      available: { type: Boolean, default: true },
      slots: [{ type: String, enum: ['morning', 'afternoon', 'evening', 'night'] }]
    },
    thursday: {
      available: { type: Boolean, default: true },
      slots: [{ type: String, enum: ['morning', 'afternoon', 'evening', 'night'] }]
    },
    friday: {
      available: { type: Boolean, default: true },
      slots: [{ type: String, enum: ['morning', 'afternoon', 'evening', 'night'] }]
    },
    saturday: {
      available: { type: Boolean, default: true },
      slots: [{ type: String, enum: ['morning', 'afternoon', 'evening', 'night'] }]
    },
    sunday: {
      available: { type: Boolean, default: false },
      slots: [{ type: String, enum: ['morning', 'afternoon', 'evening', 'night'] }]
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['id', 'certificate', 'license', 'other'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    avg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    reviews: [{
      type: String,
      ref: 'Review'
    }]
  },
  jobHistory: [{
    type: String,
    ref: 'Job'
  }],
  bio: {
    type: String,
    maxlength: 500
  },
  languages: [{
    type: String,
    enum: ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Odia', 'Malayalam', 'Punjabi']
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  liveLocationEnabled: {
    type: Boolean,
    default: false
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function(coords: number[]) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90
        },
        message: 'Invalid coordinates'
      }
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
})

// Indexes
ProfileSchema.index({ userId: 1 })
ProfileSchema.index({ skills: 1 })
ProfileSchema.index({ location: '2dsphere' })
ProfileSchema.index({ 'rating.avg': -1 })
ProfileSchema.index({ experienceYears: 1 })
ProfileSchema.index({ 'rate.hourly': 1 })
ProfileSchema.index({ 'rate.daily': 1 })
ProfileSchema.index({ isAvailable: 1 })
ProfileSchema.index({ currentLocation: '2dsphere' })

const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema)

export default Profile