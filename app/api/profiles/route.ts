import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Profile from '@/lib/models/Profile'
import User from '@/lib/models/User'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  photoUrl: z.string().url().optional(),
  contactPhone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid phone number'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experienceYears: z.number().min(0).max(50),
  location: z.object({
    coordinates: z.array(z.number()).length(2),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().regex(/^\d{6}$/).optional()
  }),
  rate: z.object({
    hourly: z.number().min(50).max(2000),
    daily: z.number().min(400).max(5000),
    project: z.number().min(1000).optional(),
    currency: z.string().default('INR')
  }),
  availability: z.object({
    monday: z.object({
      available: z.boolean(),
      slots: z.array(z.string())
    }),
    tuesday: z.object({
      available: z.boolean(),
      slots: z.array(z.string())
    }),
    wednesday: z.object({
      available: z.boolean(),
      slots: z.array(z.string())
    }),
    thursday: z.object({
      available: z.boolean(),
      slots: z.array(z.string())
    }),
    friday: z.object({
      available: z.boolean(),
      slots: z.array(z.string())
    }),
    saturday: z.object({
      available: z.boolean(),
      slots: z.array(z.string())
    }),
    sunday: z.object({
      available: z.boolean(),
      slots: z.array(z.string())
    })
  }),
  bio: z.string().max(500).optional(),
  languages: z.array(z.string()).optional(),
  isAvailable: z.boolean().default(true),
  liveLocationEnabled: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  try {
    await connectMongoose()

    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = profileSchema.parse(body)

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: user.id })
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists. Use PUT to update.' },
        { status: 400 }
      )
    }

    // Create profile with proper location format
    const profileData = {
      ...validatedData,
      userId: user.id,
      location: {
        type: 'Point',
        coordinates: validatedData.location.coordinates,
        address: validatedData.location.address,
        city: validatedData.location.city,
        state: validatedData.location.state,
        pincode: validatedData.location.pincode
      }
    }

    const profile = new Profile(profileData)
    await profile.save()

    return NextResponse.json({
      message: 'Profile created successfully',
      profile: profile.toObject()
    })
  } catch (error: any) {
    console.error('Profile creation error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid profile data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectMongoose()

    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const profile = await Profile.findOne({ userId: user.id })
      .populate('userId', 'email verified createdAt')

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(profile.toObject())
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectMongoose()

    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = profileSchema.partial().parse(body)

    // Update profile
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: user.id },
      {
        ...validatedData,
        ...(validatedData.location && {
          location: {
            type: 'Point',
            coordinates: validatedData.location.coordinates,
            address: validatedData.location.address,
            city: validatedData.location.city,
            state: validatedData.location.state,
            pincode: validatedData.location.pincode
          }
        })
      },
      { new: true, runValidators: true }
    )

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile.toObject()
    })
  } catch (error: any) {
    console.error('Profile update error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid profile data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}