import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const INDIAN_NAMES = {
  workers: [
    { name: 'Rajesh Kumar', phone: '+919876543210', skills: ['Carpenter'], experience: '5-10 years', dailyRate: 800, hourlyRate: 150, projectRate: 5000 },
    { name: 'Amit Singh', phone: '+919876543211', skills: ['Plumber'], experience: '3-5 years', dailyRate: 700, hourlyRate: 120, projectRate: 4000 },
    { name: 'Suresh Patel', phone: '+919876543212', skills: ['Electrician'], experience: '5-10 years', dailyRate: 900, hourlyRate: 180, projectRate: 6000 },
    { name: 'Mohan Sharma', phone: '+919876543213', skills: ['Painter'], experience: '1-3 years', dailyRate: 600, hourlyRate: 100, projectRate: 3000 },
    { name: 'Ramesh Verma', phone: '+919876543214', skills: ['Mason'], experience: 'More than 10 years', dailyRate: 750, hourlyRate: 130, projectRate: 4500 },
    { name: 'Lakshman Das', phone: '+919876543215', skills: ['Cleaner'], experience: '1-3 years', dailyRate: 500, hourlyRate: 80, projectRate: 2000 },
    { name: 'Ganesh Yadav', phone: '+919876543216', skills: ['Gardner'], experience: '3-5 years', dailyRate: 550, hourlyRate: 90, projectRate: 2500 },
    { name: 'Krishna Reddy', phone: '+919876543217', skills: ['Driver'], experience: '5-10 years', dailyRate: 800, hourlyRate: 150, projectRate: 5000 },
    { name: 'Venkatesh Iyer', phone: '+919876543218', skills: ['Handyman'], experience: '3-5 years', dailyRate: 650, hourlyRate: 110, projectRate: 3500 },
    { name: 'Arjun Menon', phone: '+919876543219', skills: ['Welder'], experience: '5-10 years', dailyRate: 850, hourlyRate: 160, projectRate: 5500 },
    { name: 'Vikram Malhotra', phone: '+919876543220', skills: ['Carpenter', 'Handyman'], experience: 'More than 10 years', dailyRate: 1000, hourlyRate: 200, projectRate: 7000 },
    { name: 'Sanjay Gupta', phone: '+919876543221', skills: ['Electrician', 'Plumber'], experience: '5-10 years', dailyRate: 950, hourlyRate: 180, projectRate: 6500 },
    { name: 'Prakash Joshi', phone: '+919876543222', skills: ['Painter', 'Mason'], experience: '3-5 years', dailyRate: 700, hourlyRate: 120, projectRate: 4000 },
    { name: 'Harish Mehta', phone: '+919876543223', skills: ['Cleaner', 'Gardner'], experience: '1-3 years', dailyRate: 550, hourlyRate: 90, projectRate: 2500 },
    { name: 'Naresh Kapoor', phone: '+919876543224', skills: ['Driver', 'Handyman'], experience: '5-10 years', dailyRate: 900, hourlyRate: 170, projectRate: 6000 }
  ],
  customers: [
    { name: 'Priya Sharma', phone: '+919876543225', address: '123, Green Park, New Delhi', pincode: '110016' },
    { name: 'Anjali Patel', phone: '+919876543226', address: '456, Bandra West, Mumbai', pincode: '400050' },
    { name: 'Sunita Reddy', phone: '+919876543227', address: '789, Koramangala, Bangalore', pincode: '560034' },
    { name: 'Meera Iyer', phone: '+919876543228', address: '321, Salt Lake, Kolkata', pincode: '700091' },
    { name: 'Kavita Singh', phone: '+919876543229', address: '654, Banjara Hills, Hyderabad', pincode: '500034' },
    { name: 'Rekha Verma', phone: '+919876543230', address: '987, Anna Nagar, Chennai', pincode: '600040' },
    { name: 'Sita Das', phone: '+919876543231', address: '147, Vasant Vihar, New Delhi', pincode: '110057' },
    { name: 'Lakshmi Menon', phone: '+919876543232', address: '258, Juhu, Mumbai', pincode: '400049' },
    { name: 'Radha Yadav', phone: '+919876543233', address: '369, Indiranagar, Bangalore', pincode: '560038' },
    { name: 'Gita Malhotra', phone: '+919876543234', address: '741, Park Street, Kolkata', pincode: '700016' }
  ]
}

