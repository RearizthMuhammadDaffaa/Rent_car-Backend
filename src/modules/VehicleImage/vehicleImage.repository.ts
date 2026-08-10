import { prisma } from "../../config/db";
import { CreateVehicleImageDto, UpdateVehicleImageDto } from "./vehicleImage.schema";

export const vehicleImageRepository = {
  create: async (data: CreateVehicleImageDto) => {
    return prisma.vehicleImage.create({
      data,
    });
  },

  get: async () => {
    return prisma.vehicleImage.findMany();
  },

  getById: async (id: string) => {
    return prisma.vehicleImage.findUnique({
      where: { id },
    });
  },

  update: async (id: string, data: UpdateVehicleImageDto) => {
    return prisma.vehicleImage.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.vehicleImage.delete({
      where: { id },
    });
  },
};
