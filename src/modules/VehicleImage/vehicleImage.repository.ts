import { prisma } from "../../config/db.js";
import { CreateVehicleImageDto, UpdateVehicleImageDto } from "./vehicleImage.schema.js";

export const vehicleImageRepository = {
  create: async (data: CreateVehicleImageDto) => {
    return prisma.vehicleImage.create({
      data,
    });
  },

  get: async (page: number, limit: number) => {
    const total = await prisma.vehicleImage.count();
    const vehicleImages = await prisma.vehicleImage.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    const totalPage = Math.ceil(total / limit);
    return {
      vehicleImages,
      pagination: {
        total,
        totalPage,
      },
    };
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
