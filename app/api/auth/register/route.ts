import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { userRegistrationSchema } from '@/lib/validations'
import { generateAndSendOTP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = userRegistrationSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: validatedData.phone }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 400 }
      )
    }

    // Create user
    const user = await prisma.user.create({
      data: validatedData
    })

    // Generate and send OTP
    const otpResult = await generateAndSendOTP(validatedData.phone)
    
    if (!otpResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User registered successfully. OTP sent to phone.',
      userId: user.id,
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
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}