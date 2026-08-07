import { prisma } from "../../config/db";
import { CreateVehicleCatDto, UpdateVehicleCatDto } from "./vehicleCat.schema";

export const VehicleCatRepository = {
  create: async (data: CreateVehicleCatDto) => {
    return prisma.vehicle_Categories.create({
      data,
    });
  },
  get : async () => {
    return await prisma.vehicle_Categories.findMany();
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