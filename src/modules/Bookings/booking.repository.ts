import { BookingStatus, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../config/db";
import { CreateBookingDto, UpdateBookingDto } from "./booking.schema";
type Tx = Prisma.TransactionClient;

export const BookingRepository = {
  create: async (data: Prisma.BookingsCreateInput,tx?:Tx) => {
    const db = tx ?? prisma
    return db.bookings.create({
      data,
    });
  },
  get : async () => {
    return await prisma.bookings.findMany();
  },
  getbyId : async (id:string,tx?:Tx) => {
     const db = tx ?? prisma
    return await db.bookings.findUnique({
      where : {id}
    })
  },
  update : async (id:string,data:UpdateBookingDto) =>{
    return await prisma.bookings.update({
      where: {id},
      data
    })
  },
  delete : async (id:string,tx?:Tx) => {
    const db = tx ?? prisma
    return await db.bookings.delete({
      where : {id}
    })
  },
    findOverlapping: async (
    carId: string,
    pickupAt: Date,
    returnAt: Date,
    tx?:Tx
  ) => {
    const db = tx ?? prisma
    return db.bookings.findFirst({
      where: {
        car_id: carId,

        status: {
          in: [
            "PENDING",
            "CONFIRMED",
          ],
        },

        pickup_at: {
          lt: returnAt,
        },

        return_at: {
          gt: pickupAt,
        },
      },
    });
  },
  updateStatus: async (
  id: string,
  status: BookingStatus,
  tx?: Tx
) => {
  const db = tx ?? prisma;

  return db.bookings.update({
    where: { id },
    data: { status },
  });
},
};