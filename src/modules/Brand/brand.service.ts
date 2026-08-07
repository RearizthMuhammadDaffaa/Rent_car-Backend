import { prisma } from "../../config/db";
import { NotFoundError } from "../../errors/NotFoundError";
import { BrandType } from "../../shared/types/types";
import { brandRepository } from "./brand.repository";
import { createBrandSchema, updateBrandSchema , type UpdateBrandDto } from "./brand.schema";

export const BrandService = {
  createBrand : async (data: {
    name:string,
    logo?:string
  }) => {
     const brandSchema = createBrandSchema.parse(data)
    return await brandRepository.create(brandSchema)
  },
  getBrands : async () => {
    const brands = await brandRepository.get()
    return brands
  },
  getBrandById: async (id:string) => {
    return await brandRepository.getbyId(id)
  },
  updateBrand: async (id:string,data:UpdateBrandDto) =>{
    const brand = await brandRepository.getbyId(id);

    if(!brand){
      throw new NotFoundError("Brand Not Found")
    }
   
     const validatedData = updateBrandSchema.parse(data)
  


    return await brandRepository.update(id,validatedData)
  },
  deleteBrand : async (id:string) => {
    const brand = await brandRepository.getbyId(id);

    if(!brand){
      throw new NotFoundError("Brand Not Found")
    }

    return await brandRepository.delete(id)
  }
}