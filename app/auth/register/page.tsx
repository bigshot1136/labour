'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { userRegistrationSchema } from '@/lib/validations'
import { useAuthStore } from '@/lib/store'
import { INDIAN_STATES } from '@/lib/constants'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { setUser } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: (searchParams.get('role') as 'CUSTOMER' | 'WORKER') || 'CUSTOMER',
    address: '',
    pincode: '',
    language: 'en'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Format phone number
      const phoneNumber = formData.phone.startsWith('+91') 
        ? formData.phone 
        : `+91${formData.phone}`

      const validatedData = userRegistrationSchema.parse({
        ...formData,
        phone: phoneNumber
      })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast({
        title: 'Registration Successful',
        description: `OTP sent to ${phoneNumber}. Use OTP: ${data.otp}`,
      })

      // Redirect to OTP verification
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(phoneNumber)}&userId=${data.userId}`)
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Labour Chowk as a {formData.role.toLowerCase()}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Enter your details to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>I want to:</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CUSTOMER" id="customer" />
                    <Label htmlFor="customer">Hire workers for my tasks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="WORKER" id="worker" />
                    <Label htmlFor="worker">Work and earn money</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="9876543210"
                    className="rounded-l-none"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your address"
                />
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode (Optional)</Label>
                <Input
                  id="pincode"
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label>Preferred Language</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}