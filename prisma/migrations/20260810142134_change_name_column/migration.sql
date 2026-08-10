/*
  Warnings:

  - You are about to drop the column `logoPublicId` on the `VehicleImage` table. All the data in the column will be lost.
  - You are about to drop the column `logoPublicId` on the `Vehicles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VehicleImage" DROP COLUMN "logoPublicId",
ADD COLUMN     "imagePublicId" TEXT;

-- AlterTable
ALTER TABLE "Vehicles" DROP COLUMN "logoPublicId",
ADD COLUMN     "thumbnailPublicId" TEXT;
