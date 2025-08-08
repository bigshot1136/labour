import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import { MatchingService } from '@/lib/services/matching'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
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
    const { skill, experienceYears, location } = body

    if (!skill || experienceYears === undefined || !location) {
      return NextResponse.json(
        { error: 'Skill, experience years, and location are required' },
        { status: 400 }
      )
    }

    // Validate location format [lng, lat]
    if (!Array.isArray(location) || location.length !== 2) {
      return NextResponse.json(
        { error: 'Location must be an array of [longitude, latitude]' },
        { status: 400 }
      )
    }

    const suggestion = await MatchingService.suggestRates(
      skill,
      experienceYears,
      location
    )

    return NextResponse.json(suggestion)
  } catch (error: any) {
    console.error('Rate suggestion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to suggest rates' },
      { status: 500 }
    )
  }
}