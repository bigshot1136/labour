import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { workerProfileSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'WORKER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = workerProfileSchema.parse(body)

    // Convert skills array to JSON string for SQLite
    const profileData = {
      ...validatedData,
      userId: user.id,
      skills: JSON.stringify(validatedData.skills),
      availability: JSON.stringify(validatedData.availability),
      portfolio: JSON.stringify([]) // Initialize empty portfolio
    }

    const workerProfile = await prisma.workerProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: profileData
    })

    return NextResponse.json(workerProfile)
  } catch (error) {
    console.error('Worker profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update worker profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: user.id },
      include: { user: true }
    })

    return NextResponse.json(workerProfile)
  } catch (error) {
    console.error('Worker profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch worker profile' },
      { status: 500 }
    )
  }
}