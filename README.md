# Digital Labour Chowk - Complete Implementation

A comprehensive platform connecting skilled daily wage workers (labourers) with contractors across India. Built with Next.js, MongoDB, and modern web technologies.

## 🚀 Features

### For Labourers
- **Profile Management**: Complete profile with skills, experience, location, and rates
- **Document Upload**: ID verification, certificates, and portfolio
- **Job Discovery**: AI-powered job matching based on skills and location
- **Application System**: Apply for jobs with custom proposals
- **Live Location**: Optional real-time location sharing
- **Availability Calendar**: Set working hours and availability
- **Rating System**: Build reputation through customer reviews

### For Contractors
- **Job Posting**: Create detailed job postings with requirements
- **Worker Search**: Advanced filtering by skills, location, rating, and rates
- **Application Management**: Review and respond to applications
- **Contract Generation**: Digital contracts with e-signatures
- **Payment Tracking**: Milestone-based payment system
- **Direct Messaging**: Communicate with workers

### For Admins
- **User Verification**: Manual verification workflow
- **Fraud Detection**: AI-powered fraud detection and flagging
- **Dispute Resolution**: Handle reports and disputes
- **Analytics Dashboard**: Platform usage and performance metrics
- **Content Moderation**: Review and moderate user content

## 🛠 Technology Stack

### Frontend
- **Next.js 13+** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/UI** components
- **Zustand** for state management

### Backend
- **Node.js** with Express-style API routes
- **MongoDB** with Mongoose ODM
- **JWT** authentication with refresh tokens
- **GridFS** for file storage
- **Rate limiting** and security middleware

### External Services
- **MongoDB Atlas** - Primary database
- **AWS S3** - File storage (with GridFS fallback)
- **MSG91** - SMS/WhatsApp messaging
- **SendGrid** - Email notifications
- **Airtable** - Admin workflows and automation

### AI & Matching
- **Skill Matching Algorithm** - Vector-based similarity scoring
- **Rate Suggestion Engine** - Market-based rate recommendations
- **Fraud Detection** - Heuristic and pattern-based detection
- **Geo-spatial Queries** - Location-based job matching

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- AWS S3 bucket (optional, GridFS used as fallback)
- MSG91 account for SMS
- SendGrid account for emails
- Airtable account (optional, for admin workflows)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd digital-labour-chowk
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```env
# Database
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/digital_labour_chowk"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-token-secret"

# Messaging
MSG91_AUTH_KEY="your-msg91-auth-key"
MSG91_TEMPLATE_ID="your-template-id"
MSG91_SENDER_ID="your-sender-id"
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@labourchowk.com"

# File Storage (Optional)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="labour-chowk-uploads"
```

### 3. MongoDB Setup

Run the setup script to create indexes and migrate data:

```bash
npm run setup:mongodb
```

Or manually:

```bash
npx tsx scripts/setup-mongodb.ts
```

### 4. Database Migration (Optional)

If you have existing Airtable data:

```bash
# Configure Airtable credentials in .env
AIRTABLE_API_KEY="your-airtable-api-key"
AIRTABLE_BASE_ID="your-base-id"

# Run migration
npm run migrate:airtable
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📊 MongoDB Setup Guide

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster in your preferred region (Mumbai recommended for India)
3. Choose M0 (free tier) for development

### 2. Database Configuration

- **Database Name**: `digital_labour_chowk`
- **Collections**: `users`, `profiles`, `jobs`, `applications`, `contracts`, `payments`, `reports`, `audit_logs`

### 3. Indexes (Auto-created by setup script)

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { unique: true })

// Profiles  
db.profiles.createIndex({ location: "2dsphere" })
db.profiles.createIndex({ skills: 1 })
db.profiles.createIndex({ "rating.avg": -1 })

// Jobs
db.jobs.createIndex({ location: "2dsphere" })
db.jobs.createIndex({ skills: 1 })
db.jobs.createIndex({ status: 1 })

// Applications
db.applications.createIndex({ jobId: 1, labourerId: 1 }, { unique: true })
```

### 4. Security Setup

1. **Network Access**: Add your IP or use 0.0.0.0/0 for development
2. **Database User**: Create user with `readWrite` permissions
3. **Connection String**: Use in `MONGODB_URI` environment variable

