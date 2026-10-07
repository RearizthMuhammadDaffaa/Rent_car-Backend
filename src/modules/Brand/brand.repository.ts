import {prisma} from "../../config/db.js";
import { BrandType } from "../../shared/types/types.js";
import { CreateBrandDto, UpdateBrandDto } from "./brand.schema.js";



export const brandRepository = {
  create: async (data: CreateBrandDto) => {
    return prisma.brands.create({
      data,
    });
  },
  get : async (page:number,limit:number) => {
    const total = await prisma.brands.count();
    const brands =  await prisma.brands.findMany({
      skip:(page - 1) * limit,
      take:limit,
    });
    const totalPage = Math.ceil(total/limit);
    return {
      brands,
      pagination: {
        total,
        totalPage
      }
    }
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


