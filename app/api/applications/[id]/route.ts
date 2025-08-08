import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import Job from '@/lib/models/Job'
import User from '@/lib/models/User'
import { getUserFromRequest } from '@/lib/auth'
import { MessagingService } from '@/lib/services/messaging'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { status, contractorResponse } = body

    const application = await Application.findById(params.id)
      .populate('jobId')
      .populate('labourerId', 'email name')

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const job = application.jobId as any

    // Check permissions
    if (user.role === 'contractor' && job.contractorId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    if (user.role === 'labourer' && application.labourerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update application
    const updateData: any = {}
    
    if (status && user.role === 'contractor') {
      updateData.status = status
      
      if (contractorResponse) {
        updateData.contractorResponse = {
          message: contractorResponse,
          respondedAt: new Date()
        }
      }

      // If accepted, update job status and selected labourer
      if (status === 'accepted') {
        await Job.findByIdAndUpdate(job._id, {
          status: 'in_progress',
          selectedLabourer: application.labourerId
        })

        // Reject other applications for this job
        await Application.updateMany(
          { 
            jobId: job._id, 
            _id: { $ne: application._id },
            status: 'pending'
          },
          { status: 'rejected' }
        )
      }
    }

    if (status === 'withdrawn' && user.role === 'labourer') {
      updateData.status = 'withdrawn'
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('jobId').populate('labourerId', 'email name')

    // Send notification email
    try {
      const labourer = updatedApplication.labourerId as any
      if (labourer?.email && status && user.role === 'contractor') {
        let subject = ''
        let message = ''

        switch (status) {
          case 'accepted':
            subject = `Application Accepted: ${job.title}`
            message = `Congratulations! Your application for "${job.title}" has been accepted.`
            break
          case 'rejected':
            subject = `Application Update: ${job.title}`
            message = `Thank you for your interest in "${job.title}". Unfortunately, we have selected another candidate.`
            break
        }

        if (subject && message) {
          await MessagingService.sendEmail({
            to: labourer.email,
            subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #f97316;">Application Update</h1>
                <p>${message}</p>
                ${contractorResponse ? `<p><strong>Message from contractor:</strong> ${contractorResponse}</p>` : ''}
                <p>Log in to your dashboard for more details.</p>
                <p>Best regards,<br>The Labour Chowk Team</p>
              </div>
            `
          })
        }
      }
    } catch (notificationError) {
      console.error('Application notification error:', notificationError)
      // Don't fail update if notification fails
    }

    return NextResponse.json({
      message: 'Application updated successfully',
      application: updatedApplication.toObject()
    })
  } catch (error) {
    console.error('Application update error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoose()

    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const application = await Application.findById(params.id)
      .populate('jobId')
      .populate('labourerId', 'email name')

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const job = application.jobId as any

    // Check permissions
    if (user.role === 'contractor' && job.contractorId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    if (user.role === 'labourer' && application.labourerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json(application.toObject())
  } catch (error) {
    console.error('Application fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}