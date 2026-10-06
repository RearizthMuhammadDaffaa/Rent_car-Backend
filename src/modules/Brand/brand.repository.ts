import {prisma} from "../../config/db.js";
import { BrandType } from "../../shared/types/types.js";
import { CreateBrandDto, UpdateBrandDto } from "./brand.schema.js";



export const brandRepository = {
  create: async (data: CreateBrandDto) => {
    return prisma.brands.create({
      data,
    });
  },
  get : async () => {
    return await prisma.brands.findMany();
  },
  getbyId : async (id:string) => {
    return await prisma.brands.findUnique({
      where : {id}
    })
  },
  update : async (id:string,data:UpdateBrandDto) =>{
    return await prisma.brands.update({
      where: {id},
      data
    })
  },
  delete : async (id:string) => {
    return await prisma.brands.delete({
      where : {id}
    })
  }
};


