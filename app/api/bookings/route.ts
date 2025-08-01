import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookingSchema } from '@/lib/validations'
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

    if (user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Only customers can create bookings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = bookingSchema.parse(body)

    // Check if worker exists and is available
    const worker = await prisma.user.findUnique({
      where: { id: validatedData.workerId },
      include: { workerProfile: true }
    })

    if (!worker || worker.role !== 'WORKER') {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    if (!worker.workerProfile?.isAvailable) {
      return NextResponse.json(
        { error: 'Worker is not available' },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: user.id,
        workerId: validatedData.workerId,
        jobDescription: validatedData.jobDescription,
        workDate: validatedData.workDate,
        workTime: validatedData.workTime,
        location: validatedData.location,
        pincode: validatedData.pincode,
        amount: validatedData.amount,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      },
      include: {
        customer: { select: { name: true, phone: true } },
        worker: { 
          select: { 
            name: true, 
            phone: true,
            workerProfile: { select: { skills: true, dailyRate: true } }
          } 
        }
      }
    })

    // Create notification for worker
    await prisma.notification.create({
      data: {
        userId: validatedData.workerId,
        title: 'New Booking Request',
        message: `You have received a new booking request from ${user.name} for ${validatedData.jobDescription}`,
        type: 'INFO'
      }
    })

    return NextResponse.json({
      message: 'Booking created successfully',
      booking
    })
  } catch (error: any) {
    console.error('Booking creation error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    
    if (user.role === 'CUSTOMER') {
      where.customerId = user.id
    } else if (user.role === 'WORKER') {
      where.workerId = user.id
    }

    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { name: true, phone: true, profilePic: true } },
        worker: { 
          select: { 
            name: true, 
            phone: true, 
            profilePic: true,
            workerProfile: { select: { skills: true, rating: true } }
          } 
        },
        review: { select: { rating: true, comment: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.booking.count({ where })

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Bookings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}