import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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
        review: { select: { rating: true, comment: true, createdAt: true } }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this booking
    if (booking.customerId !== user.id && booking.workerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Booking fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, workerNotes, customerNotes } = body

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { customer: true, worker: true }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Validate status update permissions
    if (user.role === 'WORKER' && booking.workerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    if (user.role === 'CUSTOMER' && booking.customerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update booking
    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      
      // Update payment status when booking is completed
      if (status === 'COMPLETED') {
        updateData.paymentStatus = 'PAID'
      }
    }

    if (workerNotes && user.role === 'WORKER') {
      updateData.workerNotes = workerNotes
    }

    if (customerNotes && user.role === 'CUSTOMER') {
      updateData.customerNotes = customerNotes
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: { select: { name: true, phone: true } },
        worker: { select: { name: true, phone: true } }
      }
    })

    // Create notification
    const notificationData = {
      title: '',
      message: '',
      type: 'INFO' as const
    }

    if (status === 'ACCEPTED') {
      notificationData.title = 'Booking Accepted'
      notificationData.message = `${booking.worker.name} has accepted your booking request.`
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          ...notificationData
        }
      })
    } else if (status === 'REJECTED') {
      notificationData.title = 'Booking Rejected'
      notificationData.message = `${booking.worker.name} has rejected your booking request.`
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          ...notificationData
        }
      })
    } else if (status === 'IN_PROGRESS') {
      notificationData.title = 'Work Started'
      notificationData.message = `${booking.worker.name} has started the work.`
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          ...notificationData
        }
      })
    } else if (status === 'COMPLETED') {
      notificationData.title = 'Work Completed'
      notificationData.message = `${booking.worker.name} has completed the work. Please provide a review.`
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          ...notificationData
        }
      })
    }

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    })
  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}