import Airtable from 'airtable'
import { connectMongoose } from '../mongodb'
import User from '../models/User'
import Profile from '../models/Profile'
import Job from '../models/Job'

// Configure Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID || '')

export interface MigrationResult {
  success: boolean
  migrated: {
    users: number
    profiles: number
    jobs: number
  }
  errors: string[]
}

export class AirtableMigrationService {
  // Main migration function
  static async migrateAll(): Promise<MigrationResult> {
    await connectMongoose()

    const result: MigrationResult = {
      success: true,
      migrated: { users: 0, profiles: 0, jobs: 0 },
      errors: []
    }

    try {
      // Migrate users
      const userResult = await this.migrateUsers()
      result.migrated.users = userResult.count
      result.errors.push(...userResult.errors)

      // Migrate profiles
      const profileResult = await this.migrateProfiles()
      result.migrated.profiles = profileResult.count
      result.errors.push(...profileResult.errors)

      // Migrate jobs
      const jobResult = await this.migrateJobs()
      result.migrated.jobs = jobResult.count
      result.errors.push(...jobResult.errors)

      console.log('✅ Airtable migration completed:', result)
      return result
    } catch (error: any) {
      console.error('❌ Migration failed:', error)
      result.success = false
      result.errors.push(error.message)
      return result
    }
  }

  // Migrate users from Airtable
  private static async migrateUsers(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = []
    let count = 0

    try {
      const records = await base('Users').select({
        view: 'Grid view'
      }).all()

      for (const record of records) {
        try {
          const fields = record.fields as any

          // Check if user already exists
          const existingUser = await User.findOne({
            $or: [
              { email: fields.Email },
              { phone: fields.Phone }
            ]
          })

          if (existingUser) {
            console.log(`User ${fields.Email} already exists, skipping...`)
            continue
          }

          // Create new user
          const userData = {
            email: fields.Email,
            phone: this.formatPhoneNumber(fields.Phone),
            passwordHash: 'temp123456', // Temporary password, user will reset
            role: fields.Role?.toLowerCase() || 'labourer',
            verified: fields.Verified || false,
            isActive: fields.Active !== false
          }

          const user = new User(userData)
          await user.save()
          count++

          console.log(`✅ Migrated user: ${fields.Email}`)
        } catch (error: any) {
          errors.push(`User migration error: ${error.message}`)
          console.error(`❌ Failed to migrate user:`, error)
        }
      }
    } catch (error: any) {
      errors.push(`Users table error: ${error.message}`)
    }

    return { count, errors }
  }

  // Migrate profiles from Airtable
  private static async migrateProfiles(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = []
    let count = 0

    try {
      const records = await base('Profiles').select({
        view: 'Grid view'
      }).all()

      for (const record of records) {
        try {
          const fields = record.fields as any

          // Find corresponding user
          const user = await User.findOne({ email: fields.Email })
          if (!user) {
            errors.push(`No user found for profile: ${fields.Email}`)
            continue
          }

          // Check if profile already exists
          const existingProfile = await Profile.findOne({ userId: user._id })
          if (existingProfile) {
            console.log(`Profile for ${fields.Email} already exists, skipping...`)
            continue
          }

          // Parse location coordinates
          const coordinates = this.parseCoordinates(fields.Location)
          if (!coordinates) {
            errors.push(`Invalid coordinates for profile: ${fields.Email}`)
            continue
          }

          // Create profile data
          const profileData = {
            userId: user._id,
            name: fields.Name || user.email.split('@')[0],
            contactPhone: user.phone,
            skills: this.parseSkills(fields.Skills),
            experienceYears: parseInt(fields.Experience) || 0,
            location: {
              type: 'Point',
              coordinates: coordinates,
              address: fields.Address,
              city: fields.City,
              state: fields.State,
              pincode: fields.Pincode
            },
            rate: {
              hourly: parseFloat(fields.HourlyRate) || 100,
              daily: parseFloat(fields.DailyRate) || 600,
              project: parseFloat(fields.ProjectRate) || 3000,
              currency: 'INR'
            },
            availability: this.parseAvailability(fields.Availability),
            bio: fields.Bio,
            languages: this.parseLanguages(fields.Languages),
            isAvailable: fields.Available !== false,
            rating: {
              avg: parseFloat(fields.Rating) || 0,
              count: parseInt(fields.ReviewCount) || 0,
              reviews: []
            }
          }

          const profile = new Profile(profileData)
          await profile.save()
          count++

          console.log(`✅ Migrated profile: ${fields.Name}`)
        } catch (error: any) {
          errors.push(`Profile migration error: ${error.message}`)
          console.error(`❌ Failed to migrate profile:`, error)
        }
      }
    } catch (error: any) {
      errors.push(`Profiles table error: ${error.message}`)
    }

    return { count, errors }
  }

