'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  MapPin, 
  Star, 
  TrendingUp, 
  Users, 
  Briefcase, 
  MessageCircle,
  Bell,
  Settings,
  Plus
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { formatCurrency, getInitials, formatDateTime } from '@/lib/utils'
import { BOOKING_STATUS_COLORS } from '@/lib/constants'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

interface DashboardData {
  stats: {
    totalBookings: number
    completedJobs: number
    totalEarnings: number
    averageRating: number
  }
  recentBookings: Array<{
    id: string
    jobDescription: string
    workDate: string
    amount: number
    status: string
    customer?: { name: string, profilePic?: string }
    worker?: { name: string, profilePic?: string }
  }>
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    isRead: boolean
    createdAt: string
  }>
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // For demo purposes, we'll use sample data
        // In production, this would fetch from /api/dashboard
        setDashboardData(getSampleDashboardData())
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setDashboardData(getSampleDashboardData())
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getSampleDashboardData = (): DashboardData => ({
    stats: {
      totalBookings: user?.role === 'WORKER' ? 45 : 12,
      completedJobs: user?.role === 'WORKER' ? 38 : 10,
      totalEarnings: user?.role === 'WORKER' ? 125000 : 0,
      averageRating: user?.role === 'WORKER' ? 4.5 : 0
    },
    recentBookings: [
      {
        id: '1',
        jobDescription: 'Kitchen cabinet repair and painting',
        workDate: '2024-01-20',
        amount: 1200,
        status: 'COMPLETED',
        customer: { name: 'Priya Sharma', profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
        worker: { name: 'Rajesh Kumar', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }
      },
      {
        id: '2',
        jobDescription: 'Bathroom plumbing installation',
        workDate: '2024-01-18',
        amount: 800,
        status: 'IN_PROGRESS',
        customer: { name: 'Amit Patel', profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
        worker: { name: 'Suresh Patel', profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' }
      },
      {
        id: '3',
        jobDescription: 'House painting - exterior walls',
        workDate: '2024-01-22',
        amount: 1500,
        status: 'PENDING',
        customer: { name: 'Sunita Reddy', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
        worker: { name: 'Mohan Sharma', profilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face' }
      }
    ],
    notifications: [
      {
        id: '1',
        title: 'New Booking Request',
        message: 'You have received a new booking request for carpentry work.',
        type: 'INFO',
        isRead: false,
        createdAt: '2024-01-19T10:30:00Z'
      },
      {
        id: '2',
        title: 'Payment Received',
        message: 'Payment of ₹1,200 has been credited to your account.',
        type: 'SUCCESS',
        isRead: false,
        createdAt: '2024-01-18T15:45:00Z'
      },
      {
        id: '3',
        title: 'Job Completed',
        message: 'Your recent job has been marked as completed. Please rate your experience.',
        type: 'INFO',
        isRead: true,
        createdAt: '2024-01-17T09:15:00Z'
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access the dashboard.</p>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                {user.role === 'WORKER' ? 'Manage your jobs and earnings' : 'Find workers and manage your projects'}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.completedJobs}</div>
              <p className="text-xs text-muted-foreground">
                +5 from last month
              </p>
            </CardContent>
          </Card>

          {user.role === 'WORKER' && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(dashboardData?.stats.totalEarnings || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.stats.averageRating}</div>
                  <p className="text-xs text-muted-foreground">
                    Based on {dashboardData?.stats.completedJobs} reviews
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Your latest job activities</CardDescription>
                </div>
                <Link href="/bookings">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Avatar className="w-10 h-10">
                        <AvatarImage 
                          src={user.role === 'WORKER' ? booking.customer?.profilePic : booking.worker?.profilePic} 
                          alt="Profile" 
                        />
                        <AvatarFallback>
                          {getInitials(user.role === 'WORKER' ? booking.customer?.name || 'Customer' : booking.worker?.name || 'Worker')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {booking.jobDescription}
                          </p>
                          <Badge className={BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS]}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{user.role === 'WORKER' ? booking.customer?.name : booking.worker?.name}</span>
                          <span>{new Date(booking.workDate).toLocaleDateString()}</span>
                          <span className="font-medium text-green-600">{formatCurrency(booking.amount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.role === 'WORKER' ? (
                  <>
                    <Link href="/profile" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Update Profile
                      </Button>
                    </Link>
                    <Link href="/jobs" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Browse Jobs
                      </Button>
                    </Link>
                    <Link href="/bookings" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        My Bookings
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/workers" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Find Workers
                      </Button>
                    </Link>
                    <Link href="/jobs/new" className="block">
                      <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Post New Job
                      </Button>
                    </Link>
                    <Link href="/bookings" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        My Bookings
                      </Button>
                    </Link>
                  </>
                )}
                <Link href="/messages" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Notifications</span>
                  <Badge variant="secondary">
                    {dashboardData?.notifications.filter(n => !n.isRead).length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className={`p-3 rounded-lg border ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <span className="text-xs text-gray-500 mt-2 block">
                            {formatDateTime(notification.createdAt)}
                          </span>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/notifications" className="block mt-4">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Notifications
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}