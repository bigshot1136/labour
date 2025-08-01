export const SKILLS = [
  'Carpenter',
  'Plumber',
  'Electrician',
  'Painter',
  'Mason',
  'Cleaner',
  'Gardner',
  'Driver',
  'Cook',
  'Security Guard',
  'Handyman',
  'Welder'
] as const

export const EXPERIENCE_LEVELS = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  'More than 10 years'
] as const

export const WORKING_HOURS = [
  '9:00 AM - 12:00 PM',
  '12:00 PM - 3:00 PM',
  '3:00 PM - 6:00 PM',
  '9:00 AM - 6:00 PM',
  'Custom'
] as const

export const BOOKING_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

export const TRANSLATIONS = {
  en: {
    welcome: 'Welcome to Labour Chowk',
    findWorkers: 'Find Skilled Daily Wage Workers Near You',
    hireWorker: 'Hire a Worker',
    joinAsWorker: 'Join as Worker',
    search: 'Search',
    location: 'Location',
    skills: 'Skills',
    experience: 'Experience',
    dailyRate: 'Daily Rate',
    hourlyRate: 'Hourly Rate',
    projectRate: 'Project Rate',
    availability: 'Availability',
    portfolio: 'Portfolio',
    reviews: 'Reviews',
    bookings: 'Bookings',
    messages: 'Messages',
    profile: 'Profile',
    dashboard: 'Dashboard',
    settings: 'Settings',
  },
  hi: {
    welcome: 'लेबर चौक में आपका स्वागत है',
    findWorkers: 'अपने पास कुशल दैनिक मजदूर खोजें',
    hireWorker: 'मजदूर को काम पर रखें',
    joinAsWorker: 'मजदूर के रूप में जुड़ें',
    search: 'खोजें',
    location: 'स्थान',
    skills: 'कौशल',
    experience: 'अनुभव',
    dailyRate: 'दैनिक दर',
    hourlyRate: 'घंटे की दर',
    projectRate: 'प्रोजेक्ट दर',
    availability: 'उपलब्धता',
    portfolio: 'पोर्टफोलियो',
    reviews: 'समीक्षाएं',
    bookings: 'बुकिंग',
    messages: 'संदेश',
    profile: 'प्रोफ़ाइल',
    dashboard: 'डैशबोर्ड',
    settings: 'सेटिंग्स',
  }
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
] as const