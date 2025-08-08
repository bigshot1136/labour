import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import { FraudDetectionService } from '@/lib/services/fraud-detection'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectMongoose()

    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const result = await FraudDetectionService.checkUser(userId)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Fraud check error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check user' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectMongoose()

    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Run auto-flagging for recent users
    await FraudDetectionService.autoFlagUsers()

    return NextResponse.json({
      message: 'Auto-flagging completed successfully'
    })
  } catch (error: any) {
    console.error('Auto-flagging error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run auto-flagging' },
      { status: 500 }
    )
  }
}