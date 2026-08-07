/*
  Warnings:

  - Made the column `name` on table `Vehicle_Categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Vehicle_Categories" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
