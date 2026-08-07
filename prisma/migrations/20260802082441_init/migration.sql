-- CreateEnum
CREATE TYPE "Status_vehicles" AS ENUM ('AVAILABLE', 'BOOKED', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RoleStatus" AS ENUM ('GUEST', 'CUSTOMER', 'ADMIN', 'SUPERADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "RoleStatus" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle_Categories" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "Vehicle_Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,

    CONSTRAINT "Brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicles" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "seat" TEXT NOT NULL,
    "status" "Status_vehicles" NOT NULL DEFAULT 'AVAILABLE',
    "thumbnail" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
