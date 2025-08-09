'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/store'
import { SKILLS, EXPERIENCE_LEVELS, INDIAN_STATES } from '@/lib/constants'
import { getInitials } from '@/lib/utils'
import { Camera, Upload, Save, User, Briefcase, MapPin } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    pincode: user?.pincode || '',
    city: user?.city || '',
    state: user?.state || '',
    profilePic: user?.profilePic || ''
  })

  const [workerProfile, setWorkerProfile] = useState({
    age: 25,
    aadhaar: '',
    skills: [] as string[],
    experience: '',
    dailyRate: 600,
    hourlyRate: 100,
    projectRate: 3000,
    bio: '',
    location: '',
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false
    }
  })

  useEffect(() => {
    if (user?.role === 'WORKER') {
      // Fetch worker profile data
      fetchWorkerProfile()
    }
  }, [user])

  const fetchWorkerProfile = async () => {
    try {
      const response = await fetch('/api/workers/profile')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setWorkerProfile({
            ...workerProfile,
            ...data,
            skills: typeof data.skills === 'string' ? JSON.parse(data.skills) : data.skills || [],
            availability: typeof data.availability === 'string' ? JSON.parse(data.availability) : data.availability || workerProfile.availability
          })
        }
      }
    } catch (error) {
      console.error('Error fetching worker profile:', error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser.user)
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWorkerProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/workers/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerProfile)
      })

      if (response.ok) {
        toast({
          title: 'Worker Profile Updated',
          description: 'Your worker profile has been updated successfully.',
        })
      } else {
        throw new Error('Failed to update worker profile')
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update worker profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSkillToggle = (skill: string) => {
    setWorkerProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleAvailabilityChange = (day: string, available: boolean) => {
    setWorkerProfile(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: available
      }
    }))
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access your profile.</p>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and profile information</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            {user.role === 'WORKER' && <TabsTrigger value="worker">Worker Profile</TabsTrigger>}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>Update your basic profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profileData.profilePic} alt={profileData.name} />
                      <AvatarFallback className="text-2xl">{getInitials(profileData.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Phone number cannot be changed</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter your full address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={profileData.pincode}
                        onChange={(e) => setProfileData(prev => ({ ...prev, pincode: e.target.value }))}
                        placeholder="123456"
                        maxLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Enter your city"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="state">State</Label>
                      <Select value={profileData.state} onValueChange={(value) => setProfileData(prev => ({ ...prev, state: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your state" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === 'WORKER' && (
            <TabsContent value="worker">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5" />
                    <span>Worker Profile</span>
                  </CardTitle>
                  <CardDescription>Manage your professional information and rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleWorkerProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={workerProfile.age}
                          onChange={(e) => setWorkerProfile(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                          min={18}
                          max={65}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="aadhaar">Aadhaar Number</Label>
                        <Input
                          id="aadhaar"
                          value={workerProfile.aadhaar}
                          onChange={(e) => setWorkerProfile(prev => ({ ...prev, aadhaar: e.target.value }))}
                          placeholder="1234 5678 9012"
                          maxLength={12}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experience">Experience Level</Label>
                        <Select value={workerProfile.experience} onValueChange={(value) => setWorkerProfile(prev => ({ ...prev, experience: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPERIENCE_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Work Location</Label>
                        <Input
                          id="location"
                          value={workerProfile.location}
                          onChange={(e) => setWorkerProfile(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Area where you work"
                        />
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-3">
                      <Label>Skills (Select all that apply)</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {SKILLS.map((skill) => (
                          <div key={skill} className="flex items-center space-x-2">
                            <Checkbox
                              id={skill}
                              checked={workerProfile.skills.includes(skill)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleSkillToggle(skill)
                                } else {
                                  handleSkillToggle(skill)
                                }
                              }}
                            />
                            <Label htmlFor={skill} className="text-sm">{skill}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={workerProfile.hourlyRate}
                          onChange={(e) => setWorkerProfile(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) }))}
                          min={50}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dailyRate">Daily Rate (₹)</Label>
                        <Input
                          id="dailyRate"
                          type="number"
                          value={workerProfile.dailyRate}
                          onChange={(e) => setWorkerProfile(prev => ({ ...prev, dailyRate: parseInt(e.target.value) }))}
                          min={100}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="projectRate">Project Rate (₹)</Label>
                        <Input
                          id="projectRate"
                          type="number"
                          value={workerProfile.projectRate}
                          onChange={(e) => setWorkerProfile(prev => ({ ...prev, projectRate: parseInt(e.target.value) }))}
                          min={500}
                          required
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={workerProfile.bio}
                        onChange={(e) => setWorkerProfile(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell customers about yourself, your experience, and what makes you special..."
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500">{workerProfile.bio.length}/500 characters</p>
                    </div>

                    {/* Availability */}
                    <div className="space-y-3">
                      <Label>Weekly Availability</Label>
                      <div className="grid grid-cols-7 gap-2">
                        {Object.entries(workerProfile.availability).map(([day, available]) => (
                          <div key={day} className="text-center">
                            <Label className="text-xs capitalize mb-2 block">{day.slice(0, 3)}</Label>
                            <Checkbox
                              checked={available}
                              onCheckedChange={(checked) => handleAvailabilityChange(day, checked as boolean)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Worker Profile
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Account Verification</h4>
                      <p className="text-sm text-gray-600">
                        {user.isVerified ? 'Your account is verified' : 'Verify your account to build trust'}
                      </p>
                    </div>
                    <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Language Preference</h4>
                      <p className="text-sm text-gray-600">Choose your preferred language</p>
                    </div>
                    <Select value={user.language} onValueChange={(value) => setUser({ ...user, language: value })}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Account Type</h4>
                      <p className="text-sm text-gray-600">Your current account role</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {user.role.toLowerCase()}
                    </Badge>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This action cannot be undone. All your data will be permanently deleted.
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