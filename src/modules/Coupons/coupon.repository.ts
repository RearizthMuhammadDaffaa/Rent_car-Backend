import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../config/db.js";
import { CreateCouponDto, UpdateCouponDto } from "./coupon.schema.js";
type Tx = Prisma.TransactionClient;

export const couponRepository = {
  create: async (data: CreateCouponDto) => {
    return prisma.coupons.create({
      data,
    });
  },

  get: async (page: number, limit: number) => {
    const total = await prisma.coupons.count();
    const coupons = await prisma.coupons.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    const totalPage = Math.ceil(total / limit);
    return {
      coupons,
      pagination: {
        total,
        totalPage,
      },
    };
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
  usageLimit: number | null,
  tx: Tx
) => {
  const result = await tx.coupons.updateMany({
    where: {
      id,
      ...(usageLimit !== null
        ? {
            usedCount: {
              lt: usageLimit,
            },
          }
        : {}),
    },
    data: {
      usedCount: {
        increment: 1,
      },
    },
  });

  return result.count;
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
