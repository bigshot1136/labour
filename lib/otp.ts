import { prisma } from './prisma'

// OTP storage interface
interface OTPData {
  phone: string
  otp: string
  expiresAt: Date
  attempts: number
}

// In-memory OTP storage (for development)
// In production, use Redis or database
const otpStorage = new Map<string, OTPData>()

export class OTPService {
  private static instance: OTPService
  private maxAttempts = 3
  private otpExpiryMinutes = 10

  static getInstance(): OTPService {
    if (!OTPService.instance) {
      OTPService.instance = new OTPService()
    }
    return OTPService.instance
  }

  // Generate OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Store OTP
  async storeOTP(phone: string, otp: string): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + this.otpExpiryMinutes)

    const otpData: OTPData = {
      phone,
      otp,
      expiresAt,
      attempts: 0
    }

    otpStorage.set(phone, otpData)

    // Store in database for persistence
    try {
      await prisma.oTPSession.upsert({
        where: { phone },
        update: {
          otp,
          expiresAt,
          attempts: 0
        },
        create: {
          phone,
          otp,
          expiresAt,
          attempts: 0
        }
      })
    } catch (error) {
      console.error('Failed to store OTP in database:', error)
    }
  }

  // Verify OTP
  async verifyOTP(phone: string, inputOTP: string): Promise<boolean> {
    // First check in-memory storage
    const storedData = otpStorage.get(phone)
    
    if (storedData) {
      // Check if OTP is expired
      if (new Date() > storedData.expiresAt) {
        otpStorage.delete(phone)
        return false
      }

      // Check attempts
      if (storedData.attempts >= this.maxAttempts) {
        otpStorage.delete(phone)
        return false
      }

      // Increment attempts
      storedData.attempts++

      // Check OTP
      if (storedData.otp === inputOTP) {
        otpStorage.delete(phone)
        return true
      }

      return false
    }
    
    // If not in memory, check database
    try {
      const dbOtpSession = await prisma.oTPSession.findUnique({
        where: { phone }
      })
      
      if (!dbOtpSession) {
        return false
      }
      
      // Check if OTP is expired
      if (new Date() > dbOtpSession.expiresAt) {
        await prisma.oTPSession.delete({ where: { phone } })
        return false
      }
      
      // Check attempts
      if (dbOtpSession.attempts >= this.maxAttempts) {
        await prisma.oTPSession.delete({ where: { phone } })
        return false
      }
      
      // Increment attempts
      await prisma.oTPSession.update({
        where: { phone },
        data: { attempts: dbOtpSession.attempts + 1 }
      })
      
      // Check OTP
      if (dbOtpSession.otp === inputOTP) {
        await prisma.oTPSession.delete({ where: { phone } })
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to verify OTP from database:', error)
      return false
    }
  }

  // Send OTP via SMS
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    try {
      // Create OTP message
      const message = `Your Labour Chowk verification code is: ${otp}. Valid for ${this.otpExpiryMinutes} minutes.`
      
      // Import MSG91 service
      const { msg91Service } = await import('./msg91')
      
      // Send SMS using MSG91 service
      const result = await msg91Service.sendSMS(phone, message)
      
      // Return success status
      return result.success
      
    } catch (error) {
      console.error('Failed to send OTP:', error)
      return false
    }
  }

  // Generate and send OTP
  async generateAndSendOTP(phone: string): Promise<{ success: boolean; otp?: string }> {
    try {
      const otp = this.generateOTP()
      
      // Store OTP
      await this.storeOTP(phone, otp)
      
      // Send OTP
      const sent = await this.sendOTP(phone, otp)
      
      if (sent) {
        return { success: true, otp } // Return OTP for development
      } else {
        return { success: false }
      }
    } catch (error) {
      console.error('Failed to generate and send OTP:', error)
      return { success: false }
    }
  }

  // Check if OTP is valid (for development)
  async checkOTP(phone: string, inputOTP: string): Promise<boolean> {
    // For development, allow '123456' as a universal OTP
    if (inputOTP === '123456') {
      return true
    }
    
    return await this.verifyOTP(phone, inputOTP)
  }
}

// Export singleton instance
export const otpService = OTPService.getInstance()