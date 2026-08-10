import { prisma } from "../../config/db";
import { CreateCouponDto, UpdateCouponDto } from "./coupon.schema";

export const couponRepository = {
  create: async (data: CreateCouponDto) => {
    return prisma.coupons.create({
      data,
    });
  },

  get: async () => {
    return prisma.coupons.findMany();
  },

  getById: async (id: string) => {
    return prisma.coupons.findUnique({
      where: { id },
    });
  },

  update: async (id: string, data: UpdateCouponDto) => {
    return prisma.coupons.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.coupons.delete({
      where: { id },
    });
  },
};
