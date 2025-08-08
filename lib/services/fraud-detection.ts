import User from '../models/User'
import Profile from '../models/Profile'
import Report from '../models/Report'
import AuditLog from '../models/AuditLog'
import { connectMongoose } from '../mongodb'

export interface FraudFlag {
  type: 'duplicate_phone' | 'duplicate_documents' | 'suspicious_activity' | 'fake_profile' | 'payment_fraud'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  evidence: any
  confidence: number
}

export interface FraudCheckResult {
  userId: string
  riskScore: number
  flags: FraudFlag[]
  recommendation: 'approve' | 'review' | 'reject' | 'suspend'
}

export class FraudDetectionService {
  // Main fraud detection function
  static async checkUser(userId: string): Promise<FraudCheckResult> {
    await connectMongoose()

    const user = await User.findById(userId)
    const profile = await Profile.findOne({ userId })
    
    if (!user) {
      throw new Error('User not found')
    }

    const flags: FraudFlag[] = []
    
    // Run all fraud checks
    flags.push(...await this.checkDuplicatePhone(user.phone, userId))
    flags.push(...await this.checkDuplicateDocuments(profile))
    flags.push(...await this.checkSuspiciousActivity(userId))
    flags.push(...await this.checkFakeProfile(profile))
    flags.push(...await this.checkReportHistory(userId))

    // Calculate risk score
    const riskScore = this.calculateRiskScore(flags)
    
    // Determine recommendation
    const recommendation = this.getRecommendation(riskScore, flags)

    return {
      userId,
      riskScore,
      flags,
      recommendation
    }
  }

  // Check for duplicate phone numbers
  private static async checkDuplicatePhone(phone: string, currentUserId: string): Promise<FraudFlag[]> {
    const duplicateUsers = await User.find({
      phone,
      _id: { $ne: currentUserId }
    })

    if (duplicateUsers.length > 0) {
      return [{
        type: 'duplicate_phone',
        severity: 'high',
        description: `Phone number ${phone} is already registered with ${duplicateUsers.length} other account(s)`,
        evidence: { duplicateUserIds: duplicateUsers.map(u => u._id) },
        confidence: 95
      }]
    }

    return []
  }

  // Check for duplicate documents
  private static async checkDuplicateDocuments(profile: any): Promise<FraudFlag[]> {
    if (!profile || !profile.documents || profile.documents.length === 0) {
      return []
    }

    const flags: FraudFlag[] = []

    for (const doc of profile.documents) {
      if (doc.type === 'id') {
        // Check for duplicate Aadhaar or similar ID documents
        const duplicateProfiles = await Profile.find({
          'documents.url': doc.url,
          userId: { $ne: profile.userId }
        })

        if (duplicateProfiles.length > 0) {
          flags.push({
            type: 'duplicate_documents',
            severity: 'critical',
            description: `ID document appears to be used by ${duplicateProfiles.length} other profile(s)`,
            evidence: { 
              documentUrl: doc.url,
              duplicateProfileIds: duplicateProfiles.map(p => p.userId)
            },
            confidence: 90
          })
        }
      }
    }

    return flags
  }

