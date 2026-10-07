import { prisma } from "../../config/db.js";
import { CreateVehicleCatDto, UpdateVehicleCatDto } from "./vehicleCat.schema.js";

export const VehicleCatRepository = {
  create: async (data: CreateVehicleCatDto) => {
    return prisma.vehicle_Categories.create({
      data,
    });
  },
  get : async (page: number, limit: number) => {
    const total = await prisma.vehicle_Categories.count();
    const vehiclesCat = await prisma.vehicle_Categories.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
    const totalPage = Math.ceil(total / limit);
    return {
      vehiclesCat,
      pagination: {
        total,
        totalPage,
      },
    };
  },
  getbyId : async (id:string) => {
    return await prisma.vehicle_Categories.findUnique({
      where : {id}
    })
  },
  update : async (id:string,data:UpdateVehicleCatDto) =>{
    return await prisma.vehicle_Categories.update({
      where: {id},
      data
    })
  },
  delete : async (id:string) => {
    return await prisma.vehicle_Categories.delete({
      where : {id}
    })
  }
};