const INDIAN_CITIES = [
  'New Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Hyderabad', 'Chennai',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur'
]

const INDIAN_STATES = [
  'Delhi', 'Maharashtra', 'Karnataka', 'West Bengal', 'Telangana', 'Tamil Nadu',
  'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Bihar', 'Odisha'
]

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.notification.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.review.deleteMany()
  await prisma.message.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.workerProfile.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Create customers
  const customers = []
  for (const customerData of INDIAN_NAMES.customers) {
    const customer = await prisma.user.create({
      data: {
        name: customerData.name,
        phone: customerData.phone,
        role: 'CUSTOMER',
        isVerified: true,
        address: customerData.address,
        pincode: customerData.pincode,
        city: INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)],
        state: INDIAN_STATES[Math.floor(Math.random() * INDIAN_STATES.length)],
        language: Math.random() > 0.5 ? 'en' : 'hi'
      }
    })
    customers.push(customer)
  }

  console.log(`✅ Created ${customers.length} customers`)

  // Create workers with profiles
  const workers = []
  for (const workerData of INDIAN_NAMES.workers) {
    const user = await prisma.user.create({
      data: {
        name: workerData.name,
        phone: workerData.phone,
        role: 'WORKER',
        isVerified: true,
        address: `${Math.floor(Math.random() * 999) + 1}, ${INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)]}`,
        pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
        city: INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)],
        state: INDIAN_STATES[Math.floor(Math.random() * INDIAN_STATES.length)],
        language: Math.random() > 0.5 ? 'en' : 'hi'
      }
    })

    const workerProfile = await prisma.workerProfile.create({
      data: {
        userId: user.id,
        age: Math.floor(Math.random() * 30) + 25, // 25-55 years
        aadhaar: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
        skills: workerData.skills,
        experience: workerData.experience,
        dailyRate: workerData.dailyRate,
        hourlyRate: workerData.hourlyRate,
        projectRate: workerData.projectRate,
        availability: {
          monday: Math.random() > 0.3,
          tuesday: Math.random() > 0.3,
          wednesday: Math.random() > 0.3,
          thursday: Math.random() > 0.3,
          friday: Math.random() > 0.3,
          saturday: Math.random() > 0.5,
          sunday: Math.random() > 0.7
        },
        portfolio: [
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
          'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
        ],
        rating: Math.floor(Math.random() * 50) / 10 + 3.5, // 3.5-4.5 rating
        totalJobs: Math.floor(Math.random() * 50) + 10,
        totalEarnings: Math.floor(Math.random() * 50000) + 10000,
        isAvailable: Math.random() > 0.2,
        isVerified: Math.random() > 0.3,
        location: INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)],
        bio: `${workerData.name} is a skilled ${workerData.skills.join(', ')} with ${workerData.experience} of experience. Available for both daily and project-based work.`
      }
    })

    workers.push({ user, profile: workerProfile })
  }

  console.log(`✅ Created ${workers.length} workers with profiles`)

  // Create sample bookings
  const bookings = []
  for (let i = 0; i < 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const worker = workers[Math.floor(Math.random() * workers.length)]
    const statuses = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED']
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    const workDate = new Date()
    workDate.setDate(workDate.getDate() + Math.floor(Math.random() * 30) + 1)

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        workerId: worker.user.id,
        jobDescription: `Need ${worker.profile.skills[0]} for ${['home renovation', 'repair work', 'installation', 'maintenance'][Math.floor(Math.random() * 4)]}`,
        workDate,
        workTime: ['9:00 AM - 12:00 PM', '12:00 PM - 3:00 PM', '3:00 PM - 6:00 PM'][Math.floor(Math.random() * 3)],
        location: customer.address,
        pincode: customer.pincode,
        amount: worker.profile.dailyRate,
        status: status as any,
        paymentStatus: status === 'COMPLETED' ? 'PAID' : 'PENDING',
        customerNotes: 'Please arrive on time and bring necessary tools.',
        workerNotes: status === 'COMPLETED' ? 'Job completed successfully. Customer was satisfied.' : null
      }
    })
    bookings.push(booking)
  }

  console.log(`✅ Created ${bookings.length} sample bookings`)

  // Create sample reviews for completed bookings
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED')
  for (const booking of completedBookings.slice(0, 10)) {
    await prisma.review.create({
      data: {
        bookingId: booking.id,
        userId: booking.customerId,
        rating: Math.floor(Math.random() * 3) + 4, // 4-5 stars
        comment: [
          'Excellent work! Very professional and skilled.',
          'Great service, completed the job on time.',
          'Highly recommended. Will hire again.',
          'Good quality work at reasonable rates.',
          'Very satisfied with the service provided.'
        ][Math.floor(Math.random() * 5)]
      }
    })
  }

  console.log(`✅ Created ${completedBookings.length} reviews`)

  // Create sample messages
  for (let i = 0; i < 30; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const worker = workers[Math.floor(Math.random() * workers.length)]
    
    await prisma.message.create({
      data: {
        senderId: Math.random() > 0.5 ? customer.id : worker.user.id,
        receiverId: Math.random() > 0.5 ? customer.id : worker.user.id,
        content: [
          'Hi, are you available for work tomorrow?',
          'Yes, I can come. What time do you need me?',
          'Please bring your tools and arrive by 9 AM.',
          'Sure, I will be there on time.',
          'How much will you charge for this work?',
          'My rate is ₹800 per day for this type of work.',
          'That sounds good. When can you start?',
          'I can start tomorrow morning.',
          'Perfect! See you tomorrow.',
          'Thank you for the work. Payment done.'
        ][Math.floor(Math.random() * 10)],
        messageType: 'TEXT',
        isRead: Math.random() > 0.3
      }
    })
  }

  console.log('✅ Created sample messages')

  // Create sample favorites
  const favoritePairs = new Set();
  for (let i = 0; i < 15; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const worker = workers[Math.floor(Math.random() * workers.length)]
    
    const pairKey = `${customer.id}-${worker.user.id}`;
    if (!favoritePairs.has(pairKey)) {
      favoritePairs.add(pairKey);
      try {
        await prisma.favorite.create({
          data: {
            userId: customer.id,
            workerId: worker.user.id
          }
        })
      } catch (error) {
        console.log(`Skipping duplicate favorite: ${customer.id} -> ${worker.user.id}`)
      }
    }
  }

  console.log('✅ Created sample favorites')

  // Create sample notifications
  for (let i = 0; i < 20; i++) {
    const user = [...customers, ...workers.map(w => w.user)][Math.floor(Math.random() * (customers.length + workers.length))]
    
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: [
          'New Booking Request',
          'Payment Received',
          'Job Completed',
          'Worker Available',
          'Booking Confirmed'
        ][Math.floor(Math.random() * 5)],
        message: [
          'You have received a new booking request.',
          'Payment of ₹800 has been credited to your account.',
          'Your job has been marked as completed.',
          'A new worker is available in your area.',
          'Your booking has been confirmed by the worker.'
        ][Math.floor(Math.random() * 5)],
        type: ['INFO', 'SUCCESS', 'WARNING'][Math.floor(Math.random() * 3)] as any,
        isRead: Math.random() > 0.6
      }
    })
  }

  console.log('✅ Created sample notifications')

  console.log('🎉 Database seeding completed successfully!')
  console.log(`📊 Summary:`)
  console.log(`   - ${customers.length} customers`)
  console.log(`   - ${workers.length} workers`)
  console.log(`   - ${bookings.length} bookings`)
  console.log(`   - ${completedBookings.length} reviews`)
  console.log(`   - 30 messages`)
  console.log(`   - 15 favorites`)
  console.log(`   - 20 notifications`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })