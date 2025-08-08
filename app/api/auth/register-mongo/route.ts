import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { MessagingService } from '@/lib/services/messaging'
import { FraudDetectionService } from '@/lib/services/fraud-detection'
import { generateAndSendOTP } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid phone number format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['labourer', 'contractor']),
  name: z.string().min(2, 'Name must be at least 2 characters')
})

export async function POST(request: NextRequest) {
  try {
    await connectMongoose()

    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email },
        { phone: validatedData.phone }
      ]
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 }
      )
    }

    // Create user
    const user = new User({
      email: validatedData.email,
      phone: validatedData.phone,
      passwordHash: validatedData.password, // Will be hashed by pre-save hook
      role: validatedData.role,
      verified: false
    })

    await user.save()

    // Run fraud detection
    try {
      const fraudCheck = await FraudDetectionService.checkUser(user._id)
      if (fraudCheck.recommendation === 'reject') {
        await User.findByIdAndUpdate(user._id, { isActive: false })
        return NextResponse.json(
          { error: 'Registration rejected due to security concerns' },
          { status: 403 }
        )
      }
    } catch (fraudError) {
      console.error('Fraud detection error:', fraudError)
      // Continue with registration even if fraud detection fails
    }

    // Generate and send OTP
    const otpResult = await generateAndSendOTP(validatedData.phone)
    
    if (!otpResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      )
    }

    // Send welcome email
    try {
      await MessagingService.sendWelcomeEmail(
        validatedData.email,
        validatedData.name,
        validatedData.role
      )
    } catch (emailError) {
      console.error('Welcome email error:', emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      message: 'User registered successfully. Please verify your phone number.',
      userId: user._id,
      otp: otpResult.otp // Remove this in production
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid registration data', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}