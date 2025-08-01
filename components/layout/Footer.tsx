import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">LC</span>
              </div>
              <span className="text-xl font-bold">Labour Chowk</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Connecting skilled daily wage workers with customers across India. 
              Find reliable workers or showcase your skills on our platform.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="w-4 h-4" />
                <span>support@labourchowk.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/workers" className="text-gray-300 hover:text-white transition-colors">
                  Find Workers
                </Link>
              </li>
              <li>
                <Link href="/auth/register?role=worker" className="text-gray-300 hover:text-white transition-colors">
                  Join as Worker
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-gray-300 hover:text-white transition-colors">
                  Safety Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Carpentry</li>
              <li>Plumbing</li>
              <li>Electrical Work</li>
              <li>Painting</li>
              <li>Masonry</li>
              <li>Cleaning</li>
              <li>Gardening</li>
              <li>Driving</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2024 Labour Chowk. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/support" className="text-gray-300 hover:text-white text-sm transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}