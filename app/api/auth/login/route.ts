import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { phoneSchema } from '@/lib/validations'
import { generateAndSendOTP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const phone = phoneSchema.parse(body.phone)

    // Find user
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { workerProfile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please register first.' },
        { status: 404 }
      )
    }

    // Generate and send OTP
    const otpResult = await generateAndSendOTP(phone)
    
    if (!otpResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'OTP sent to your phone',
      userId: user.id,
      otp: otpResult.otp // Remove this in production
    })
  } catch (error: any) {
    console.error('Login error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}