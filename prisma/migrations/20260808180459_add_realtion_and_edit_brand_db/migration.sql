-- AlterTable
ALTER TABLE "Brands" ADD COLUMN     "logoPublicId" TEXT,
ALTER COLUMN "logo" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Vehicle_Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
