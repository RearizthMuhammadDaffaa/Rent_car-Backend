-- CreateTable
CREATE TABLE "Coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountValue" DECIMAL(65,30) NOT NULL,
    "usageLimit" INTEGER NOT NULL,
    "usedCount" INTEGER NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupons_pkey" PRIMARY KEY ("id")
);
