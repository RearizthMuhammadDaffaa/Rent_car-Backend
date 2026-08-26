import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../config/db";
import { NotFoundError } from "../../errors/NotFoundError";
import { userParamDto } from "../authentication/auth.schema";
import { couponRepository } from "../Coupons/coupon.repository";
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
      const totalDays = Math.ceil(
        (data.return_at.getTime() - data.pickup_at.getTime()) /
          (1000 * 60 * 60 * 24),
      );
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
         if (coupon.type === "PERCENTAGE") {
      discount = subtotal.mul(coupon.discountValue).div(100);

    if (coupon.maximumDiscount && discount.greaterThan(coupon.maximumDiscount)) {
      discount = coupon.maximumDiscount;
    }
  }

        // Discount tidak boleh
        // lebih besar dari subtotal
        if (discount.greaterThan(subtotal)) {
          discount = subtotal;
        }

         // Increment usage
        await couponRepository.incrementUsedCount(
          coupon.id,
          tx
        );
      }

      // tax
      const taxableAmount = subtotal.sub(discount);

      const tax = taxableAmount.mul(11).div(100);
      // grand total
      const grandTotal = taxableAmount.add(tax);

      // create booking
      const booking = await tx.bookings.create({
        data: {
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
      });

      await vehicleRepository.updateStatus(data.car_id,tx)

      return booking;
    });
  },
  getBooking: async () => {
    const booking = await BookingRepository.get();
    return booking;
  },
  getBookingById: async (id: string) => {
    return await BookingRepository.getbyId(id);
  },
  updateBooking: async (id: string, data: UpdateBookingDto) => {
    const booking = await BookingRepository.getbyId(id);

    if (!booking) {
      throw new NotFoundError("Vehile Categories Not Found");
    }

    const validatedData = updateBookingSchema.parse(data);

    return await BookingRepository.update(id, validatedData);
  },
  deleteBooking: async (id: string) => {
    const booking = await BookingRepository.getbyId(id);

    if (!booking) {
      throw new NotFoundError("Vehile Categories Not Found");
    }

    return await BookingRepository.delete(id);
  },
};
