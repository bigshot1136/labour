import { z } from 'zod'

export const phoneSchema = z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid phone number format")

export const pincodeSchema = z.string().regex(/^\d{6}$/, "Invalid pincode format")

export const userRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: phoneSchema,
  role: z.enum(['CUSTOMER', 'WORKER']),
  address: z.string().optional(),
  pincode: pincodeSchema.optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  language: z.enum(['en', 'hi']).default('en'),
})

export const workerProfileSchema = z.object({
  age: z.number().min(18, "Must be at least 18 years old").max(65, "Must be under 65"),
  aadhaar: z.string().regex(/^\d{12}$/, "Invalid Aadhaar number"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  experience: z.string().min(1, "Experience is required"),
  dailyRate: z.number().min(100, "Daily rate must be at least ₹100"),
  hourlyRate: z.number().min(50, "Hourly rate must be at least ₹50"),
  projectRate: z.number().min(500, "Project rate must be at least ₹500"),
  availability: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
  }),
  location: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
})

export const bookingSchema = z.object({
  workerId: z.string(),
  jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
  workDate: z.date(),
  workTime: z.string(),
  location: z.string().min(5, "Location must be at least 5 characters"),
  pincode: pincodeSchema,
  amount: z.number().min(100, "Amount must be at least ₹100"),
})

export const messageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
})

export const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500, "Comment too long").optional(),
})

export const otpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, "OTP must be 6 digits"),
})

export const bookingUpdateSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  workerNotes: z.string().max(500).optional(),
  customerNotes: z.string().max(500).optional(),
})

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  pincode: pincodeSchema.optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  language: z.enum(['en', 'hi']).optional(),
  profilePic: z.string().url().optional(),
})

export const workerProfileUpdateSchema = z.object({
  age: z.number().min(18).max(65).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  dailyRate: z.number().min(100).optional(),
  hourlyRate: z.number().min(50).optional(),
  projectRate: z.number().min(500).optional(),
  availability: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
  }).optional(),
  location: z.string().optional(),
  bio: z.string().max(500).optional(),
  isAvailable: z.boolean().optional(),
  portfolio: z.array(z.string().url()).optional(),
})