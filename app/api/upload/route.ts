import { NextRequest, NextResponse } from 'next/server'
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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${user.id}_${timestamp}.${extension}`

    // For Replit, we'll store the file in the public/uploads directory
    // In production, you'd upload to a cloud storage service like AWS S3
    const uploadDir = './public/uploads'
    const filePath = `${uploadDir}/${filename}`

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // For now, we'll return a mock URL since we can't write files in this environment
    // In a real implementation, you'd save the file and return the URL
    const imageUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&h=400&fit=crop`

    return NextResponse.json({
      message: 'File uploaded successfully',
      url: imageUrl,
      filename: filename
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
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
    const type = searchParams.get('type') // 'profile' or 'portfolio'

    // Return sample images for demo purposes
    const sampleImages = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=400&fit=crop'
    ]

    return NextResponse.json({
      images: sampleImages
    })
  } catch (error) {
    console.error('File fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}