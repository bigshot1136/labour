import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  phone: string
  role: 'CUSTOMER' | 'WORKER' | 'ADMIN'
  isVerified: boolean
  address?: string
  pincode?: string
  language: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  language: 'en' | 'hi'
  setUser: (user: User | null) => void
  setLanguage: (language: 'en' | 'hi') => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      language: 'en',
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLanguage: (language) => set({ language }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface AppState {
  searchQuery: string
  selectedSkills: string[]
  selectedLocation: string
  priceRange: [number, number]
  setSearchQuery: (query: string) => void
  setSelectedSkills: (skills: string[]) => void
  setSelectedLocation: (location: string) => void
  setPriceRange: (range: [number, number]) => void
}

export const useAppStore = create<AppState>((set) => ({
  searchQuery: '',
  selectedSkills: [],
  selectedLocation: '',
  priceRange: [0, 2000],
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedSkills: (selectedSkills) => set({ selectedSkills }),
  setSelectedLocation: (selectedLocation) => set({ selectedLocation }),
  setPriceRange: (priceRange) => set({ priceRange }),
}))