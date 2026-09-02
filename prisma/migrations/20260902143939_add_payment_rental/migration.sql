/*
  Warnings:

  - A unique constraint covering the columns `[Booking_id]` on the table `Rental` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Payments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_type" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "snap_token" TEXT,
    "redirect_url" TEXT,
    "paid_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payments_booking_id_key" ON "Payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_order_id_key" ON "Payments"("order_id");

-- CreateIndex
CREATE INDEX "Payments_status_idx" ON "Payments"("status");

-- CreateIndex
CREATE INDEX "Payments_transaction_id_idx" ON "Payments"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "Rental_Booking_id_key" ON "Rental"("Booking_id");

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
