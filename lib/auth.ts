import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import { otpService } from './otp'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface JWTPayload {
  userId: string
  phone: string
  role: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

export async function getUserFromRequest(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { workerProfile: true }
    })

    return user
  } catch {
    return null
  }
}

// OTP functions using the new service
export async function generateAndSendOTP(phone: string): Promise<{ success: boolean; otp?: string }> {
  return await otpService.generateAndSendOTP(phone)
}

export async function verifyOTP(phone: string, inputOTP: string): Promise<boolean> {
  return await otpService.checkOTP(phone, inputOTP)
}

// Legacy functions for backward compatibility
export function generateOTP(): string {
  return otpService.generateOTP()
}