'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  MapPin, 
  Star, 
  Phone,
  MessageCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { formatCurrency, getInitials, formatDateTime } from '@/lib/utils'
import { BOOKING_STATUS_COLORS } from '@/lib/constants'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

interface Booking {
  id: string
  jobDescription: string
  workDate: string
  workTime: string
  location: string
  amount: number
  status: string
  paymentStatus: string
  customerNotes?: string
  workerNotes?: string
  createdAt: string
  customer?: {
    name: string
    phone: string
    profilePic?: string
  }
  worker?: {
    name: string
    phone: string
    profilePic?: string
    workerProfile?: {
      skills: string[]
      rating: number
    }
  }
  review?: {
    rating: number
    comment: string
  }
}

export default function BookingsPage() {
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      const response = await fetch(`/api/bookings?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      } else {
        // Set sample data for demo
        setBookings(getSampleBookings())
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings(getSampleBookings())
    } finally {
      setLoading(false)
    }
  }

  const getSampleBookings = (): Booking[] => [
    {
      id: '1',
      jobDescription: 'Kitchen cabinet repair and painting',
      workDate: '2024-01-20T09:00:00Z',
      workTime: '9:00 AM - 6:00 PM',
      location: '123 Main Street, Karol Bagh, New Delhi',
      amount: 1200,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      customerNotes: 'Please bring your own tools and paint brushes.',
      workerNotes: 'Job completed successfully. Customer was very satisfied.',
      createdAt: '2024-01-18T10:00:00Z',
      customer: {
        name: 'Priya Sharma',
        phone: '+919876543225',
        profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      worker: {
        name: 'Rajesh Kumar',
        phone: '+919876543210',
        profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        workerProfile: {
          skills: ['Carpenter', 'Painter'],
          rating: 4.5
        }
      },
      review: {
        rating: 5,
        comment: 'Excellent work! Very professional and completed on time.'
      }
    },
    {
      id: '2',
      jobDescription: 'Bathroom plumbing installation',
      workDate: '2024-01-22T10:00:00Z',
      workTime: '10:00 AM - 2:00 PM',
      location: '456 Park Road, Bandra, Mumbai',
      amount: 800,
      status: 'IN_PROGRESS',
      paymentStatus: 'PENDING',
      customerNotes: 'Need to install new faucets and fix leaking pipes.',
      createdAt: '2024-01-20T14:30:00Z',
      customer: {
        name: 'Amit Patel',
        phone: '+919876543226',
        profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      worker: {
        name: 'Suresh Patel',
        phone: '+919876543212',
        profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        workerProfile: {
          skills: ['Plumber'],
          rating: 4.2
        }
      }
    },
    {
      id: '3',
      jobDescription: 'House painting - exterior walls',
      workDate: '2024-01-25T08:00:00Z',
      workTime: '8:00 AM - 5:00 PM',
      location: '789 Tech Park, Koramangala, Bangalore',
      amount: 1500,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      customerNotes: 'Need to paint the front and side walls of the house.',
      createdAt: '2024-01-21T16:45:00Z',
      customer: {
        name: 'Sunita Reddy',
        phone: '+919876543227',
        profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      worker: {
        name: 'Mohan Sharma',
        phone: '+919876543213',
        profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
        workerProfile: {
          skills: ['Painter'],
          rating: 4.0
        }
      }
    }
  ]

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter.toUpperCase())

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your bookings.</p>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600">
              {user.role === 'WORKER' ? 'Manage your job bookings' : 'Track your hired workers'}
            </p>
          </div>
          
          {user.role === 'CUSTOMER' && (
            <Link href="/workers">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Find Workers
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="status-filter" className="text-sm font-medium">Filter by status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-4">
                {statusFilter === 'all' 
                  ? "You don't have any bookings yet." 
                  : `No bookings with status "${statusFilter}".`
                }
              </p>
              {user.role === 'CUSTOMER' && (
                <Link href="/workers">
                  <Button>Find Workers</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage 
                          src={user.role === 'WORKER' ? booking.customer?.profilePic : booking.worker?.profilePic} 
                          alt="Profile" 
                        />
                        <AvatarFallback>
                          {getInitials(user.role === 'WORKER' ? booking.customer?.name || 'Customer' : booking.worker?.name || 'Worker')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(booking.status)}
                          <Badge className={BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS]}>
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1">{booking.jobDescription}</h3>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">
                              {user.role === 'WORKER' ? booking.customer?.name : booking.worker?.name}
                            </span>
                            <span>{formatDateTime(booking.workDate)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{booking.location}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{booking.workTime}</span>
                          </div>
                        </div>

                        {user.role === 'WORKER' && booking.worker?.workerProfile && (
                          <div className="flex items-center space-x-2 mt-2">
                            {booking.worker.workerProfile.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(booking.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Payment: {booking.paymentStatus}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                        <Link href={`/bookings/${booking.id}`}>
                          <Button size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {(booking.customerNotes || booking.workerNotes) && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      {booking.customerNotes && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">Customer Notes</h4>
                          <p className="text-sm text-blue-800">{booking.customerNotes}</p>
                        </div>
                      )}
                      {booking.workerNotes && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-green-900 mb-1">Worker Notes</h4>
                          <p className="text-sm text-green-800">{booking.workerNotes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Review */}
                  {booking.review && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{booking.review.rating}/5</span>
                        </div>
                        <p className="text-sm text-gray-700">{booking.review.comment}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}