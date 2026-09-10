
import { prisma } from "../../config/db";
import { Prisma } from "../../../generated/prisma/client";

export const paymentRepository = {
  create: async (
    data: Prisma.PaymentsCreateInput
  ) => {
    return await prisma.payments.create({
      data,
    });
  },

  get: async () => {
    return await prisma.payments.findMany({
      include: {
        booking: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  },

  getById: async (id: string) => {
    return await prisma.payments.findUnique({
      where: {
        id,
      },
      include: {
        booking: {
          select : {
            user_id:true
          }
        },
      },
    });
  },

  getByBookingId: async (bookingId: string) => {
    return await prisma.payments.findUnique({
      where: {
        booking_id: bookingId,
      },
      include : {
        booking: {
          select: {
            user_id:true
          }
        }
      }
    });
  },

  getByOrderId: async (orderId: string) => {
    return await prisma.payments.findUnique({
      where: {
        order_id: orderId,
      },
      include: {
        booking: true,
      },
    });
  },

  update: async (
    id: string,
    data: Prisma.PaymentsUpdateInput
  ) => {
    return await prisma.payments.update({
      where: {
        id,
      },
      data,
    });
  },
};

