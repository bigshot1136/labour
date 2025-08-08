import { MongoClient, Db, GridFSBucket } from 'mongodb'
import mongoose from 'mongoose'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  retryWrites: true,
  w: 'majority' as const,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>
let db: Db
let gridFSBucket: GridFSBucket

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClient) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClient = client
  }
  client = globalWithMongo._mongoClient

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Initialize database and GridFS
clientPromise.then((client) => {
  db = client.db('digital_labour_chowk')
  gridFSBucket = new GridFSBucket(db, { bucketName: 'uploads' })
})

// Mongoose connection for ODM
let mongoose_connection: typeof mongoose | null = null

export async function connectMongoose() {
  if (mongoose_connection) {
    return mongoose_connection
  }

  try {
    mongoose_connection = await mongoose.connect(uri, {
      bufferCommands: false,
    })
    
    console.log('✅ MongoDB connected via Mongoose')
    return mongoose_connection
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

// Create indexes
export async function createIndexes() {
  try {
    const client = await clientPromise
    const db = client.db('digital_labour_chowk')

    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ phone: 1 }, { unique: true })
    await db.collection('users').createIndex({ role: 1 })
    await db.collection('users').createIndex({ verified: 1 })
    await db.collection('users').createIndex({ createdAt: 1 })

    // Profiles collection indexes
    await db.collection('profiles').createIndex({ userId: 1 }, { unique: true })
    await db.collection('profiles').createIndex({ skills: 1 })
    await db.collection('profiles').createIndex({ location: '2dsphere' })
    await db.collection('profiles').createIndex({ 'rating.avg': -1 })
    await db.collection('profiles').createIndex({ experienceYears: 1 })
    await db.collection('profiles').createIndex({ 'rate.value': 1 })

    // Jobs collection indexes
    await db.collection('jobs').createIndex({ contractorId: 1 })
    await db.collection('jobs').createIndex({ location: '2dsphere' })
    await db.collection('jobs').createIndex({ status: 1 })
    await db.collection('jobs').createIndex({ createdAt: -1 })
    await db.collection('jobs').createIndex({ startDate: 1 })
    await db.collection('jobs').createIndex({ skills: 1 })

    // Applications collection indexes
    await db.collection('applications').createIndex({ jobId: 1 })
    await db.collection('applications').createIndex({ labourerId: 1 })
    await db.collection('applications').createIndex({ status: 1 })
    await db.collection('applications').createIndex({ createdAt: -1 })

    // Contracts collection indexes
    await db.collection('contracts').createIndex({ jobId: 1 })
    await db.collection('contracts').createIndex({ contractorId: 1 })
    await db.collection('contracts').createIndex({ labourerId: 1 })
    await db.collection('contracts').createIndex({ status: 1 })

    // Payments collection indexes
    await db.collection('payments').createIndex({ contractId: 1 })
    await db.collection('payments').createIndex({ status: 1 })
    await db.collection('payments').createIndex({ createdAt: -1 })

    // Sessions collection with TTL index
    await db.collection('sessions').createIndex(
      { expiresAt: 1 }, 
      { expireAfterSeconds: 0 }
    )

    // Reports collection indexes
    await db.collection('reports').createIndex({ reportedUserId: 1 })
    await db.collection('reports').createIndex({ reporterId: 1 })
    await db.collection('reports').createIndex({ status: 1 })
    await db.collection('reports').createIndex({ createdAt: -1 })

    // Audit logs collection indexes
    await db.collection('audit_logs').createIndex({ userId: 1 })
    await db.collection('audit_logs').createIndex({ action: 1 })
    await db.collection('audit_logs').createIndex({ timestamp: -1 })

    console.log('✅ MongoDB indexes created successfully')
  } catch (error) {
    console.error('❌ Error creating MongoDB indexes:', error)
    throw error
  }
}

export { clientPromise, db, gridFSBucket }
export default clientPromise