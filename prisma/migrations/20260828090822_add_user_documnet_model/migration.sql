-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "UserDocuments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ktp_url" TEXT,
    "sim_url" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserDocuments_status_idx" ON "UserDocuments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserDocuments_user_id_key" ON "UserDocuments"("user_id");

-- AddForeignKey
ALTER TABLE "UserDocuments" ADD CONSTRAINT "UserDocuments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
