import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skill = searchParams.get('skill')
    const location = searchParams.get('location')
    const minRate = searchParams.get('minRate')
    const maxRate = searchParams.get('maxRate')
    const minRating = searchParams.get('minRating')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {
      role: 'WORKER',
      isVerified: true,
      isActive: true,
      workerProfile: {
        isAvailable: true,
      }
    }

    if (skill) {
      where.workerProfile.skills = {
        has: skill
      }
    }

    if (location) {
      where.OR = [
        { address: { contains: location, mode: 'insensitive' } },
        { pincode: { contains: location } },
        { city: { contains: location, mode: 'insensitive' } },
        { state: { contains: location, mode: 'insensitive' } }
      ]
    }

    if (minRate || maxRate) {
      where.workerProfile.dailyRate = {}
      if (minRate) where.workerProfile.dailyRate.gte = parseFloat(minRate)
      if (maxRate) where.workerProfile.dailyRate.lte = parseFloat(maxRate)
    }

    if (minRating) {
      where.workerProfile.rating = {
        gte: parseFloat(minRating)
      }
    }

    const workers = await prisma.user.findMany({
      where,
      include: {
        workerProfile: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        workerProfile: {
          rating: 'desc'
        }
      }
    })

    const total = await prisma.user.count({ where })

    return NextResponse.json({
      workers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Workers fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workers' },
      { status: 500 }
    )
  }
}