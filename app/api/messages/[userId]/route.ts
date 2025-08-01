import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: params.userId },
          { senderId: params.userId, receiverId: user.id }
        ]
      },
      include: {
        sender: {
          select: { id: true, name: true }
        },
        receiver: {
          select: { id: true, name: true }
        }
      },
      orderBy: { timestamp: 'asc' }
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: params.userId,
        receiverId: user.id,
        isRead: false
      },
      data: { isRead: true }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}