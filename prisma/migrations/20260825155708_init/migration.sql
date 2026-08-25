-- CreateEnum
CREATE TYPE "RoleStatus" AS ENUM ('GUEST', 'CUSTOMER', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "Status_vehicles" AS ENUM ('AVAILABLE', 'BOOKED', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('RESERVED', 'PICKED_UP', 'ONGOING', 'RETURNED', 'COMPLETED');

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
CREATE TABLE "Vehicles" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "pricePerDay" DECIMAL(65,30) NOT NULL,
    "color" TEXT NOT NULL,
    "seat" TEXT NOT NULL,
    "status" "Status_vehicles" NOT NULL DEFAULT 'AVAILABLE',
    "thumbnail" TEXT NOT NULL,
    "thumbnailPublicId" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "logoPublicId" TEXT,

    CONSTRAINT "Brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle_Categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Vehicle_Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountValue" DECIMAL(65,30) NOT NULL,
    "usageLimit" INTEGER NOT NULL,
    "usedCount" INTEGER NOT NULL,
    "maximumDiscount" DECIMAL(65,30) NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleImage" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "imagePublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "car_id" TEXT NOT NULL,
    "coupon_id" TEXT,
    "pickup_at" TIMESTAMP(3) NOT NULL,
    "return_at" TIMESTAMP(3) NOT NULL,
    "total_days" INTEGER NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "grandTotal" DECIMAL(65,30) NOT NULL,
    "pricePerDay" DECIMAL(12,2),
    "tax" DECIMAL(65,30),
    "discount" DECIMAL(65,30),
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rental" (
    "id" TEXT NOT NULL,
    "Booking_id" TEXT NOT NULL,
    "actual_pickup_at" TIMESTAMP(3) NOT NULL,
    "actual_return_at" TIMESTAMP(3) NOT NULL,
    "late_fee" DECIMAL(65,30) NOT NULL,
    "damage_fee" DECIMAL(65,30) NOT NULL,
    "Status" "RentalStatus" NOT NULL DEFAULT 'RESERVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Bookings_car_id_pickup_at_return_at_idx" ON "Bookings"("car_id", "pickup_at", "return_at");

-- CreateIndex
CREATE INDEX "Bookings_user_id_idx" ON "Bookings"("user_id");

-- CreateIndex
CREATE INDEX "Bookings_coupon_id_idx" ON "Bookings"("coupon_id");

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Vehicle_Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleImage" ADD CONSTRAINT "VehicleImage_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "Vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "Coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_Booking_id_fkey" FOREIGN KEY ("Booking_id") REFERENCES "Bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
