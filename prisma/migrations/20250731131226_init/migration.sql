-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CUSTOMER', 'WORKER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'CUSTOMER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "pincode" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "aadhaar" TEXT NOT NULL,
    "profilePic" TEXT,
    "skills" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "projectRate" DOUBLE PRECISION NOT NULL,
    "availability" TEXT NOT NULL,
    "portfolio" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "workTime" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerProfile_userId_key" ON "public"."WorkerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "public"."Review"("bookingId");

-- AddForeignKey
ALTER TABLE "public"."WorkerProfile" ADD CONSTRAINT "WorkerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
