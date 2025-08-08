import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Job from '@/lib/models/Job'
import Profile from '@/lib/models/Profile'
import { getUserFromRequest } from '@/lib/auth'
import { MessagingService } from '@/lib/services/messaging'
import { z } from 'zod'

const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  location: z.object({
    coordinates: z.array(z.number()).length(2),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode')
  }),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional(),
  duration: z.object({
    value: z.number().min(1),
    unit: z.enum(['hours', 'days', 'weeks', 'months'])
  }),
  pay: z.object({
    amount: z.number().min(100),
    type: z.enum(['hourly', 'daily', 'project']),
    currency: z.string().default('INR')
  }),
  materialsRequired: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  workingHours: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    flexible: z.boolean().default(false)
  })
})

export async function POST(request: NextRequest) {
  try {
    await connectMongoose()

    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'contractor') {
      return NextResponse.json(
        { error: 'Only contractors can create jobs' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = jobSchema.parse(body)

    // Validate start date is in the future
    if (validatedData.startDate <= new Date()) {
      return NextResponse.json(
        { error: 'Start date must be in the future' },
        { status: 400 }
      )
    }

    // Create job with proper location format
    const jobData = {
      ...validatedData,
      contractorId: user.id,
      location: {
        type: 'Point',
        coordinates: validatedData.location.coordinates,
        address: validatedData.location.address,
        city: validatedData.location.city,
        state: validatedData.location.state,
        pincode: validatedData.location.pincode
      },
      status: 'active'
    }

    const job = new Job(jobData)
    await job.save()

    // Notify nearby labourers with matching skills
    try {
      const nearbyLabourers = await Profile.find({
        skills: { $in: validatedData.skills },
        isAvailable: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: validatedData.location.coordinates
            },
            $maxDistance: 25000 // 25km radius
          }
        }
      }).populate('userId', 'email')

      // Send notifications (limit to top 10 matches)
      const notifications = nearbyLabourers.slice(0, 10).map(async (profile: any) => {
        if (profile.userId?.email) {
          await MessagingService.sendEmail({
            to: profile.userId.email,
            subject: `New Job Opportunity: ${validatedData.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #f97316;">New Job Opportunity</h1>
                <p>A new job matching your skills has been posted:</p>
                <p><strong>Title:</strong> ${validatedData.title}</p>
                <p><strong>Skills:</strong> ${validatedData.skills.join(', ')}</p>
                <p><strong>Location:</strong> ${validatedData.location.city}, ${validatedData.location.state}</p>
                <p><strong>Pay:</strong> ₹${validatedData.pay.amount} per ${validatedData.pay.type}</p>
                <p>Log in to your dashboard to view details and apply.</p>
                <p>Best regards,<br>The Labour Chowk Team</p>
              </div>
            `
          })
        }
      })

      await Promise.allSettled(notifications)
    } catch (notificationError) {
      console.error('Job notification error:', notificationError)
      // Don't fail job creation if notifications fail
    }

    return NextResponse.json({
      message: 'Job created successfully',
      job: job.toObject()
    })
  } catch (error: any) {
    console.error('Job creation error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid job data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectMongoose()

    const { searchParams } = new URL(request.url)
    const skill = searchParams.get('skill')
    const location = searchParams.get('location')
    const minPay = searchParams.get('minPay')
    const maxPay = searchParams.get('maxPay')
    const urgency = searchParams.get('urgency')
    const radius = parseInt(searchParams.get('radius') || '25') // km
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
    const query: any = { status: 'active' }

    if (skill) {
      query.skills = { $in: [skill] }
    }

    if (urgency) {
      query.urgency = urgency
    }

    if (minPay || maxPay) {
      query['pay.amount'] = {}
      if (minPay) query['pay.amount'].$gte = parseFloat(minPay)
      if (maxPay) query['pay.amount'].$lte = parseFloat(maxPay)
    }

    // Location-based search
    if (location) {
      try {
        // Parse location as "lat,lng"
        const [lat, lng] = location.split(',').map(parseFloat)
        if (!isNaN(lat) && !isNaN(lng)) {
          query.location = {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              },
              $maxDistance: radius * 1000 // Convert km to meters
            }
          }
        }
      } catch (locationError) {
        console.error('Location parsing error:', locationError)
      }
    }

    const jobs = await Job.find(query)
      .populate('contractorId', 'email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Job.countDocuments(query)

    return NextResponse.json({
      jobs: jobs.map(job => job.toObject()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Jobs fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}