'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { phoneSchema } from '@/lib/validations'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const phoneNumber = phone.startsWith('+91') ? phone : `+91${phone}`
      phoneSchema.parse(phoneNumber)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast({
        title: 'OTP Sent',
        description: `OTP sent to ${phoneNumber}. Use OTP: ${data.otp}`,
      })

      router.push(`/auth/verify-otp?phone=${encodeURIComponent(phoneNumber)}&userId=${data.userId}`)
    } catch (error: any) {
      toast({
        title: 'Login Failed',
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your phone number to receive an OTP
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              We'll send you an OTP to verify your phone number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="rounded-l-none"
                    maxLength={10}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/register" className="font-medium text-orange-600 hover:text-orange-500">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}