## 🔧 API Documentation

### Authentication Endpoints

```
POST /api/auth/register-mongo    # Register new user
POST /api/auth/login            # Login user  
POST /api/auth/verify-otp       # Verify OTP
POST /api/auth/refresh          # Refresh JWT token
POST /api/auth/logout           # Logout user
```

### Profile Endpoints

```
GET    /api/profiles           # Get user profile
POST   /api/profiles           # Create profile
PUT    /api/profiles           # Update profile
POST   /api/upload-mongo       # Upload files
```

### Job Endpoints

```
GET    /api/jobs-mongo         # Search jobs
POST   /api/jobs-mongo         # Create job
GET    /api/jobs-mongo/:id     # Get job details
PUT    /api/jobs-mongo/:id     # Update job
DELETE /api/jobs-mongo/:id     # Delete job
```

### Application Endpoints

```
GET    /api/applications       # Get applications
POST   /api/applications       # Apply for job
GET    /api/applications/:id   # Get application
PUT    /api/applications/:id   # Update application status
```

### Matching & AI Endpoints

```
POST   /api/match              # Find matching workers
POST   /api/rate-suggestion    # Get rate suggestions
```

### Admin Endpoints

```
POST   /api/admin/fraud-check  # Check user for fraud
GET    /api/admin/fraud-check  # Run auto-flagging
```

## 🤖 AI Features

### 1. Skill Matching Algorithm

The matching system uses a weighted scoring algorithm:

- **Skill Match (40%)**: Exact skill overlap
- **Distance (20%)**: Geographic proximity  
- **Rate Compatibility (15%)**: Price alignment
- **Availability (10%)**: Schedule compatibility
- **Experience (10%)**: Years of experience
- **Rating (5%)**: Customer ratings

### 2. Rate Suggestion Engine

Analyzes market data to suggest competitive rates:

- Local market analysis within 25km radius
- Experience-based adjustments (+5% per year)
- Skill-specific base rates
- Supply/demand indicators

### 3. Fraud Detection

Multi-layered fraud detection system:

- **Duplicate Detection**: Phone numbers, documents
- **Behavioral Analysis**: Login patterns, rapid registrations
- **Profile Validation**: Fake names, unrealistic rates
- **Report History**: User complaint patterns

## 📱 Mobile Support

The application is built as a Progressive Web App (PWA) with:

- **Responsive Design**: Works on all screen sizes
- **Touch Optimized**: Mobile-first interactions
- **Offline Support**: Basic functionality without internet
- **Push Notifications**: Job alerts and updates (planned)

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Rate Limiting** on all API endpoints
- **Input Validation** using Zod schemas
- **SQL Injection Protection** via Mongoose ODM
- **File Upload Validation** with type and size limits
- **CORS Configuration** for cross-origin requests
- **Helmet.js** for security headers

## 📈 Performance Optimizations

- **Database Indexing** for fast queries
- **Connection Pooling** for MongoDB
- **Image Optimization** with Next.js
- **Code Splitting** for smaller bundles
- **Caching** for static assets
- **Lazy Loading** for components

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests  
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t labour-chowk .
docker run -p 3000:3000 labour-chowk
```

### Vercel Deployment
```bash
npm install -g vercel
vercel --prod
```

## 📊 Monitoring & Analytics

- **Error Tracking**: Integrated error logging
- **Performance Monitoring**: API response times
- **User Analytics**: Registration and usage metrics
- **Database Monitoring**: MongoDB Atlas monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Email**: support@labourchowk.com
- **Documentation**: [docs.labourchowk.com](https://docs.labourchowk.com)
- **Issues**: GitHub Issues tab

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Core platform functionality
- ✅ MongoDB integration
- ✅ Basic AI matching
- ✅ File upload system

### Phase 2 (Next)
- 🔄 Advanced AI features
- 🔄 Payment gateway integration
- 🔄 Mobile app (React Native)
- 🔄 Multi-language support

### Phase 3 (Future)
- 📋 Video calling integration
- 📋 Advanced analytics
- 📋 Marketplace features
- 📋 Enterprise solutions

---

**Built with ❤️ for the Indian labour community**