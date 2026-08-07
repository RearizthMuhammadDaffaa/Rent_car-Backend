import { prisma } from "../../config/db";
import { CreateVehicleDto, UpdateVehicleDto } from "./vehicle.schema";

export const vehicleRepository = {
  create: async (data: CreateVehicleDto) => {
    return prisma.vehicles.create({
      data,
    });
  },

  get: async () => {
    return prisma.vehicles.findMany();
  },

  getById: async (id: string) => {
    return prisma.vehicles.findUnique({
      where: { id },
    });
  },

  update: async (id: string, data: UpdateVehicleDto) => {
    return prisma.vehicles.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.vehicles.delete({
      where: { id },
    });
  },
};
