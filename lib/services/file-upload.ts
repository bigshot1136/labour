import AWS from 'aws-sdk'
import multer from 'multer'
import { GridFSBucket } from 'mongodb'
import { gridFSBucket } from '../mongodb'
import { Readable } from 'stream'

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'labour-chowk-uploads'

export interface UploadResult {
  success: boolean
  url?: string
  filename?: string
  size?: number
  error?: string
}

export class FileUploadService {
  // Upload file to S3
  static async uploadToS3(file: Express.Multer.File, folder: string = 'general'): Promise<UploadResult> {
    try {
      if (!process.env.AWS_ACCESS_KEY_ID) {
        // Fallback to GridFS if S3 not configured
        return await this.uploadToGridFS(file, folder)
      }

      const filename = `${folder}/${Date.now()}-${file.originalname}`
      
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      }

      const result = await s3.upload(uploadParams).promise()

      return {
        success: true,
        url: result.Location,
        filename: filename,
        size: file.size
      }
    } catch (error: any) {
      console.error('S3 upload error:', error)
      return {
        success: false,
        error: error.message || 'Failed to upload to S3'
      }
    }
  }

  // Upload file to GridFS (MongoDB)
  static async uploadToGridFS(file: Express.Multer.File, folder: string = 'general'): Promise<UploadResult> {
    try {
      const filename = `${folder}/${Date.now()}-${file.originalname}`
      
      const uploadStream = gridFSBucket.openUploadStream(filename, {
        metadata: {
          contentType: file.mimetype,
          folder: folder,
          uploadedAt: new Date()
        }
      })

      const readableStream = new Readable()
      readableStream.push(file.buffer)
      readableStream.push(null)

      return new Promise((resolve, reject) => {
        readableStream.pipe(uploadStream)
          .on('error', (error) => {
            reject({
              success: false,
              error: error.message || 'Failed to upload to GridFS'
            })
          })
          .on('finish', () => {
            resolve({
              success: true,
              url: `/api/files/${uploadStream.id}`,
              filename: filename,
              size: file.size
            })
          })
      })
    } catch (error: any) {
      console.error('GridFS upload error:', error)
      return {
        success: false,
        error: error.message || 'Failed to upload to GridFS'
      }
    }
  }

  // Delete file from S3
  static async deleteFromS3(filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!process.env.AWS_ACCESS_KEY_ID) {
        return await this.deleteFromGridFS(filename)
      }

      const deleteParams = {
        Bucket: BUCKET_NAME,
        Key: filename
      }

      await s3.deleteObject(deleteParams).promise()

      return { success: true }
    } catch (error: any) {
      console.error('S3 delete error:', error)
      return {
        success: false,
        error: error.message || 'Failed to delete from S3'
      }
    }
  }

  // Delete file from GridFS
  static async deleteFromGridFS(filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find file by filename
      const files = await gridFSBucket.find({ filename }).toArray()
      
      if (files.length === 0) {
        return {
          success: false,
          error: 'File not found'
        }
      }

      // Delete the file
      await gridFSBucket.delete(files[0]._id)

      return { success: true }
    } catch (error: any) {
      console.error('GridFS delete error:', error)
      return {
        success: false,
        error: error.message || 'Failed to delete from GridFS'
      }
    }
  }

  // Get file stream from GridFS
  static getFileStream(fileId: string): any {
    try {
      return gridFSBucket.openDownloadStream(fileId)
    } catch (error) {
      console.error('GridFS stream error:', error)
      return null
    }
  }

  // Validate file type and size
  static validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,application/pdf').split(',')
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes`
      }
    }

    return { valid: true }
  }
}

// Multer configuration for file uploads
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const validation = FileUploadService.validateFile(file)
    if (validation.valid) {
      cb(null, true)
    } else {
      cb(new Error(validation.error))
    }
  }
})