import { prisma } from "../../config/db.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { cloudinaryService } from "../../shared/service/cloudinary.service.js";
import { BrandType } from "../../shared/types/types.js";
import { brandRepository } from "./brand.repository.js";
import {
  createBrandSchema,
  updateBrandSchema,
  type UpdateBrandDto,
} from "./brand.schema.js";

export const BrandService = {
  createBrand: async (data: {
    name: string;
    logo?: string;
    logoPublicId?: string;
  }) => {
    const brandSchema = createBrandSchema.parse(data);
    return await brandRepository.create(brandSchema);
  },
  getBrands: async () => {
    const brands = await brandRepository.get();
    return brands;
  },
  getBrandById: async (id: string) => {
    return await brandRepository.getbyId(id);
  },
  updateBrand: async (id: string, data: UpdateBrandDto) => {
    const brand = await brandRepository.getbyId(id);

    if (!brand) {
      throw new NotFoundError("Brand Not Found");
    }

    const validatedData = updateBrandSchema.parse(data);
    const updatedBrand = await brandRepository.update(id, validatedData);

    if (
      validatedData.logo &&
      validatedData.logoPublicId &&
      brand.logoPublicId
    ) {
      await cloudinaryService.deleteImage(brand.logoPublicId);
    }

    return updatedBrand;
  },
  deleteBrand: async (id: string) => {
    const brand = await brandRepository.getbyId(id);

    if (!brand) {
      throw new NotFoundError("Brand Not Found");
    }

    if (brand.logoPublicId) {
      await cloudinaryService.deleteImage(brand.logoPublicId);
    }

    return await brandRepository.delete(id);
  },
};
