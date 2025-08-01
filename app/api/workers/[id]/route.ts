import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const worker = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        workerProfile: true,
        reviews: {
          include: {
            user: { select: { name: true, profilePic: true } },
            booking: { select: { jobDescription: true, workDate: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        workerBookings: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!worker || worker.role !== 'WORKER') {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    // Calculate average rating
    const avgRating = worker.reviews.length > 0
      ? worker.reviews.reduce((sum, review) => sum + review.rating, 0) / worker.reviews.length
      : 0

    // Get booking statistics
    const bookingStats = await prisma.booking.groupBy({
      by: ['status'],
      where: { workerId: params.id },
      _count: { status: true }
    })

    const response = {
      ...worker,
      workerProfile: {
        ...worker.workerProfile,
        avgRating: Math.round(avgRating * 10) / 10
      },
      bookingStats: bookingStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Worker fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch worker details' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { workerProfile, ...userData } = body

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: userData,
      include: { workerProfile: true }
    })

    // Update worker profile if provided
    if (workerProfile) {
      await prisma.workerProfile.update({
        where: { userId: params.id },
        data: workerProfile
      })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Worker update error:', error)
    return NextResponse.json(
      { error: 'Failed to update worker' },
      { status: 500 }
    )
  }
}