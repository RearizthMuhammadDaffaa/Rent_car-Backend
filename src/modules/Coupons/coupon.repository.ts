import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../config/db";
import { CreateCouponDto, UpdateCouponDto } from "./coupon.schema";
type Tx = Prisma.TransactionClient;

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

   getByCode: async (
    code: string,
    tx: Tx
  ) => {
    return tx.coupons.findUnique({
      where: {
        code,
      },
    });
  },

  incrementUsedCount: async (
    id: string,
    tx: Tx
  ) => {
    return tx.coupons.update({
      where: {
        id,
      },
      data: {
        usedCount: {
          increment: 1,
        },
      },
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
