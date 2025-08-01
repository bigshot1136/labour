import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { messageSchema } from '@/lib/validations'
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
    const validatedData = messageSchema.parse(body)

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: validatedData.receiverId }
    })

    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId: validatedData.receiverId,
        content: validatedData.content,
        messageType: 'TEXT'
      },
      include: {
        sender: { select: { name: true, profilePic: true } },
        receiver: { select: { name: true, profilePic: true } }
      }
    })

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: validatedData.receiverId,
        title: 'New Message',
        message: `You have received a new message from ${user.name}`,
        type: 'INFO'
      }
    })

    return NextResponse.json({
      message: 'Message sent successfully',
      data: message
    })
  } catch (error: any) {
    console.error('Message creation error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid message data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to send message' },
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
    const otherUserId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get conversation messages
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: user.id }
        ]
      },
      include: {
        sender: { select: { name: true, profilePic: true } },
        receiver: { select: { name: true, profilePic: true } }
      },
      orderBy: { timestamp: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: user.id,
        isRead: false
      },
      data: { isRead: true }
    })

    const total = await prisma.message.count({
      where: {
        OR: [
          { senderId: user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: user.id }
        ]
      }
    })

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}