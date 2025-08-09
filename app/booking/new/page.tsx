'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/store'
import { WORKING_HOURS } from '@/lib/constants'
import { formatCurrency, getInitials } from '@/lib/utils'
import { CalendarIcon, MapPin, Star, Clock, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
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
  }
  city?: string
  state?: string
}

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [worker, setWorker] = useState<Worker | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [formData, setFormData] = useState({
    jobDescription: '',
    workTime: '',
    location: user?.address || '',
    pincode: user?.pincode || '',
    customerNotes: ''
  })

  const workerId = searchParams.get('workerId')

  useEffect(() => {
    if (workerId) {
      fetchWorker()
    }
  }, [workerId])

  const fetchWorker = async () => {
    try {
      const response = await fetch(`/api/workers/${workerId}`)
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
    }
  }

  const getSampleWorker = (): Worker => ({
    id: workerId || '1',
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
      isAvailable: true
    },
    city: 'New Delhi',
    state: 'Delhi'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to create a booking.',
        variant: 'destructive',
      })
      router.push('/auth/login')
      return
    }

    if (!selectedDate) {
      toast({
        title: 'Date Required',
        description: 'Please select a work date.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const bookingData = {
        workerId: workerId,
        jobDescription: formData.jobDescription,
        workDate: selectedDate.toISOString(),
        workTime: formData.workTime,
        location: formData.location,
        pincode: formData.pincode,
        amount: worker?.workerProfile.dailyRate || 600,
        customerNotes: formData.customerNotes
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Booking Created Successfully!',
          description: 'Your booking request has been sent to the worker.',
        })
        router.push(`/bookings/${data.booking.id}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to create a booking.</p>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const estimatedAmount = formData.workTime.includes('Full Day') 
    ? worker.workerProfile.dailyRate 
    : worker.workerProfile.hourlyRate * 4 // Assume 4 hours for half day

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Booking</h1>
          <p className="text-gray-600">Book {worker.name} for your project</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>Provide details about your project</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description *</Label>
                    <Textarea
                      id="jobDescription"
                      value={formData.jobDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                      placeholder="Describe the work you need done..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Work Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workTime">Work Time *</Label>
                      <Select value={formData.workTime} onValueChange={(value) => setFormData(prev => ({ ...prev, workTime: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work time" />
                        </SelectTrigger>
                        <SelectContent>
                          {WORKING_HOURS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Work Location *</Label>
                    <Textarea
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter the complete work address..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="123456"
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerNotes">Additional Notes</Label>
                    <Textarea
                      id="customerNotes"
                      value={formData.customerNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerNotes: e.target.value }))}
                      placeholder="Any special instructions or requirements..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Create Booking
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Worker Info & Summary */}
          <div className="space-y-6">
            {/* Worker Card */}
            <Card>
              <CardHeader>
                <CardTitle>Worker Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={worker.profilePic} alt={worker.name} />
                    <AvatarFallback>{getInitials(worker.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{worker.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{worker.city}, {worker.state}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{worker.workerProfile.rating}</span>
                      <span className="text-gray-500">({worker.workerProfile.totalJobs} jobs)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-medium">{worker.workerProfile.experience}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {worker.workerProfile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hourly Rate</span>
                    <span className="font-medium">{formatCurrency(worker.workerProfile.hourlyRate)}/hr</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Daily Rate</span>
                    <span className="font-medium">{formatCurrency(worker.workerProfile.dailyRate)}/day</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Estimated Total</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(estimatedAmount)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Final amount may vary based on actual work time
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Payment Terms</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Payment after work completion</li>
                    <li>• Secure payment through platform</li>
                    <li>• 100% money-back guarantee</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}