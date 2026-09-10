import { BookingStatus, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../config/db";
import { BadRequestError } from "../../errors/BadRequestError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { NotFoundError } from "../../errors/NotFoundError";
import { calculateTotalDays } from "../../shared/utils/rental-calculator";
import { userParamDto } from "../authentication/auth.schema";
import { couponRepository } from "../Coupons/coupon.repository";
import { documentRepository } from "../DocumentVerification/document.repository";
import { vehicleRepository } from "../Vehicle/vehicle.repository";
import { BookingRepository } from "./booking.repository";
import {
  CreateBookingDto,
  UpdateBookingDto,
  updateBookingSchema,
} from "./booking.schema";

export const BookingService = {
  createBooking: async (userId: string, data: CreateBookingDto) => {
    //  const vehicleCatSchema = createVehicleCatSchema.parse(data)
    // return await BookingRepository.create(vehicleCatSchema)
    return prisma.$transaction(async (tx) => {
      const approvedDocuments = await documentRepository.findApprovedByUserId(userId, tx);
      if (!approvedDocuments) {
        throw new Error("Dokumen KTP dan SIM harus sudah APPROVED sebelum booking");
      }

      // get Vehicle
      const vehicle = await vehicleRepository.getById(data.car_id,tx);
      if (!vehicle) {
        throw new Error("Vehicle tidak ditemukan");
      }

      //  check vehicle status
      if (vehicle.status !== "AVAILABLE") {
        throw new Error("Mobil Tidak Tersedia");
      }

      // Validate Date
      if (data.return_at <= data.pickup_at)
        throw new Error("Return Date harus setelah pickup");

      // check availability
      const existingBooking = await BookingRepository.findOverlapping(
        data.car_id,
        data.pickup_at,
        data.return_at,
        tx
      );

      if (existingBooking) {
        throw new Error("Vehicle sudah dibooking pada tanggal tersebut");
      }
      // calculate days
      const totalDays = calculateTotalDays(
        data.pickup_at,
        data.return_at
      )
      // price
      const pricePerDay = new Prisma.Decimal(vehicle.pricePerDay);

      const subtotal = pricePerDay.mul(totalDays);

      //  coupon
      let couponId:string | undefined;
      let discount = new Prisma.Decimal(0);

      if (data.coupon_code) {
        const coupon = await couponRepository.getByCode(data.coupon_code,tx);

        if (!coupon) {
          throw new Error("Coupon tidak ditemukan");
        }

        if (!coupon.isActive) {
          throw new Error("Coupon tidak aktif");
        }

        const now = new Date();

        // if (now < coupon.expiredAt) {
        //   throw new Error(
        //     "Coupon belum aktif"
        //   );
        // }

        if (now > coupon.expiredAt) {
          throw new Error("Coupon sudah expired");
        }

        if (
          coupon.usageLimit !== null &&
          coupon.usedCount >= coupon.usageLimit
        ) {
          throw new Error("Coupon sudah mencapai batas penggunaan");
        }

        couponId = coupon.id;

        const updated = await couponRepository.incrementUsedCount(
          coupon.id,
          coupon.usageLimit,
          tx
        );

        if (updated === 0) {
          throw new Error("Coupon sudah mencapai batas penggunaan");
        }


       if (coupon.type === "PERCENTAGE") {
            discount = subtotal
              .mul(coupon.discountValue)
              .div(100);

  if (
    coupon.maximumDiscount &&
    discount.greaterThan(coupon.maximumDiscount)
  ) {
    discount = coupon.maximumDiscount;
  }
} else if (coupon.type === "FIXED") {
  discount = new Prisma.Decimal(coupon.discountValue);
}

        // Discount tidak boleh
        // lebih besar dari subtotal
        if (discount.greaterThan(subtotal)) {
          discount = subtotal;
        }

      
      }

      // tax
      const taxableAmount = subtotal.sub(discount);

      const tax = taxableAmount.mul(11).div(100);
      // grand total
      const grandTotal = taxableAmount.add(tax);

      // create booking
      const booking = await BookingRepository.create(
         {
          user: {
            connect: {
              id: userId,
            },
          },

          car: {
            connect: {
              id: data.car_id,
            },
          },

          coupon: couponId
            ? {
                connect: {
                  id: couponId,
                },
              }
            : undefined,

          pickup_at: data.pickup_at,

          return_at: data.return_at,

          total_days: totalDays,

          pricePerDay,

          subtotal,

          discount,

          tax,

          grandTotal,

          status: "PENDING",
        },
        tx
      );

      

      return booking;
    });
  },
  getBooking: async (user_id:string) => {
    const booking = await BookingRepository.get(user_id);
    return booking;
  },
  getBookingById: async (id: string) => {
    return await BookingRepository.getbyId(id);
  },
  updateBooking: async (id: string, data: UpdateBookingDto) => {
    const booking = await BookingRepository.getbyId(id);

    if (!booking) {
      throw new NotFoundError("Booking Not Found");
    }

    const validatedData = updateBookingSchema.parse(data);

    return await BookingRepository.update(id, validatedData);
  },
  // deleteBooking: async (id: string) => {

  //   return prisma.$transaction(async (tx) => {
  //   const booking = await BookingRepository.getbyId(id,tx);
    
  //   if (!booking) {
  //     throw new NotFoundError("Booking Not Found");
  //   }

    

  //   await vehicleRepository.updateStatus(booking.car_id,Status_vehicles.AVAILABLE,tx)
  //   return  BookingRepository.delete(id,tx);
  //   })
    
  // },
  cancelBooking : async (id:string,userId:string) => {
    return prisma.$transaction(async (tx) => {

    // 1. Cari booking
    const booking = await BookingRepository.getbyId(id, tx);

    if (!booking) {
      throw new NotFoundError("Booking tidak ditemukan");
    }

    if (booking.user_id !== userId) {
    throw new ForbiddenError("Anda tidak memiliki akses ke booking ini");
  }

    if (booking.status !== BookingStatus.PENDING) {
    throw new BadRequestError(
      "Booking hanya dapat dibatalkan saat status PENDING"
    );
}

    // 3. Cancel booking
    const cancelledBooking =
      await BookingRepository.updateStatus(
        id,
        BookingStatus.CANCELLED,
        tx
      );

    // 4. Kembalikan vehicle menjadi AVAILABLE
    // await vehicleRepository.updateStatus(
    //   booking.car_id,
    //   Status_vehicles.AVAILABLE,
    //   tx
    // );

    return cancelledBooking;
  });
  }
};
