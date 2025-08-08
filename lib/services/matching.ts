import Profile from '../models/Profile'
import Job from '../models/Job'
import { connectMongoose } from '../mongodb'

export interface MatchResult {
  labourerId: string
  profile: any
  score: number
  factors: {
    skillMatch: number
    distanceScore: number
    rateScore: number
    availabilityScore: number
    experienceScore: number
    ratingScore: number
  }
}

export interface RateSuggestion {
  suggested: {
    hourly: number
    daily: number
    project: number
  }
  market: {
    min: number
    max: number
    avg: number
  }
  factors: {
    skill: string
    experience: number
    location: string
    demand: 'low' | 'medium' | 'high'
  }
}

export class MatchingService {
  // Find matching labourers for a job
  static async findMatches(jobId: string, limit: number = 10): Promise<MatchResult[]> {
    await connectMongoose()

    const job = await Job.findById(jobId)
    if (!job) {
      throw new Error('Job not found')
    }

    // Find profiles within reasonable distance (50km) with matching skills
    const profiles = await Profile.find({
      skills: { $in: job.skills },
      isAvailable: true,
      location: {
        $near: {
          $geometry: job.location,
          $maxDistance: 50000 // 50km in meters
        }
      }
    }).populate('userId', 'email verified')

    const matches: MatchResult[] = []

    for (const profile of profiles) {
      const score = this.calculateMatchScore(job, profile)
      
      matches.push({
        labourerId: profile.userId,
        profile: profile.toObject(),
        score: score.total,
        factors: score.factors
      })
    }

    // Sort by score and return top matches
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  // Calculate match score between job and profile
  private static calculateMatchScore(job: any, profile: any): { total: number; factors: any } {
    const factors = {
      skillMatch: 0,
      distanceScore: 0,
      rateScore: 0,
      availabilityScore: 0,
      experienceScore: 0,
      ratingScore: 0
    }

    // Skill matching (40% weight)
    const jobSkills = new Set(job.skills)
    const profileSkills = new Set(profile.skills)
    const commonSkills = new Set([...jobSkills].filter(x => profileSkills.has(x)))
    factors.skillMatch = (commonSkills.size / jobSkills.size) * 100

    // Distance scoring (20% weight)
    const distance = this.calculateDistance(
      job.location.coordinates,
      profile.location.coordinates
    )
    factors.distanceScore = Math.max(0, 100 - (distance / 1000) * 2) // Decrease by 2 points per km

    // Rate compatibility (15% weight)
    const jobRate = job.pay.amount
    const profileRate = job.pay.type === 'hourly' ? profile.rate.hourly : profile.rate.daily
    const rateDiff = Math.abs(jobRate - profileRate) / jobRate
    factors.rateScore = Math.max(0, 100 - rateDiff * 100)

    // Availability scoring (10% weight)
    factors.availabilityScore = this.checkAvailability(job, profile) ? 100 : 0

    // Experience scoring (10% weight)
    factors.experienceScore = Math.min(100, profile.experienceYears * 10)

    // Rating scoring (5% weight)
    factors.ratingScore = (profile.rating.avg / 5) * 100

    // Calculate weighted total
    const total = (
      factors.skillMatch * 0.4 +
      factors.distanceScore * 0.2 +
      factors.rateScore * 0.15 +
      factors.availabilityScore * 0.1 +
      factors.experienceScore * 0.1 +
      factors.ratingScore * 0.05
    )

    return { total: Math.round(total), factors }
  }

  // Calculate distance between two coordinates
  private static calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = coord1[1] * Math.PI / 180
    const φ2 = coord2[1] * Math.PI / 180
    const Δφ = (coord2[1] - coord1[1]) * Math.PI / 180
    const Δλ = (coord2[0] - coord1[0]) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  // Check availability compatibility
  private static checkAvailability(job: any, profile: any): boolean {
    const jobStartDate = new Date(job.startDate)
    const dayOfWeek = jobStartDate.toLocaleDateString('en-US', { weekday: 'lowercase' })
    
    const dayAvailability = profile.availability[dayOfWeek]
    return dayAvailability && dayAvailability.available
  }

  // Suggest rates based on market data
  static async suggestRates(skill: string, experienceYears: number, location: [number, number]): Promise<RateSuggestion> {
    await connectMongoose()

    // Find similar profiles in the area
    const similarProfiles = await Profile.find({
      skills: skill,
      experienceYears: { $gte: experienceYears - 2, $lte: experienceYears + 2 },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location
          },
          $maxDistance: 25000 // 25km radius
        }
      }
    })

    if (similarProfiles.length === 0) {
      // Fallback to default rates
      return this.getDefaultRates(skill, experienceYears)
    }

    // Calculate market rates
    const hourlyRates = similarProfiles.map(p => p.rate.hourly).filter(r => r > 0)
    const dailyRates = similarProfiles.map(p => p.rate.daily).filter(r => r > 0)

    const avgHourly = hourlyRates.reduce((a, b) => a + b, 0) / hourlyRates.length
    const avgDaily = dailyRates.reduce((a, b) => a + b, 0) / dailyRates.length

    const minHourly = Math.min(...hourlyRates)
    const maxHourly = Math.max(...hourlyRates)
    const minDaily = Math.min(...dailyRates)
    const maxDaily = Math.max(...dailyRates)

    // Adjust based on experience
    const experienceMultiplier = 1 + (experienceYears * 0.05) // 5% increase per year
    
    return {
      suggested: {
        hourly: Math.round(avgHourly * experienceMultiplier),
        daily: Math.round(avgDaily * experienceMultiplier),
        project: Math.round(avgDaily * experienceMultiplier * 5) // Assume 5-day project
      },
      market: {
        min: Math.min(minHourly, minDaily / 8),
        max: Math.max(maxHourly, maxDaily / 8),
        avg: (avgHourly + avgDaily / 8) / 2
      },
      factors: {
        skill,
        experience: experienceYears,
        location: 'Local market',
        demand: this.calculateDemand(similarProfiles.length)
      }
    }
  }

  // Get default rates for skills
  private static getDefaultRates(skill: string, experienceYears: number): RateSuggestion {
    const baseRates: { [key: string]: { hourly: number; daily: number } } = {
      'Carpenter': { hourly: 150, daily: 800 },
      'Plumber': { hourly: 120, daily: 700 },
      'Electrician': { hourly: 180, daily: 900 },
      'Painter': { hourly: 100, daily: 600 },
      'Mason': { hourly: 130, daily: 750 },
      'Cleaner': { hourly: 80, daily: 500 },
      'Gardner': { hourly: 90, daily: 550 },
      'Driver': { hourly: 150, daily: 800 },
      'Cook': { hourly: 120, daily: 700 },
      'Security Guard': { hourly: 100, daily: 600 },
      'Handyman': { hourly: 110, daily: 650 },
      'Welder': { hourly: 160, daily: 850 }
    }

    const base = baseRates[skill] || { hourly: 100, daily: 600 }
    const experienceMultiplier = 1 + (experienceYears * 0.05)

    return {
      suggested: {
        hourly: Math.round(base.hourly * experienceMultiplier),
        daily: Math.round(base.daily * experienceMultiplier),
        project: Math.round(base.daily * experienceMultiplier * 5)
      },
      market: {
        min: Math.round(base.hourly * 0.8),
        max: Math.round(base.hourly * 1.5),
        avg: base.hourly
      },
      factors: {
        skill,
        experience: experienceYears,
        location: 'Default rates',
        demand: 'medium'
      }
    }
  }

  // Calculate demand based on number of similar profiles
  private static calculateDemand(profileCount: number): 'low' | 'medium' | 'high' {
    if (profileCount < 5) return 'high'
    if (profileCount < 15) return 'medium'
    return 'low'
  }
}