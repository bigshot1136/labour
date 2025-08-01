'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Phone, MapPin, Globe } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { TRANSLATIONS } from '@/lib/constants'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, language, setLanguage, logout } = useAuthStore()
  const t = TRANSLATIONS[language]

  const handleLogout = () => {
    logout()
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">LC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Labour Chowk</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/workers" className="text-gray-700 hover:text-orange-600 transition-colors">
              Find Workers
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-orange-600 transition-colors">
              How it Works
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right side - Auth & Language */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="text-gray-700 hover:text-orange-600"
            >
              <Globe className="w-4 h-4 mr-1" />
              {language === 'en' ? 'हिं' : 'EN'}
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-gray-700 hover:text-orange-600">
                    {t.dashboard}
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Hi, {user?.name}</span>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/workers" 
                className="text-gray-700 hover:text-orange-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Workers
              </Link>
              <Link 
                href="/how-it-works" 
                className="text-gray-700 hover:text-orange-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-700 hover:text-orange-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                  className="text-gray-700 hover:text-orange-600 mb-4"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  {language === 'en' ? 'हिंदी' : 'English'}
                </Button>

                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        {t.dashboard}
                      </Button>
                    </Link>
                    <Button onClick={handleLogout} variant="outline" className="w-full">
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">Login</Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}