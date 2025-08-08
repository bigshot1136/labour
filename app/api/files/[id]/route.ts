import { NextRequest, NextResponse } from 'next/server'
import { gridFSBucket } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = new ObjectId(params.id)
    
    // Get file info
    const files = await gridFSBucket.find({ _id: fileId }).toArray()
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    const file = files[0]
    
    // Create download stream
    const downloadStream = gridFSBucket.openDownloadStream(fileId)
    
    // Convert stream to response
    const chunks: Buffer[] = []
    
    return new Promise((resolve, reject) => {
      downloadStream.on('data', (chunk) => {
        chunks.push(chunk)
      })
      
      downloadStream.on('end', () => {
        const buffer = Buffer.concat(chunks)
        
        const response = new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': file.metadata?.contentType || 'application/octet-stream',
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000'
          }
        })
        
        resolve(response)
      })
      
      downloadStream.on('error', (error) => {
        console.error('File stream error:', error)
        reject(NextResponse.json(
          { error: 'Failed to stream file' },
          { status: 500 }
        ))
      })
    })
  } catch (error) {
    console.error('File fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    )
  }
}