import { Prisma, Status_vehicles } from "../../../generated/prisma/client.js";
import { prisma } from "../../config/db.js";
import { CreateVehicleDto, UpdateVehicleDto } from "./vehicle.schema.js";
type Tx = Prisma.TransactionClient;
type VehicleStatusAction = "update" | "delete";

export const vehicleRepository = {
  create: async (data: CreateVehicleDto) => {
    return prisma.vehicles.create({
       data: {
        ...data,

        pricePerDay:
          new Prisma.Decimal(
            data.pricePerDay
          ),
      },
    });
  },

  get: async (page: number, limit: number) => {
    const total = await prisma.vehicles.count();
    const vehicles = await prisma.vehicles.findMany({
      include: {
        brand:true,
        category:true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    const totalPage = Math.ceil(total / limit);
    return {
      vehicles,
      pagination: {
        total,
        totalPage,
      },
    };
  },

  getById: async (id: string,tx?:Tx) => {
    const db = tx ?? prisma;
    return db.vehicles.findUnique({
      where: { id },
    });
  },

  update: async (id: string, data: UpdateVehicleDto) => {
    return prisma.vehicles.update({
      where: { id },
      data: {
        ...data,

        ...(data.pricePerDay !== undefined && {
          pricePerDay:
            new Prisma.Decimal(
              data.pricePerDay
            ),
          }),
        },
    });
  },
  updateStatus : async (id:string,status:Status_vehicles,tx?:Tx) => {
    const db = tx ?? prisma;
    
   
    return db.vehicles.update({
      where: {id},
      data : {
        status : status
      }
    })
  },

  delete: async (id: string) => {
    return prisma.vehicles.delete({
      where: { id },
    });
  },
};
