#!/usr/bin/env tsx

import { connectMongoose, createIndexes } from '../lib/mongodb'
import { AirtableMigrationService } from '../lib/migration/airtable-migration'

async function setupMongoDB() {
  console.log('🚀 Setting up MongoDB for Digital Labour Chowk...')

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...')
    await connectMongoose()
    console.log('✅ Connected to MongoDB')

    // Create indexes
    console.log('📊 Creating database indexes...')
    await createIndexes()
    console.log('✅ Database indexes created')

    // Run migration if Airtable is configured
    if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
      console.log('📋 Starting Airtable migration...')
      const migrationResult = await AirtableMigrationService.migrateAll()
      
      if (migrationResult.success) {
        console.log('✅ Airtable migration completed successfully')
        console.log(`   - Users migrated: ${migrationResult.migrated.users}`)
        console.log(`   - Profiles migrated: ${migrationResult.migrated.profiles}`)
        console.log(`   - Jobs migrated: ${migrationResult.migrated.jobs}`)
      } else {
        console.log('⚠️  Airtable migration completed with errors:')
        migrationResult.errors.forEach(error => console.log(`   - ${error}`))
      }
    } else {
      console.log('⏭️  Skipping Airtable migration (not configured)')
    }

    console.log('🎉 MongoDB setup completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Update your .env file with MongoDB connection string')
    console.log('2. Configure messaging services (MSG91, SendGrid)')
    console.log('3. Set up file storage (AWS S3 or use GridFS)')
    console.log('4. Run the application: npm run dev')

  } catch (error) {
    console.error('❌ MongoDB setup failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Run setup if called directly
if (require.main === module) {
  setupMongoDB()
}

export { setupMongoDB }