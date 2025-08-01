import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reviewSchema } from '@/lib/validations'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: { customer: true, worker: true }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.customerId !== user.id) {
      return NextResponse.json(
        { error: 'Only the customer can review this booking' },
        { status: 403 }
      )
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only review completed bookings' },
        { status: 400 }
      )
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId: validatedData.bookingId }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId: validatedData.bookingId,
        userId: user.id,
        rating: validatedData.rating,
        comment: validatedData.comment
      },
      include: {
        user: { select: { name: true, profilePic: true } },
        booking: { 
          select: { 
            jobDescription: true, 
            workDate: true,
            worker: { select: { name: true } }
          } 
        }
      }
    })

    // Update worker's average rating
    const workerReviews = await prisma.review.findMany({
      where: {
        booking: { workerId: booking.workerId }
      },
      select: { rating: true }
    })

    const avgRating = workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length

    await prisma.workerProfile.update({
      where: { userId: booking.workerId },
      data: { rating: Math.round(avgRating * 10) / 10 }
    })

    // Create notification for worker
    await prisma.notification.create({
      data: {
        userId: booking.workerId,
        title: 'New Review',
        message: `You received a ${validatedData.rating}-star review from ${user.name}`,
        type: 'SUCCESS'
      }
    })

    return NextResponse.json({
      message: 'Review created successfully',
      review
    })
  } catch (error: any) {
    console.error('Review creation error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid review data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!workerId) {
      return NextResponse.json(
        { error: 'Worker ID is required' },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: {
        booking: { workerId }
      },
      include: {
        user: { select: { name: true, profilePic: true } },
        booking: { 
          select: { 
            jobDescription: true, 
            workDate: true 
          } 
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.review.count({
      where: { booking: { workerId } }
    })

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}