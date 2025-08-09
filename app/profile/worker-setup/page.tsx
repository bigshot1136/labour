'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/store'
import { SKILLS, EXPERIENCE_LEVELS } from '@/lib/constants'
import { workerProfileSchema } from '@/lib/validations'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function WorkerSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
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

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleAvailabilityChange = (day: string, available: boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: available
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate data
      workerProfileSchema.parse(formData)

      const response = await fetch('/api/workers/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update user with worker profile
        setUser({
          ...user!,
          workerProfile: data
        })

        toast({
          title: 'Profile Created Successfully!',
          description: 'Your worker profile has been set up. You can now start receiving job offers.',
        })

        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create profile')
      }
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message || 'Failed to create worker profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.age >= 18 && formData.aadhaar.length === 12 && formData.experience
      case 2:
        return formData.skills.length > 0
      case 3:
        return formData.dailyRate > 0 && formData.hourlyRate > 0
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Worker Profile</h1>
          <p className="text-gray-600">Set up your professional profile to start receiving job offers</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNumber <= step 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber < step ? <CheckCircle className="w-4 h-4" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  stepNumber < step ? 'bg-orange-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Step {step} of 3: {
                step === 1 ? 'Basic Information' :
                step === 2 ? 'Skills & Experience' :
                'Rates & Availability'
              }
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Tell us about yourself'}
              {step === 2 && 'What services do you provide?'}
              {step === 3 && 'Set your rates and availability'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                        min={18}
                        max={65}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                      <Input
                        id="aadhaar"
                        value={formData.aadhaar}
                        onChange={(e) => setFormData(prev => ({ ...prev, aadhaar: e.target.value.replace(/\D/g, '') }))}
                        placeholder="123456789012"
                        maxLength={12}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level *</Label>
                    <Select value={formData.experience} onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
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
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Area where you primarily work"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Skills * (Select all that apply)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SKILLS.map((skill) => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            id={skill}
                            checked={formData.skills.includes(skill)}
                            onCheckedChange={() => handleSkillToggle(skill)}
                          />
                          <Label htmlFor={skill} className="text-sm">{skill}</Label>
                        </div>
                      ))}
                    </div>
                    {formData.skills.length === 0 && (
                      <p className="text-sm text-red-600">Please select at least one skill</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell customers about yourself, your experience, and what makes you special..."
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500">{formData.bio.length}/500 characters</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate (₹) *</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) }))}
                        min={50}
                        required
                      />
                      <p className="text-xs text-gray-500">Minimum ₹50/hour</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dailyRate">Daily Rate (₹) *</Label>
                      <Input
                        id="dailyRate"
                        type="number"
                        value={formData.dailyRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: parseInt(e.target.value) }))}
                        min={100}
                        required
                      />
                      <p className="text-xs text-gray-500">Minimum ₹100/day</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="projectRate">Project Rate (₹) *</Label>
                      <Input
                        id="projectRate"
                        type="number"
                        value={formData.projectRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectRate: parseInt(e.target.value) }))}
                        min={500}
                        required
                      />
                      <p className="text-xs text-gray-500">Minimum ₹500/project</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Weekly Availability</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {Object.entries(formData.availability).map(([day, available]) => (
                        <div key={day} className="text-center p-3 border rounded-lg">
                          <Label className="text-xs capitalize mb-2 block">{day.slice(0, 3)}</Label>
                          <Checkbox
                            checked={available}
                            onCheckedChange={(checked) => handleAvailabilityChange(day, checked as boolean)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                
                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="ml-auto"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={loading || !canProceed()}
                    className="ml-auto bg-orange-600 hover:bg-orange-700"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}