  // Check for suspicious activity patterns
  private static async checkSuspiciousActivity(userId: string): Promise<FraudFlag[]> {
    const flags: FraudFlag[] = []
    
    // Check for rapid account creation from same IP
    const recentLogs = await AuditLog.find({
      userId,
      action: 'register',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })

    if (recentLogs.length > 0) {
      const ipAddresses = recentLogs.map(log => log.ipAddress)
      const uniqueIPs = new Set(ipAddresses)
      
      if (uniqueIPs.size < ipAddresses.length / 2) {
        flags.push({
          type: 'suspicious_activity',
          severity: 'medium',
          description: 'Multiple accounts created from same IP address recently',
          evidence: { ipAddresses: Array.from(uniqueIPs) },
          confidence: 70
        })
      }
    }

    // Check for unusual login patterns
    const loginLogs = await AuditLog.find({
      userId,
      action: 'login',
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).sort({ timestamp: -1 }).limit(20)

    if (loginLogs.length > 15) {
      const locations = new Set(loginLogs.map(log => log.ipAddress))
      if (locations.size > 5) {
        flags.push({
          type: 'suspicious_activity',
          severity: 'medium',
          description: 'Logins from multiple locations in short time period',
          evidence: { uniqueLocations: locations.size, totalLogins: loginLogs.length },
          confidence: 60
        })
      }
    }

    return flags
  }

  // Check for fake profile indicators
  private static async checkFakeProfile(profile: any): Promise<FraudFlag[]> {
    if (!profile) {
      return [{
        type: 'fake_profile',
        severity: 'medium',
        description: 'No profile information provided',
        evidence: {},
        confidence: 50
      }]
    }

    const flags: FraudFlag[] = []

    // Check for generic/fake names
    const suspiciousNames = ['test', 'demo', 'fake', 'admin', 'user', 'temp']
    if (suspiciousNames.some(name => profile.name.toLowerCase().includes(name))) {
      flags.push({
        type: 'fake_profile',
        severity: 'high',
        description: 'Profile name appears to be fake or generic',
        evidence: { name: profile.name },
        confidence: 80
      })
    }

    // Check for unrealistic rates
    if (profile.rate) {
      if (profile.rate.hourly < 20 || profile.rate.hourly > 1000) {
        flags.push({
          type: 'fake_profile',
          severity: 'medium',
          description: 'Hourly rate appears unrealistic',
          evidence: { hourlyRate: profile.rate.hourly },
          confidence: 60
        })
      }
    }

    // Check for missing essential information
    const missingFields = []
    if (!profile.skills || profile.skills.length === 0) missingFields.push('skills')
    if (!profile.experienceYears) missingFields.push('experience')
    if (!profile.location) missingFields.push('location')

    if (missingFields.length > 1) {
      flags.push({
        type: 'fake_profile',
        severity: 'medium',
        description: 'Profile missing essential information',
        evidence: { missingFields },
        confidence: 70
      })
    }

    return flags
  }

  // Check report history
  private static async checkReportHistory(userId: string): Promise<FraudFlag[]> {
    const reports = await Report.find({
      reportedUserId: userId,
      status: { $in: ['pending', 'investigating'] }
    })

    if (reports.length > 0) {
      const severity = reports.length > 3 ? 'critical' : reports.length > 1 ? 'high' : 'medium'
      
      return [{
        type: 'suspicious_activity',
        severity,
        description: `User has ${reports.length} active report(s) against them`,
        evidence: { 
          reportCount: reports.length,
          reportTypes: reports.map(r => r.type)
        },
        confidence: 85
      }]
    }

    return []
  }

  // Calculate overall risk score
  private static calculateRiskScore(flags: FraudFlag[]): number {
    if (flags.length === 0) return 0

    const severityWeights = {
      low: 10,
      medium: 25,
      high: 50,
      critical: 100
    }

    const totalScore = flags.reduce((sum, flag) => {
      const baseScore = severityWeights[flag.severity]
      const confidenceMultiplier = flag.confidence / 100
      return sum + (baseScore * confidenceMultiplier)
    }, 0)

    // Normalize to 0-100 scale
    return Math.min(100, Math.round(totalScore))
  }

  // Get recommendation based on risk score and flags
  private static getRecommendation(riskScore: number, flags: FraudFlag[]): 'approve' | 'review' | 'reject' | 'suspend' {
    const hasCriticalFlags = flags.some(f => f.severity === 'critical')
    const hasHighFlags = flags.some(f => f.severity === 'high')

    if (hasCriticalFlags || riskScore >= 80) {
      return 'reject'
    }

    if (hasHighFlags || riskScore >= 60) {
      return 'suspend'
    }

    if (riskScore >= 30) {
      return 'review'
    }

    return 'approve'
  }

  // Auto-flag suspicious users
  static async autoFlagUsers(): Promise<void> {
    await connectMongoose()

    const recentUsers = await User.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      verified: false
    })

    for (const user of recentUsers) {
      try {
        const result = await this.checkUser(user._id)
        
        if (result.recommendation === 'reject' || result.recommendation === 'suspend') {
          // Create automatic report
          await Report.create({
            reporterId: 'system',
            reportedUserId: user._id,
            type: 'fraud',
            description: `Automatic fraud detection flagged this user. Risk score: ${result.riskScore}`,
            evidence: result.flags.map(f => ({
              type: 'screenshot',
              url: 'system-generated',
              description: f.description
            })),
            status: 'pending',
            priority: result.riskScore >= 80 ? 'critical' : 'high'
          })

          console.log(`🚨 Auto-flagged user ${user._id} with risk score ${result.riskScore}`)
        }
      } catch (error) {
        console.error(`Error checking user ${user._id}:`, error)
      }
    }
  }
}