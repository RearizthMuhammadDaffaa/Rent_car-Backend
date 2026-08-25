import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../config/db";
import { CreateBookingDto, UpdateBookingDto } from "./booking.schema";


export const BookingRepository = {
  create: async (data: Prisma.BookingsCreateInput) => {
    return prisma.bookings.create({
      data,
    });
  },
  get : async () => {
    return await prisma.bookings.findMany();
  },
  getbyId : async (id:string) => {
    return await prisma.bookings.findUnique({
      where : {id}
    })
  },
  update : async (id:string,data:UpdateBookingDto) =>{
    return await prisma.bookings.update({
      where: {id},
      data
    })
  },
  delete : async (id:string) => {
    return await prisma.bookings.delete({
      where : {id}
    })
  },
    findOverlapping: async (
    carId: string,
    pickupAt: Date,
    returnAt: Date
  ) => {
    return prisma.bookings.findFirst({
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
};