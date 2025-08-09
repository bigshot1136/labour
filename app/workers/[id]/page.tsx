'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, MapPin, Phone, Calendar, Award, MessageCircle, Heart } from 'lucide-react'
import { formatCurrency, getInitials } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

interface WorkerDetails {
  id: string
  name: string
  phone: string
  profilePic?: string
  workerProfile: {
    skills: string[]
    experience: string
    dailyRate: number
    hourlyRate: number
    projectRate: number
    rating: number
    totalJobs: number
    totalEarnings: number
    isAvailable: boolean
    location?: string
    bio?: string
    portfolio: string[]
    availability: {
      monday: boolean
      tuesday: boolean
      wednesday: boolean
      thursday: boolean
      friday: boolean
      saturday: boolean
      sunday: boolean
    }
  }
  address?: string
  city?: string
  state?: string
  reviews: Array<{
    id: string
    rating: number
    comment: string
    user: { name: string }
    booking: { jobDescription: string, workDate: string }
    createdAt: string
  }>
}

export default function WorkerDetailPage() {
  const params = useParams()
  const [worker, setWorker] = useState<WorkerDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await fetch(`/api/workers/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setWorker(data)
        } else {
          // Set sample data for demo
          setWorker(getSampleWorker())
        }
      } catch (error) {
        console.error('Error fetching worker:', error)
        setWorker(getSampleWorker())
      } finally {
        setLoading(false)
      }
    }

    fetchWorker()
  }, [params.id])

  const getSampleWorker = (): WorkerDetails => ({
    id: params.id as string,
    name: 'Rajesh Kumar',
    phone: '+919876543210',
    profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    workerProfile: {
      skills: ['Carpenter', 'Handyman', 'Furniture Making'],
      experience: '5-10 years',
      dailyRate: 800,
      hourlyRate: 150,
      projectRate: 5000,
      rating: 4.5,
      totalJobs: 45,
      totalEarnings: 125000,
      isAvailable: true,
      location: 'New Delhi',
      bio: 'Experienced carpenter with over 8 years of expertise in furniture making, home repairs, and custom woodwork. I take pride in delivering quality work on time and within budget. Available for both small repairs and large projects.',
      portfolio: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
      ],
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false
      }
    },
    address: '123 Main Street, Karol Bagh',
    city: 'New Delhi',
    state: 'Delhi',
    reviews: [
      {
        id: '1',
        rating: 5,
        comment: 'Excellent work! Very professional and completed the job on time.',
        user: { name: 'Priya Sharma' },
        booking: { jobDescription: 'Kitchen cabinet repair', workDate: '2024-01-15' },
        createdAt: '2024-01-16'
      },
      {
        id: '2',
        rating: 4,
        comment: 'Good quality work. Would hire again.',
        user: { name: 'Amit Patel' },
        booking: { jobDescription: 'Furniture assembly', workDate: '2024-01-10' },
        createdAt: '2024-01-11'
      }
    ]
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Worker Not Found</h2>
          <p className="text-gray-600 mb-4">The worker you're looking for doesn't exist.</p>
          <Link href="/workers">
            <Button>Back to Workers</Button>
          </Link>
        </div>
      </div>
    )
  }

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              <Avatar className="w-24 h-24 mx-auto md:mx-0 mb-4 md:mb-0">
                <AvatarImage src={worker.profilePic} alt={worker.name} />
                <AvatarFallback className="text-2xl">{getInitials(worker.name)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{worker.name}</h1>
                    <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{worker.city}, {worker.state}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{worker.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center md:justify-start space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{worker.workerProfile.rating}</span>
                        <span className="text-gray-500">({worker.workerProfile.totalJobs} jobs)</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${worker.workerProfile.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${worker.workerProfile.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium">
                          {worker.workerProfile.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 md:mt-0">
                    <Button variant="outline" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Link href={`/booking/new?workerId=${worker.id}`} className="flex-1">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Hire Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills & Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Skills & Experience</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {worker.workerProfile.skills.map((skill) => (
                        <Badge key={skill} className="bg-orange-100 text-orange-800">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Experience</h4>
                    <p className="text-gray-600">{worker.workerProfile.experience}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Total Earnings</h4>
                    <p className="text-green-600 font-semibold">
                      {formatCurrency(worker.workerProfile.totalEarnings)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Rates */}
              <Card>
                <CardHeader>
                  <CardTitle>Rates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Hourly Rate</span>
                      <span className="text-green-600 font-semibold">
                        {formatCurrency(worker.workerProfile.hourlyRate)}/hr
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Daily Rate</span>
                      <span className="text-green-600 font-semibold">
                        {formatCurrency(worker.workerProfile.dailyRate)}/day
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Project Rate</span>
                      <span className="text-green-600 font-semibold">
                        {formatCurrency(worker.workerProfile.projectRate)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bio */}
            {worker.workerProfile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{worker.workerProfile.bio}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Previous work samples</CardDescription>
              </CardHeader>
              <CardContent>
                {worker.workerProfile.portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {worker.workerProfile.portfolio.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No portfolio images available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
                <CardDescription>{worker.reviews.length} reviews</CardDescription>
              </CardHeader>
              <CardContent>
                {worker.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {worker.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{review.user.name}</span>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{review.booking.jobDescription}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No reviews yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Weekly Availability</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, index) => (
                    <div
                      key={day}
                      className={`text-center p-3 rounded-lg border ${
                        worker.workerProfile.availability[day as keyof typeof worker.workerProfile.availability]
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      <div className="font-medium text-sm">{dayNames[index]}</div>
                      <div className="text-xs mt-1">
                        {worker.workerProfile.availability[day as keyof typeof worker.workerProfile.availability]
                          ? 'Available'
                          : 'Not Available'
                        }
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Working Hours</h4>
                  <p className="text-blue-800 text-sm">
                    Generally available from 9:00 AM to 6:00 PM on working days.
                    Flexible timing can be discussed based on project requirements.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}