  // Migrate jobs from Airtable
  private static async migrateJobs(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = []
    let count = 0

    try {
      const records = await base('Jobs').select({
        view: 'Grid view'
      }).all()

      for (const record of records) {
        try {
          const fields = record.fields as any

          // Find contractor user
          const contractor = await User.findOne({ email: fields.ContractorEmail })
          if (!contractor) {
            errors.push(`No contractor found for job: ${fields.Title}`)
            continue
          }

          // Parse location coordinates
          const coordinates = this.parseCoordinates(fields.Location)
          if (!coordinates) {
            errors.push(`Invalid coordinates for job: ${fields.Title}`)
            continue
          }

          // Create job data
          const jobData = {
            contractorId: contractor._id,
            title: fields.Title,
            description: fields.Description,
            skills: this.parseSkills(fields.RequiredSkills),
            location: {
              type: 'Point',
              coordinates: coordinates,
              address: fields.Address,
              city: fields.City,
              state: fields.State,
              pincode: fields.Pincode
            },
            startDate: new Date(fields.StartDate),
            endDate: fields.EndDate ? new Date(fields.EndDate) : undefined,
            duration: {
              value: parseInt(fields.Duration) || 1,
              unit: fields.DurationUnit || 'days'
            },
            pay: {
              amount: parseFloat(fields.PayAmount) || 600,
              type: fields.PayType || 'daily',
              currency: 'INR'
            },
            status: fields.Status?.toLowerCase() || 'active',
            urgency: fields.Urgency?.toLowerCase() || 'medium',
            workingHours: {
              start: fields.StartTime || '09:00',
              end: fields.EndTime || '17:00',
              flexible: fields.FlexibleHours || false
            },
            materialsRequired: this.parseArray(fields.Materials),
            requirements: this.parseArray(fields.Requirements)
          }

          const job = new Job(jobData)
          await job.save()
          count++

          console.log(`✅ Migrated job: ${fields.Title}`)
        } catch (error: any) {
          errors.push(`Job migration error: ${error.message}`)
          console.error(`❌ Failed to migrate job:`, error)
        }
      }
    } catch (error: any) {
      errors.push(`Jobs table error: ${error.message}`)
    }

    return { count, errors }
  }

  // Helper functions
  private static formatPhoneNumber(phone: string): string {
    if (!phone) return ''
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    
    // Add +91 if not present
    if (digits.length === 10) {
      return `+91${digits}`
    } else if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`
    }
    
    return phone
  }

  private static parseCoordinates(location: string): [number, number] | null {
    if (!location) return null
    
    try {
      // Expect format: "lat,lng" or "lng,lat"
      const parts = location.split(',').map(p => parseFloat(p.trim()))
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        // Assume first is latitude, second is longitude
        return [parts[1], parts[0]] // MongoDB expects [lng, lat]
      }
    } catch (error) {
      console.error('Error parsing coordinates:', location)
    }
    
    return null
  }

  private static parseSkills(skills: string): string[] {
    if (!skills) return []
    
    return skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
  }

  private static parseAvailability(availability: string): any {
    const defaultAvailability = {
      monday: { available: true, slots: ['morning', 'afternoon'] },
      tuesday: { available: true, slots: ['morning', 'afternoon'] },
      wednesday: { available: true, slots: ['morning', 'afternoon'] },
      thursday: { available: true, slots: ['morning', 'afternoon'] },
      friday: { available: true, slots: ['morning', 'afternoon'] },
      saturday: { available: true, slots: ['morning'] },
      sunday: { available: false, slots: [] }
    }

    if (!availability) return defaultAvailability

    try {
      return JSON.parse(availability)
    } catch (error) {
      return defaultAvailability
    }
  }

  private static parseLanguages(languages: string): string[] {
    if (!languages) return ['Hindi', 'English']
    
    return languages.split(',').map(l => l.trim()).filter(l => l.length > 0)
  }

  private static parseArray(value: string): string[] {
    if (!value) return []
    
    return value.split(',').map(v => v.trim()).filter(v => v.length > 0)
  }
}