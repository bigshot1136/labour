import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { otpSchema } from '@/lib/validations'
import { generateToken, verifyOTP } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, otp } = otpSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { workerProfile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify OTP using the new service
    const isValidOTP = await verifyOTP(phone, otp)
    
    if (!isValidOTP) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    })

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      role: user.role
    })

    // Set cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isVerified: true,
        address: user.address,
        pincode: user.pincode,
        city: user.city,
        state: user.state,
        language: user.language,
        profilePic: user.profilePic,
        workerProfile: user.workerProfile
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error: any) {
    console.error('OTP verification error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'OTP verification failed' },
      { status: 500 }
    )
  }
}