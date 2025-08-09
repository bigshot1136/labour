'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Slider } from '@/components/ui/slider'
import { Search, MapPin, Star, Phone, Filter, Heart } from 'lucide-react'
import { SKILLS } from '@/lib/constants'
import { formatCurrency, getInitials } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

interface Worker {
  id: string
  name: string
  phone: string
  profilePic?: string
  workerProfile: {
    skills: string[]
    experience: string
    dailyRate: number
    hourlyRate: number
    rating: number
    totalJobs: number
    isAvailable: boolean
    location?: string
    bio?: string
  }
  address?: string
  city?: string
  state?: string
}

export default function WorkersPage() {
  const searchParams = useSearchParams()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    skill: searchParams.get('skill') || '',
    location: searchParams.get('location') || '',
    minRate: 0,
    maxRate: 2000,
    minRating: 0
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchWorkers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.skill) params.set('skill', filters.skill)
      if (filters.location) params.set('location', filters.location)
      if (filters.minRate > 0) params.set('minRate', filters.minRate.toString())
      if (filters.maxRate < 2000) params.set('maxRate', filters.maxRate.toString())
      if (filters.minRating > 0) params.set('minRating', filters.minRating.toString())

      const response = await fetch(`/api/workers?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setWorkers(data.workers || [])
      } else {
        console.error('Failed to fetch workers')
        // Set sample data for demo
        setWorkers(getSampleWorkers())
      }
    } catch (error) {
      console.error('Error fetching workers:', error)
      // Set sample data for demo
      setWorkers(getSampleWorkers())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkers()
  }, [])

  const handleSearch = () => {
    fetchWorkers()
  }

  const getSampleWorkers = (): Worker[] => [
    {
      id: '1',
      name: 'Rajesh Kumar',
      phone: '+919876543210',
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      workerProfile: {
        skills: ['Carpenter', 'Handyman'],
        experience: '5-10 years',
        dailyRate: 800,
        hourlyRate: 150,
        rating: 4.5,
        totalJobs: 45,
        isAvailable: true,
        location: 'Delhi',
        bio: 'Experienced carpenter with expertise in furniture making and home repairs.'
      },
      address: '123 Main Street',
      city: 'New Delhi',
      state: 'Delhi'
    },
    {
      id: '2',
      name: 'Amit Singh',
      phone: '+919876543211',
      profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      workerProfile: {
        skills: ['Plumber'],
        experience: '3-5 years',
        dailyRate: 700,
        hourlyRate: 120,
        rating: 4.2,
        totalJobs: 32,
        isAvailable: true,
        location: 'Mumbai',
        bio: 'Professional plumber specializing in residential and commercial plumbing.'
      },
      address: '456 Park Road',
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    {
      id: '3',
      name: 'Suresh Patel',
      phone: '+919876543212',
      profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      workerProfile: {
        skills: ['Electrician'],
        experience: '5-10 years',
        dailyRate: 900,
        hourlyRate: 180,
        rating: 4.7,
        totalJobs: 67,
        isAvailable: true,
        location: 'Bangalore',
        bio: 'Licensed electrician with experience in residential and industrial electrical work.'
      },
      address: '789 Tech Park',
      city: 'Bangalore',
      state: 'Karnataka'
    },
    {
      id: '4',
      name: 'Mohan Sharma',
      phone: '+919876543213',
      profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
      workerProfile: {
        skills: ['Painter'],
        experience: '1-3 years',
        dailyRate: 600,
        hourlyRate: 100,
        rating: 4.0,
        totalJobs: 18,
        isAvailable: true,
        location: 'Pune',
        bio: 'Professional painter with expertise in interior and exterior painting.'
      },
      address: '321 Color Street',
      city: 'Pune',
      state: 'Maharashtra'
    }
  ]

  const filteredWorkers = workers.filter(worker => {
    if (filters.skill && !worker.workerProfile.skills.some(skill => 
      skill.toLowerCase().includes(filters.skill.toLowerCase())
    )) {
      return false
    }
    if (filters.location && !worker.city?.toLowerCase().includes(filters.location.toLowerCase()) &&
        !worker.state?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }
    if (worker.workerProfile.dailyRate < filters.minRate || worker.workerProfile.dailyRate > filters.maxRate) {
      return false
    }
    if (worker.workerProfile.rating < filters.minRating) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Skilled Workers</h1>
          <p className="text-gray-600">Connect with verified daily wage workers in your area</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Skill</label>
                <Select value={filters.skill} onValueChange={(value) => setFilters(prev => ({ ...prev, skill: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Skills</SelectItem>
                    {SKILLS.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                <Input
                  placeholder="City or pincode"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Min Rating</label>
                <Select value={filters.minRating.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: parseFloat(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full bg-orange-600 hover:bg-orange-700">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="mb-4"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Advanced Filters
              </Button>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Daily Rate: ₹{filters.minRate} - ₹{filters.maxRate}
                    </label>
                    <Slider
                      value={[filters.minRate, filters.maxRate]}
                      onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minRate: min, maxRate: max }))}
                      max={2000}
                      min={0}
                      step={50}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map((worker) => (
              <Card key={worker.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={worker.profilePic} alt={worker.name} />
                        <AvatarFallback>{getInitials(worker.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{worker.name}</CardTitle>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{worker.city}, {worker.state}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Skills */}
                  <div>
                    <div className="flex flex-wrap gap-1">
                      {worker.workerProfile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Experience & Rating */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Experience: {worker.workerProfile.experience}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{worker.workerProfile.rating}</span>
                      <span className="text-gray-500">({worker.workerProfile.totalJobs} jobs)</span>
                    </div>
                  </div>

                  {/* Rates */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Daily Rate</span>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(worker.workerProfile.dailyRate)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Hourly Rate</span>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(worker.workerProfile.hourlyRate)}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {worker.workerProfile.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {worker.workerProfile.bio}
                    </p>
                  )}

                  {/* Availability */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${worker.workerProfile.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-gray-600">
                        {worker.workerProfile.isAvailable ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4">
                    <Link href={`/workers/${worker.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                    <Link href={`/booking/new?workerId=${worker.id}`} className="flex-1">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Hire Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredWorkers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No workers found</h3>
              <p>Try adjusting your search criteria or location</p>
            </div>
            <Button onClick={() => setFilters({ skill: '', location: '', minRate: 0, maxRate: 2000, minRating: 0 })}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}