import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import Job from '@/lib/models/Job'
import User from '@/lib/models/User'
import { getUserFromRequest } from '@/lib/auth'
import { MessagingService } from '@/lib/services/messaging'
import { z } from 'zod'

const applicationSchema = z.object({
  jobId: z.string(),
  coverMessage: z.string().min(10, 'Cover message must be at least 10 characters'),
  proposedRate: z.object({
    amount: z.number().min(50),
    type: z.enum(['hourly', 'daily', 'project'])
  }).optional(),
  availability: z.object({
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)).optional(),
    workingHours: z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      flexible: z.boolean().default(false)
    })
  })
})

export async function POST(request: NextRequest) {
  try {
    await connectMongoose()

    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'labourer') {
      return NextResponse.json(
        { error: 'Only labourers can apply for jobs' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = applicationSchema.parse(body)

    // Check if job exists and is active
    const job = await Job.findById(validatedData.jobId)
      .populate('contractorId', 'email name')

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (job.status !== 'active') {
      return NextResponse.json(
        { error: 'Job is no longer accepting applications' },
        { status: 400 }
      )
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId: validatedData.jobId,
      labourerId: user.id
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 400 }
      )
    }

    // Create application
    const application = new Application({
      ...validatedData,
      labourerId: user.id,
      status: 'pending'
    })

    await application.save()

    // Add application to job's applicants list
    await Job.findByIdAndUpdate(
      validatedData.jobId,
      { $push: { applicants: application._id } }
    )

    // Notify contractor
    try {
      if (job.contractorId && (job.contractorId as any).email) {
        await MessagingService.sendJobApplicationNotification(
          (job.contractorId as any).email,
          job.title,
          user.name || 'A labourer'
        )
      }
    } catch (notificationError) {
      console.error('Application notification error:', notificationError)
      // Don't fail application if notification fails
    }

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: application.toObject()
    })
  } catch (error: any) {
    console.error('Application creation error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid application data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit application' },
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

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query based on user role
    const query: any = {}
    
    if (user.role === 'labourer') {
      query.labourerId = user.id
    } else if (user.role === 'contractor') {
      // Get applications for contractor's jobs
      const contractorJobs = await Job.find({ contractorId: user.id }).select('_id')
      const jobIds = contractorJobs.map(job => job._id)
      query.jobId = { $in: jobIds }
    }

    if (jobId) {
      query.jobId = jobId
    }

    if (status) {
      query.status = status
    }

    const applications = await Application.find(query)
      .populate('jobId', 'title description pay location')
      .populate('labourerId', 'email name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Application.countDocuments(query)

    return NextResponse.json({
      applications: applications.map(app => app.toObject()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}