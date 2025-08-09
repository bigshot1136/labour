import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user statistics
    const stats = await getUserStats(user.id, user.role)
    
    // Get recent bookings
    const recentBookings = await getRecentBookings(user.id, user.role)
    
    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      stats,
      recentBookings,
      notifications
    })
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

async function getUserStats(userId: string, role: string) {
  if (role === 'WORKER') {
    const totalBookings = await prisma.booking.count({
      where: { workerId: userId }
    })

    const completedJobs = await prisma.booking.count({
      where: { workerId: userId, status: 'COMPLETED' }
    })

    const totalEarningsResult = await prisma.booking.aggregate({
      where: { workerId: userId, status: 'COMPLETED' },
      _sum: { amount: true }
    })

    const avgRatingResult = await prisma.review.aggregate({
      where: { booking: { workerId: userId } },
      _avg: { rating: true }
    })

    return {
      totalBookings,
      completedJobs,
      totalEarnings: totalEarningsResult._sum.amount || 0,
      averageRating: Math.round((avgRatingResult._avg.rating || 0) * 10) / 10
    }
  } else {
    const totalBookings = await prisma.booking.count({
      where: { customerId: userId }
    })

    const completedJobs = await prisma.booking.count({
      where: { customerId: userId, status: 'COMPLETED' }
    })

    return {
      totalBookings,
      completedJobs,
      totalEarnings: 0,
      averageRating: 0
    }
  }
}

async function getRecentBookings(userId: string, role: string) {
  const where = role === 'WORKER' 
    ? { workerId: userId }
    : { customerId: userId }

  return await prisma.booking.findMany({
    where,
    include: {
      customer: { select: { name: true, profilePic: true } },
      worker: { 
        select: { 
          name: true, 
          profilePic: true,
          workerProfile: { select: { skills: true, rating: true } }
        } 
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })
}