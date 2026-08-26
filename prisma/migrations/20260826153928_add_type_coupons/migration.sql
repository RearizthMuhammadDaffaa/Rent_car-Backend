-- CreateEnum
CREATE TYPE "CouponsType" AS ENUM ('FIXED', 'PERCENTAGE');

-- AlterTable
ALTER TABLE "Coupons" ADD COLUMN     "type" "CouponsType" NOT NULL DEFAULT 'PERCENTAGE';
